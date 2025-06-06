
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface TopProduct {
  nome: string;
  categoria: string;
  total_vendido: number;
  quantidade_total: number;
  valor_total: number;
}

interface NeighborhoodStats {
  bairro: string;
  total_entregas: number;
  valor_total: number;
  valor_medio: number;
}

interface SalesData {
  date: string;
  total: number;
  orders: number;
}

interface MotoboyStats {
  nome: string;
  total_entregas: number;
  valor_total: number;
}

interface AnalyticsData {
  topProducts: TopProduct[];
  neighborhoodStats: NeighborhoodStats[];
  salesData: SalesData[];
  motoboyStats: MotoboyStats[];
  totalStats: {
    totalSales: number;
    totalOrders: number;
    totalDeliveries: number;
    averageOrderValue: number;
  };
}

export function useAnalytics(dateRange?: { start: Date; end: Date }) {
  const [data, setData] = useState<AnalyticsData>({
    topProducts: [],
    neighborhoodStats: [],
    salesData: [],
    motoboyStats: [],
    totalStats: {
      totalSales: 0,
      totalOrders: 0,
      totalDeliveries: 0,
      averageOrderValue: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Definir filtros de data
      let dateFilter = '';
      if (dateRange) {
        const startDate = dateRange.start.toISOString().split('T')[0];
        const endDate = dateRange.end.toISOString().split('T')[0];
        dateFilter = `AND DATE(created_at) BETWEEN '${startDate}' AND '${endDate}'`;
      }

      // Buscar produtos mais vendidos
      const { data: comandasData } = await supabase
        .from('comandas')
        .select('produtos, total, created_at')
        .eq('user_id', session.user.id)
        .eq('pago', true);

      // Processar produtos mais vendidos
      const productMap = new Map();
      comandasData?.forEach(comanda => {
        if (comanda.produtos) {
          comanda.produtos.forEach((produto: any) => {
            const key = produto.nome;
            if (productMap.has(key)) {
              const existing = productMap.get(key);
              existing.quantidade_total += produto.quantidade;
              existing.valor_total += produto.quantidade * produto.valor;
            } else {
              productMap.set(key, {
                nome: produto.nome,
                categoria: produto.categoria || 'Sem categoria',
                total_vendido: produto.quantidade,
                quantidade_total: produto.quantidade,
                valor_total: produto.quantidade * produto.valor,
              });
            }
          });
        }
      });

      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.quantidade_total - a.quantidade_total)
        .slice(0, 10);

      // Buscar estatísticas por bairro
      const { data: neighborhoodData } = await supabase
        .from('comandas')
        .select('bairro, total, created_at')
        .eq('user_id', session.user.id)
        .eq('pago', true);

      const neighborhoodMap = new Map();
      neighborhoodData?.forEach(comanda => {
        const bairro = comanda.bairro;
        if (neighborhoodMap.has(bairro)) {
          const existing = neighborhoodMap.get(bairro);
          existing.total_entregas += 1;
          existing.valor_total += Number(comanda.total);
        } else {
          neighborhoodMap.set(bairro, {
            bairro,
            total_entregas: 1,
            valor_total: Number(comanda.total),
            valor_medio: Number(comanda.total),
          });
        }
      });

      const neighborhoodStats = Array.from(neighborhoodMap.values())
        .map(item => ({
          ...item,
          valor_medio: item.valor_total / item.total_entregas,
        }))
        .sort((a, b) => b.total_entregas - a.total_entregas);

      // Buscar dados de vendas por data
      const { data: salesByDate } = await supabase
        .from('comandas')
        .select('total, created_at')
        .eq('user_id', session.user.id)
        .eq('pago', true)
        .order('created_at', { ascending: true });

      const salesMap = new Map();
      salesByDate?.forEach(comanda => {
        const date = comanda.created_at.split('T')[0];
        if (salesMap.has(date)) {
          const existing = salesMap.get(date);
          existing.total += Number(comanda.total);
          existing.orders += 1;
        } else {
          salesMap.set(date, {
            date,
            total: Number(comanda.total),
            orders: 1,
          });
        }
      });

      const salesData = Array.from(salesMap.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30); // Últimos 30 dias

      // Buscar estatísticas de motoboys - corrigindo o tipo
      const { data: deliveryData } = await supabase
        .from('entregas')
        .select(`
          valor_entrega,
          motoboy_id,
          motoboys!inner(nome)
        `)
        .eq('user_id', session.user.id);

      const motoboyMap = new Map();
      deliveryData?.forEach(entrega => {
        // Corrigindo o acesso à propriedade nome
        const motoboyData = entrega.motoboys as any;
        const nome = motoboyData?.nome || 'Motoboy Desconhecido';
        
        if (motoboyMap.has(nome)) {
          const existing = motoboyMap.get(nome);
          existing.total_entregas += 1;
          existing.valor_total += Number(entrega.valor_entrega);
        } else {
          motoboyMap.set(nome, {
            nome,
            total_entregas: 1,
            valor_total: Number(entrega.valor_entrega),
          });
        }
      });

      const motoboyStats = Array.from(motoboyMap.values())
        .sort((a, b) => b.total_entregas - a.total_entregas);

      // Calcular estatísticas totais
      const totalSales = comandasData?.reduce((sum, comanda) => sum + Number(comanda.total), 0) || 0;
      const totalOrders = comandasData?.length || 0;
      const totalDeliveries = deliveryData?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      setData({
        topProducts,
        neighborhoodStats,
        salesData,
        motoboyStats,
        totalStats: {
          totalSales,
          totalOrders,
          totalDeliveries,
          averageOrderValue,
        },
      });
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast.error('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  return { data, loading, refetch: fetchAnalytics };
}
