
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';
import { Comanda } from '@/types';
import { DateRange } from 'react-date-range';

export const useOrders = () => {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

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
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error('Erro ao carregar pedidos:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set up real-time subscription for orders
    const ordersChannel = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comandas'
        },
        (payload) => {
          console.log('Real-time update from orders:', payload);
          // If dateRange is available, refresh the orders
          if (comandas.length > 0) {
            // Create a minimal dateRange object for the refresh
            const today = new Date();
            const dateRange: DateRange[] = [{
              startDate: startOfDay(today),
              endDate: endOfDay(today),
              key: 'selection'
            }];
            fetchOrdersByPeriod(dateRange);
          }
        }
      )
      .subscribe();
      
    // Clean up subscription
    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [comandas.length, fetchOrdersByPeriod]);

  const togglePayment = async (comanda: Comanda) => {
    try {
      const { error } = await supabase
        .from('comandas')
        .update({ pago: !comanda.pago })
        .eq('id', comanda.id);

      if (error) throw new Error(`Erro ao atualizar pagamento: ${error.message}`);
      toast.success(`Pagamento ${!comanda.pago ? 'confirmado' : 'desmarcado'}!`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(errorMessage);
      return false;
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return false;

    try {
      const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Erro ao excluir pedido: ${error.message}`);
      toast.success('Pedido excluído com sucesso!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(errorMessage);
      return false;
    }
  };

  return {
    comandas,
    loading,
    fetchOrdersByPeriod,
    togglePayment,
    deleteOrder,
  };
};
