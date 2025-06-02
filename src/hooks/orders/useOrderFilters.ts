
import { useState, useMemo } from 'react';
import type { Comanda } from '@/types';

export function useOrderFilters(comandas: Comanda[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');

  const getUltimos8Digitos = (id: string | undefined): string => {
    if (!id) return 'N/A';
    return id.slice(-8);
  };

  const filteredOrders = useMemo(() => {
    return comandas.filter(comanda => {
      const matchesSearch = searchTerm
        ? getUltimos8Digitos(comanda.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
          comanda.produtos.some(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;

      const matchesStatus =
        filterStatus === 'all' ? true : filterStatus === 'paid' ? comanda.pago : !comanda.pago;

      return matchesSearch && matchesStatus;
    });
  }, [comandas, searchTerm, filterStatus]);

  const orderTotals = useMemo(() => {
    const totals = filteredOrders.reduce(
      (acc, comanda) => {
        const valor = comanda.total || 0;
        acc.total += valor;
        if (comanda.pago) {
          acc.confirmados += valor;
          acc.pedidosPagos += 1;
        } else {
          acc.naoConfirmados += valor;
          acc.pedidosPendentes += 1;
        }
        return acc;
      },
      { confirmados: 0, naoConfirmados: 0, total: 0, pedidosPagos: 0, pedidosPendentes: 0 }
    );

    return totals;
  }, [filteredOrders]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredOrders,
    orderTotals
  };
}
