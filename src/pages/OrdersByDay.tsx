
import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { imprimirComanda } from '../utils/printService';
import { OrderCard } from '../components/orders/OrderCard';
import { OrderStats } from '../components/orders/OrderStats';
import { OrderFilters } from '../components/orders/OrderFilters';
import type { Comanda } from '../types/orders';

export default function OrdersByDay() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [dateRange, setDateRange] = useState([
    {
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date()),
      key: 'selection',
    },
  ]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [loading, setLoading] = useState(false);

  const fetchOrdersByPeriod = async (start: Date, end: Date) => {
    setLoading(true);
    try {
      const startISO = startOfDay(start).toISOString();
      const endISO = endOfDay(end).toISOString();
      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .gte('data', startISO)
        .lte('data', endISO)
        .order('data', { ascending: false });

      if (error) throw error;
      setComandas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error(error.message || 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersByPeriod(dateRange[0].startDate, dateRange[0].endDate);
  }, [dateRange]);

  const handleDateRangeChange = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    if (startDate && endDate) {
      setDateRange([{ startDate, endDate, key: 'selection' }]);
      setShowCalendar(false);
    }
  };

  const handlePeriodChange = (direction: 'prev' | 'next') => {
    const daysDiff = Math.ceil(
      (dateRange[0].endDate.getTime() - dateRange[0].startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) || 1;
    const newStart = direction === 'prev' ? subDays(dateRange[0].startDate, daysDiff) : addDays(dateRange[0].startDate, daysDiff);
    const newEnd = direction === 'prev' ? subDays(dateRange[0].endDate, daysDiff) : addDays(dateRange[0].endDate, daysDiff);
    setDateRange([{ startDate: newStart, endDate: newEnd, key: 'selection' }]);
  };

  const togglePayment = async (comanda: Comanda) => {
    try {
      const { error } = await supabase
        .from('comandas')
        .update({ pago: !comanda.pago })
        .eq('id', comanda.id);

      if (error) throw error;
      await fetchOrdersByPeriod(dateRange[0].startDate, dateRange[0].endDate);
      toast.success(`Pagamento ${!comanda.pago ? 'confirmado' : 'desmarcado'}!`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar pagamento');
    }
  };

  const reprintOrder = async (comanda: Comanda) => {
    try {
      await imprimirComanda(comanda);
      toast.success('Comanda enviada para impressão');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reimprimir comanda');
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchOrdersByPeriod(dateRange[0].startDate, dateRange[0].endDate);
      toast.success('Pedido excluído com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir pedido');
    }
  };

  const saveEdit = async (id: string, updatedComanda: Partial<Comanda>) => {
    try {
      const { error } = await supabase
        .from('comandas')
        .update(updatedComanda)
        .eq('id', id);

      if (error) throw error;
      await fetchOrdersByPeriod(dateRange[0].startDate, dateRange[0].endDate);
      toast.success('Comanda atualizada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar alterações');
    }
  };

  const filteredComandas = useMemo(() => {
    return comandas.filter(comanda => {
      const matchesSearch = searchTerm
        ? comanda.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comanda.produtos.some(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;

      const matchesStatus =
        filterStatus === 'all' ? true : filterStatus === 'paid' ? comanda.pago : !comanda.pago;

      return matchesSearch && matchesStatus;
    });
  }, [comandas, searchTerm, filterStatus]);

  const totais = useMemo(() => {
    return filteredComandas.reduce(
      (acc, comanda) => {
        const valor = comanda.total || 0;
        acc.total += valor;
        if (comanda.pago) acc.confirmados += valor;
        else acc.naoConfirmados += valor;
        return acc;
      },
      { confirmados: 0, naoConfirmados: 0, total: 0 }
    );
  }, [filteredComandas]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 text-center sm:text-left">
            Controle de Pedidos
          </h1>
          <p className="mt-2 text-gray-600 text-center sm:text-left">
            Gerencie seus pedidos por período
          </p>
        </motion.div>

        <OrderFilters
          dateRange={dateRange}
          showCalendar={showCalendar}
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          onDateRangeChange={handleDateRangeChange}
          onShowCalendarChange={setShowCalendar}
          onSearchTermChange={setSearchTerm}
          onFilterStatusChange={setFilterStatus}
          onPeriodChange={handlePeriodChange}
        />

        <OrderStats totais={totais} />

        <motion.div layout>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-600"></div>
            </div>
          ) : filteredComandas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >
              <p className="text-gray-600 text-lg font-medium">
                Nenhum pedido encontrado para este período.
              </p>
            </motion.div>
          ) : (
            filteredComandas.map(comanda => (
              <OrderCard
                key={comanda.id}
                comanda={comanda}
                onTogglePayment={togglePayment}
                onReprint={reprintOrder}
                onDelete={deleteOrder}
                onSaveEdit={saveEdit}
              />
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
