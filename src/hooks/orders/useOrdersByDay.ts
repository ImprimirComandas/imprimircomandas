import { useCallback } from 'react';
import { useOrderData } from './useOrderData';
import { useOrderActions } from './useOrderActions';
import { useOrderFilters } from './useOrderFilters';
import { useMassSelection } from './useMassSelection';
import type { Comanda } from '@/types';
import type { DateRange } from 'react-date-range';

export function useOrdersByDay() {
  const {
    comandas,
    loading: dataLoading,
    fetchOrdersByPeriod,
    updateOrderInList,
    removeOrderFromList
  } = useOrderData();

  const {
    togglePayment: togglePaymentAction,
    reprintOrder: reprintOrderAction,
    deleteOrder: deleteOrderAction,
    saveOrderEdit: saveOrderEditAction,
    loading: actionsLoading
  } = useOrderActions();

  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredOrders,
    orderTotals
  } = useOrderFilters(comandas);

  const massSelection = useMassSelection();

  const togglePayment = useCallback(async (comanda: Comanda) => {
    const success = await togglePaymentAction(comanda);
    if (success) {
      updateOrderInList(comanda.id!, { pago: !comanda.pago });
    }
    return success;
  }, [togglePaymentAction, updateOrderInList]);

  const reprintOrder = useCallback(async (comanda: Comanda) => {
    return await reprintOrderAction(comanda);
  }, [reprintOrderAction]);

  const deleteOrder = useCallback(async (id: string) => {
    const success = await deleteOrderAction(id);
    if (success) {
      removeOrderFromList(id);
    }
    return success;
  }, [deleteOrderAction, removeOrderFromList]);

  const saveOrderEdit = useCallback(async (id: string, updatedComanda: Partial<Comanda>) => {
    const success = await saveOrderEditAction(id, updatedComanda);
    if (success) {
      updateOrderInList(id, updatedComanda);
    }
    return success;
  }, [saveOrderEditAction, updateOrderInList]);

  return {
    comandas: filteredOrders,
    loading: dataLoading || actionsLoading,
    totals: orderTotals,
    searchTerm,
    filterStatus,
    setSearchTerm,
    setFilterStatus,
    fetchOrdersByPeriod,
    togglePayment,
    reprintOrder,
    deleteOrder,
    saveOrderEdit,
    ...massSelection,
  };
}
