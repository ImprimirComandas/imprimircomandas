
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { AnalyticsData, AnalyticsDateRange, AnalyticsError } from '../types/analytics';

const EMPTY_ANALYTICS_DATA: AnalyticsData = {
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
};

export function useAnalyticsOptimized(dateRange?: AnalyticsDateRange) {
  const [data, setData] = useState<AnalyticsData>(EMPTY_ANALYTICS_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AnalyticsError | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Memoize the date range to prevent unnecessary re-fetches
  const memoizedDateRange = useMemo(() => {
    if (!dateRange) return null;
    return {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    };
  }, [dateRange?.start.getTime(), dateRange?.end.getTime()]);

  const fetchAnalytics = useCallback(async (forceRefresh = false) => {
    // Prevent excessive API calls
    const now = Date.now();
    if (!forceRefresh && now - lastFetch < 5000) return;

    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Usuário não autenticado');
      }

      // Build base query
      let baseQuery = supabase
        .from('comandas')
        .select('*')
        .eq('user_id', session.user.id);

      // Apply date filter if provided
      if (memoizedDateRange) {
        baseQuery = baseQuery
          .gte('created_at', memoizedDateRange.start)
          .lte('created_at', memoizedDateRange.end);
      }

      const { data: comandasData, error: comandasError } = await baseQuery;
      
      if (comandasError) throw comandasError;

      // Process data efficiently
      const processedData = processComandas(comandasData || []);

      // Fetch delivery data
      let deliveryQuery = supabase
        .from('entregas')
        .select(`
          valor_entrega,
          motoboy_id,
          motoboys!inner(nome)
        `)
        .eq('user_id', session.user.id);

      if (memoizedDateRange) {
        deliveryQuery = deliveryQuery
          .gte('created_at', memoizedDateRange.start)
          .lte('created_at', memoizedDateRange.end);
      }

      const { data: deliveryData } = await deliveryQuery;

      const motoboyStats = processDeliveryData(deliveryData || []);

      setData({
        ...processedData,
        motoboyStats,
      });

      setLastFetch(now);
    } catch (err) {
      console.error('Erro ao carregar analytics:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError({ message: errorMessage });
      toast.error('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  }, [memoizedDateRange, lastFetch]);

  const processComandas = useCallback((comandas: any[]) => {
    const productMap = new Map();
    const paymentMethodMap = new Map();
    const hourlyMap = new Map();
    const neighborhoodMap = new Map();
    const salesMap = new Map();

    let totalConfirmed = 0;
    let totalUnconfirmed = 0;
    let totalSales = 0;
    let totalOrders = 0;

    comandas.forEach(comanda => {
      if (comanda.pago) {
        totalConfirmed += 1;
        totalSales += Number(comanda.total) || 0;
        totalOrders += 1;

        // Process payment methods
        const formaPagamento = comanda.forma_pagamento || 'Não informado';
        const paymentData = paymentMethodMap.get(formaPagamento) || {
          metodo: formaPagamento,
          total: 0,
          quantidade: 0,
          porcentagem: 0,
        };
        paymentData.total += Number(comanda.total) || 0;
        paymentData.quantidade += 1;
        paymentMethodMap.set(formaPagamento, paymentData);

        // Process hourly data
        const hora = new Date(comanda.created_at).getHours();
        const hourlyData = hourlyMap.get(hora) || { hora, total: 0, pedidos: 0 };
        hourlyData.total += Number(comanda.total) || 0;
        hourlyData.pedidos += 1;
        hourlyMap.set(hora, hourlyData);

        // Process neighborhood data
        if (comanda.bairro) {
          const neighborhoodData = neighborhoodMap.get(comanda.bairro) || {
            bairro: comanda.bairro,
            total_entregas: 0,
            valor_total: 0,
            valor_medio: 0,
          };
          neighborhoodData.total_entregas += 1;
          neighborhoodData.valor_total += Number(comanda.total) || 0;
          neighborhoodMap.set(comanda.bairro, neighborhoodData);
        }

        // Process sales by date
        const date = comanda.created_at ? comanda.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
        const salesData = salesMap.get(date) || { date, total: 0, orders: 0 };
        salesData.total += Number(comanda.total) || 0;
        salesData.orders += 1;
        salesMap.set(date, salesData);

        // Process products
        if (comanda.produtos && Array.isArray(comanda.produtos)) {
          comanda.produtos.forEach((produto: any) => {
            const productData = productMap.get(produto.nome) || {
              nome: produto.nome,
              categoria: produto.categoria || 'Sem categoria',
              quantidade_total: 0,
              valor_total: 0,
            };
            productData.quantidade_total += produto.quantidade || 0;
            productData.valor_total += (produto.quantidade || 0) * (produto.valor || 0);
            productMap.set(produto.nome, productData);
          });
        }
      } else {
        totalUnconfirmed += 1;
      }
    });

    // Calculate percentages for payment methods
    const totalPaymentValue = Array.from(paymentMethodMap.values())
      .reduce((sum, method) => sum + method.total, 0);

    const paymentMethods = Array.from(paymentMethodMap.values())
      .map(method => ({
        ...method,
        porcentagem: totalPaymentValue > 0 ? (method.total / totalPaymentValue) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Process products
    const allProducts = Array.from(productMap.values());
    const topProducts = allProducts
      .sort((a, b) => b.quantidade_total - a.quantidade_total)
      .slice(0, 10);
    
    const leastProducts = allProducts
      .sort((a, b) => a.quantidade_total - b.quantidade_total)
      .slice(0, 10);

    // Process neighborhoods
    const neighborhoodStats = Array.from(neighborhoodMap.values())
      .map(item => ({
        ...item,
        valor_medio: item.valor_total / item.total_entregas,
      }))
      .sort((a, b) => b.total_entregas - a.total_entregas)
      .slice(0, 10);

    // Process sales data
    const salesData = Array.from(salesMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    // Process hourly stats
    const hourlyStats = Array.from(hourlyMap.values())
      .sort((a, b) => a.hora - b.hora);

    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const conversionRate = (totalConfirmed + totalUnconfirmed) > 0 ? (totalConfirmed / (totalConfirmed + totalUnconfirmed)) * 100 : 0;

    return {
      topProducts,
      leastProducts,
      neighborhoodStats,
      salesData,
      paymentMethods,
      hourlyStats,
      totalStats: {
        totalSales,
        totalOrders,
        totalDeliveries: 0, // Will be updated with delivery data
        averageOrderValue,
        totalConfirmed,
        totalUnconfirmed,
        conversionRate,
      },
    };
  }, []);

  const processDeliveryData = useCallback((deliveryData: any[]) => {
    const motoboyMap = new Map();
    
    deliveryData.forEach(entrega => {
      const motoboyData = entrega.motoboys as any;
      const nome = motoboyData?.nome || 'Motoboy Desconhecido';
      
      const stats = motoboyMap.get(nome) || {
        nome,
        total_entregas: 0,
        valor_total: 0,
      };
      stats.total_entregas += 1;
      stats.valor_total += Number(entrega.valor_entrega) || 0;
      motoboyMap.set(nome, stats);
    });

    return Array.from(motoboyMap.values())
      .sort((a, b) => b.total_entregas - a.total_entregas)
      .slice(0, 10);
  }, []);

  const refetch = useCallback(() => {
    fetchAnalytics(true);
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { 
    data, 
    loading, 
    error, 
    refetch,
    isEmpty: data.totalStats.totalOrders === 0 && !loading,
  };
}
