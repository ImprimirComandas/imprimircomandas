import { useState, useEffect } from 'react';
import { startOfDay, endOfDay } from 'date-fns';
import { motion } from 'framer-motion';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// Components
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderStats } from '@/components/orders/OrderStats';
import { SimplifiedOrderFilters } from '@/components/orders/SimplifiedOrderFilters';
import { UnifiedDateNavigator } from '@/components/orders/UnifiedDateNavigator';
import { PageContainer } from '@/components/layouts/PageContainer';
import { MassSelectionControls } from '@/components/orders/MassSelectionControls';

// Hooks
import { useOrdersByDay } from '@/hooks/orders/useOrdersByDay';

export default function OrdersByDay() {
  const [dateRange, setDateRange] = useState<DateRange[]>([
    {
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date()),
      key: 'selection',
    },
  ]);

  const {
    comandas,
    loading,
    totals,
    searchTerm,
    filterStatus,
    setSearchTerm,
    setFilterStatus,
    fetchOrdersByPeriod,
    togglePayment,
    reprintOrder,
    deleteOrder,
    saveOrderEdit,
    // Mass selection
    selectedOrders,
    isSelectAll,
    selectedCount,
    toggleOrder,
    toggleSelectAll,
    clearSelection,
    massConfirmPayment,
    massDelete,
    updateOrderInList,
    removeOrderFromList
  } = useOrdersByDay();

  useEffect(() => {
    if (dateRange[0].startDate && dateRange[0].endDate) {
      fetchOrdersByPeriod(dateRange);
    }
  }, [dateRange, fetchOrdersByPeriod]);

  const handleDateChange = (ranges: DateRange[]) => {
    setDateRange(ranges);
  };

  const handleFilterStatusChange = (status: 'all' | 'paid' | 'pending') => {
    setFilterStatus(status);
  };

  const handleMassConfirmPayment = async () => {
    const selectedIds = Array.from(selectedOrders);
    await massConfirmPayment(selectedIds, updateOrderInList);
  };

  const handleMassDelete = async () => {
    const selectedIds = Array.from(selectedOrders);
    await massDelete(selectedIds, removeOrderFromList);
  };

  const handleToggleSelectAll = () => {
    const orderIds = comandas.map(c => c.id!).filter(Boolean);
    toggleSelectAll(orderIds);
  };

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold text-foreground text-center sm:text-left">
            Controle de Pedidos
          </h1>
          <p className="mt-2 text-muted-foreground text-center sm:text-left">
            Gerencie seus pedidos por período
          </p>
        </motion.div>

        <UnifiedDateNavigator
          dateRange={dateRange}
          onDateChange={handleDateChange}
          loading={loading}
        />

        <SimplifiedOrderFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterStatusChange={handleFilterStatusChange}
        />

        <OrderStats
          confirmados={totals.confirmados}
          naoConfirmados={totals.naoConfirmados}
          total={totals.total}
        />

        {comandas.length > 0 && (
          <div className="mb-6">
            <MassSelectionControls
              selectedCount={selectedCount}
              totalCount={comandas.length}
              isSelectAll={isSelectAll}
              onToggleSelectAll={handleToggleSelectAll}
              onConfirmPayments={handleMassConfirmPayment}
              onDeleteOrders={handleMassDelete}
              onClearSelection={clearSelection}
              loading={loading}
            />
          </div>
        )}

        <motion.div layout>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-primary"></div>
            </div>
          ) : comandas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl border border-border shadow-md p-8 text-center"
            >
              <p className="text-foreground text-lg font-medium">
                Nenhum pedido encontrado para este período.
              </p>
            </motion.div>
          ) : (
            comandas.map(comanda => (
              <OrderCard
                key={comanda.id}
                comanda={comanda}
                onTogglePayment={togglePayment}
                onReprint={reprintOrder}
                onDelete={deleteOrder}
                onSaveEdit={saveOrderEdit}
                isSelected={selectedOrders.has(comanda.id!)}
                onToggleSelect={toggleOrder}
                showSelection={true}
              />
            ))
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
}
