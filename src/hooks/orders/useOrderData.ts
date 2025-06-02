
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import type { Comanda } from '@/types';
import type { DateRange } from 'react-date-range';

export function useOrderData() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrdersByPeriod = useCallback(async (dateRange: DateRange[]) => {
    setLoading(true);
    try {
      const startISO = startOfDay(dateRange[0].startDate || new Date()).toISOString();
      const endISO = endOfDay(dateRange[0].endDate || new Date()).toISOString();
      
      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .gte('data', startISO)
        .lte('data', endISO)
        .order('data', { ascending: false });

      if (error) throw new Error(`Erro ao carregar pedidos: ${error.message}`);
      setComandas(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar pedidos:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderInList = useCallback((id: string, updates: Partial<Comanda>) => {
    setComandas(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  }, []);

  const removeOrderFromList = useCallback((id: string) => {
    setComandas(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    comandas,
    loading,
    fetchOrdersByPeriod,
    updateOrderInList,
    removeOrderFromList
  };
}
