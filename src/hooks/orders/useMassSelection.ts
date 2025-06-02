
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useMassSelection() {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);

  const toggleOrder = useCallback((orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((orderIds: string[]) => {
    setSelectedOrders(new Set(orderIds));
    setIsSelectAll(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedOrders(new Set());
    setIsSelectAll(false);
  }, []);

  const toggleSelectAll = useCallback((orderIds: string[]) => {
    if (isSelectAll) {
      clearSelection();
    } else {
      selectAll(orderIds);
    }
  }, [isSelectAll, selectAll, clearSelection]);

  const massConfirmPayment = useCallback(async (
    orderIds: string[],
    updateOrderInList: (id: string, updates: any) => void
  ) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('comandas')
        .update({ pago: true })
        .in('id', orderIds);

      if (error) throw error;

      // Update local state
      orderIds.forEach(id => {
        updateOrderInList(id, { pago: true });
      });

      toast.success(`${orderIds.length} pedidos confirmados como pagos!`);
      clearSelection();
      return true;
    } catch (error) {
      console.error('Error confirming payments:', error);
      toast.error('Erro ao confirmar pagamentos');
      return false;
    }
  }, [clearSelection]);

  const massDelete = useCallback(async (
    orderIds: string[],
    removeOrderFromList: (id: string) => void
  ) => {
    if (!confirm(`Tem certeza que deseja excluir ${orderIds.length} pedidos?`)) {
      return false;
    }

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('comandas')
        .delete()
        .in('id', orderIds);

      if (error) throw error;

      // Update local state
      orderIds.forEach(id => {
        removeOrderFromList(id);
      });

      toast.success(`${orderIds.length} pedidos excluídos com sucesso!`);
      clearSelection();
      return true;
    } catch (error) {
      console.error('Error deleting orders:', error);
      toast.error('Erro ao excluir pedidos');
      return false;
    }
  }, [clearSelection]);

  return {
    selectedOrders,
    isSelectAll,
    selectedCount: selectedOrders.size,
    toggleOrder,
    selectAll,
    clearSelection,
    toggleSelectAll,
    massConfirmPayment,
    massDelete,
  };
}
