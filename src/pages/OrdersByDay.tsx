
import { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { motion } from 'framer-motion';
import { DateRange, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useTheme } from '@/hooks/useTheme';
import { calculateNewDateRange } from '@/utils/dateUtils';

// Components
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderStats } from '@/components/orders/OrderStats';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { PageContainer } from '@/components/layouts/PageContainer';

// Hooks
import { useOrdersData } from '@/hooks/useOrdersData';

export default function OrdersByDay() {
  const { isDark } = useTheme();
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange[]>([
    {
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date()),
      key: 'selection',
    },
  ]);
  
  const [showCalendar, setShowCalendar] = useState(false);

  // Orders data hook
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
    saveOrderEdit
  } = useOrdersData();

  // Fetch orders when date range changes
  useEffect(() => {
    if (dateRange[0].startDate && dateRange[0].endDate) {
      fetchOrdersByPeriod(dateRange);
    }
  }, [dateRange, fetchOrdersByPeriod]);

  // Handle date range changes
  const handleDateRangeChange = (ranges: RangeKeyDict) => {
    const { startDate, endDate } = ranges.selection;
    if (startDate && endDate) {
      setDateRange([{ 
        startDate: startOfDay(startDate), 
        endDate: endOfDay(endDate), 
        key: 'selection' 
      }]);
    }
  };

  // Change period (prev/next)
  const changePeriod = (direction: 'prev' | 'next') => {
    console.log("OrdersByDay: Changing period:", direction);
    const newDateRange = calculateNewDateRange(dateRange, direction);
    console.log("OrdersByDay: Changed date range:", newDateRange);
    setDateRange(newDateRange);
  };

  // Type-safe wrapper for setFilterStatus
  const handleFilterStatusChange = (status: 'all' | 'paid' | 'pending') => {
    setFilterStatus(status);
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

        {/* Filters */}
        <OrderFilters
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterStatusChange={handleFilterStatusChange}
          onChangePeriod={changePeriod}
          showCalendar={showCalendar}
          onShowCalendarChange={setShowCalendar}
        />

        {/* Order Statistics */}
        <OrderStats
          confirmados={totals.confirmados}
          naoConfirmados={totals.naoConfirmados}
          total={totals.total}
        />

        {/* Orders List */}
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
              />
            ))
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
}
