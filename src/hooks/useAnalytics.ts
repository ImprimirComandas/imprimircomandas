
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

interface PaymentMethodStats {
  metodo: string;
  total: number;
  quantidade: number;
  porcentagem: number;
}

interface HourlyStats {
  hora: number;
  total: number;
  pedidos: number;
}

interface AnalyticsData {
  topProducts: TopProduct[];
  leastProducts: TopProduct[];
  neighborhoodStats: NeighborhoodStats[];
  salesData: SalesData[];
  motoboyStats: MotoboyStats[];
  paymentMethods: PaymentMethodStats[];
  hourlyStats: HourlyStats[];
  totalStats: {
    totalSales: number;
    totalOrders: number;
    totalDeliveries: number;
    averageOrderValue: number;
    totalConfirmed: number;
    totalUnconfirmed: number;
    conversionRate: number;
  };
}

export function useAnalytics(dateRange?: { start: Date; end: Date }) {
  const [data, setData] = useState<AnalyticsData>({
    topProducts: [],
    leastProducts: [],
    neighborhoodStats: [],
    salesData: [],
    motoboyStats: [],
    paymentMethods: [],
    hourlyStats: [],
    totalStats: {
      totalSales: 0,
      totalOrders: 0,
      totalDeliveries: 0,
      averageOrderValue: 0,
      totalConfirmed: 0,
      totalUnconfirmed: 0,
      conversionRate: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Construir query base para comandas
      let comandasQuery = supabase
        .from('comandas')
        .select('*')
        .eq('user_id', session.user.id);

      // Aplicar filtro de data se fornecido
      if (dateRange) {
        const startDate = dateRange.start.toISOString();
        const endDate = dateRange.end.toISOString();
        comandasQuery = comandasQuery
          .gte('created_at', startDate)
          .lte('created_at', endDate);
      }

      const { data: comandasData, error } = await comandasQuery;
      
      if (error) {
        console.error('Erro ao buscar comandas:', error);
        throw error;
      }

      // Inicializar contadores e mapas
      const productMap = new Map();
      const paymentMethodMap = new Map();
      const hourlyMap = new Map();
      const neighborhoodMap = new Map();
      const salesMap = new Map();

      let totalConfirmed = 0;
      let totalUnconfirmed = 0;
      let totalSales = 0;
      let totalOrders = 0;

      // Processar dados das comandas
      comandasData?.forEach(comanda => {
        // Contar status de pedidos
        if (comanda.pago) {
          totalConfirmed += 1;
          totalSales += Number(comanda.total) || 0;
          totalOrders += 1;

          // Processar apenas comandas pagas para métricas de vendas
          const formaPagamento = comanda.forma_pagamento || 'Não informado';
          if (paymentMethodMap.has(formaPagamento)) {
            const existing = paymentMethodMap.get(formaPagamento);
            existing.total += Number(comanda.total) || 0;
            existing.quantidade += 1;
          } else {
            paymentMethodMap.set(formaPagamento, {
              metodo: formaPagamento,
              total: Number(comanda.total) || 0,
              quantidade: 1,
              porcentagem: 0,
            });
          }

          // Análise por hora
          const hora = new Date(comanda.created_at).getHours();
          if (hourlyMap.has(hora)) {
            const existing = hourlyMap.get(hora);
            existing.total += Number(comanda.total) || 0;
            existing.pedidos += 1;
          } else {
            hourlyMap.set(hora, {
              hora,
              total: Number(comanda.total) || 0,
              pedidos: 1,
            });
          }

          // Análise por bairro
          if (comanda.bairro) {
            const bairro = comanda.bairro;
            if (neighborhoodMap.has(bairro)) {
              const existing = neighborhoodMap.get(bairro);
              existing.total_entregas += 1;
              existing.valor_total += Number(comanda.total) || 0;
            } else {
              neighborhoodMap.set(bairro, {
                bairro,
                total_entregas: 1,
                valor_total: Number(comanda.total) || 0,
                valor_medio: Number(comanda.total) || 0,
              });
            }
          }

          // Vendas por data
          const date = comanda.created_at ? comanda.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
          if (salesMap.has(date)) {
            const existing = salesMap.get(date);
            existing.total += Number(comanda.total) || 0;
            existing.orders += 1;
          } else {
            salesMap.set(date, {
              date,
              total: Number(comanda.total) || 0,
              orders: 1,
            });
          }

          // Processar produtos
          if (comanda.produtos && Array.isArray(comanda.produtos)) {
            comanda.produtos.forEach((produto: any) => {
              const key = produto.nome;
              if (productMap.has(key)) {
                const existing = productMap.get(key);
                existing.quantidade_total += produto.quantidade || 0;
                existing.valor_total += (produto.quantidade || 0) * (produto.valor || 0);
              } else {
                productMap.set(key, {
                  nome: produto.nome,
                  categoria: produto.categoria || 'Sem categoria',
                  total_vendido: produto.quantidade || 0,
                  quantidade_total: produto.quantidade || 0,
                  valor_total: (produto.quantidade || 0) * (produto.valor || 0),
                });
              }
            });
          }
        } else {
          totalUnconfirmed += 1;
        }
      });

      // Calcular porcentagens para formas de pagamento
      const totalPaymentValue = Array.from(paymentMethodMap.values())
        .reduce((sum, method) => sum + method.total, 0);

      const paymentMethods = Array.from(paymentMethodMap.values())
        .map(method => ({
          ...method,
          porcentagem: totalPaymentValue > 0 ? (method.total / totalPaymentValue) * 100 : 0,
        }))
        .sort((a, b) => b.total - a.total);

      // Top 10 e Least 10 produtos
      const allProducts = Array.from(productMap.values());
      const topProducts = allProducts
        .sort((a, b) => b.quantidade_total - a.quantidade_total)
        .slice(0, 10);
      
      const leastProducts = allProducts
        .sort((a, b) => a.quantidade_total - b.quantidade_total)
        .slice(0, 10);

      // Estatísticas por bairro (top 10)
      const neighborhoodStats = Array.from(neighborhoodMap.values())
        .map(item => ({
          ...item,
          valor_medio: item.valor_total / item.total_entregas,
        }))
        .sort((a, b) => b.total_entregas - a.total_entregas)
        .slice(0, 10);

      // Vendas por data (últimos 30 dias)
      const salesData = Array.from(salesMap.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30);

      // Estatísticas por hora
      const hourlyStats = Array.from(hourlyMap.values())
        .sort((a, b) => a.hora - b.hora);

      // Buscar estatísticas de motoboys
      let deliveryQuery = supabase
        .from('entregas')
        .select(`
          valor_entrega,
          motoboy_id,
          motoboys!inner(nome)
        `)
        .eq('user_id', session.user.id);

      if (dateRange) {
        const startDate = dateRange.start.toISOString();
        const endDate = dateRange.end.toISOString();
        deliveryQuery = deliveryQuery
          .gte('created_at', startDate)
          .lte('created_at', endDate);
      }

      const { data: deliveryData } = await deliveryQuery;

      const motoboyMap = new Map();
      deliveryData?.forEach(entrega => {
        const motoboyData = entrega.motoboys as any;
        const nome = motoboyData?.nome || 'Motoboy Desconhecido';
        
        if (motoboyMap.has(nome)) {
          const existing = motoboyMap.get(nome);
          existing.total_entregas += 1;
          existing.valor_total += Number(entrega.valor_entrega) || 0;
        } else {
          motoboyMap.set(nome, {
            nome,
            total_entregas: 1,
            valor_total: Number(entrega.valor_entrega) || 0,
          });
        }
      });

      const motoboyStats = Array.from(motoboyMap.values())
        .sort((a, b) => b.total_entregas - a.total_entregas)
        .slice(0, 10);

      // Calcular estatísticas totais
      const totalDeliveries = deliveryData?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      const conversionRate = (totalConfirmed + totalUnconfirmed) > 0 ? (totalConfirmed / (totalConfirmed + totalUnconfirmed)) * 100 : 0;

      setData({
        topProducts,
        leastProducts,
        neighborhoodStats,
        salesData,
        motoboyStats,
        paymentMethods,
        hourlyStats,
        totalStats: {
          totalSales,
          totalOrders,
          totalDeliveries,
          averageOrderValue,
          totalConfirmed,
          totalUnconfirmed,
          conversionRate,
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
