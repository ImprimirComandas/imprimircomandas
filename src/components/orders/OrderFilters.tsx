
import { Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DateRange, DateRangePicker, RangeKeyDict } from 'react-date-range';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateRangeSelector } from '@/components/orders/DateRangeSelector';

interface OrderFiltersProps {
  dateRange: DateRange[];
  onDateRangeChange: (ranges: RangeKeyDict) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterStatus: 'all' | 'paid' | 'pending';
  onFilterStatusChange: (status: 'all' | 'paid' | 'pending') => void;
  onChangePeriod: (direction: 'prev' | 'next') => void;
}

export function OrderFilters({
  dateRange,
  onDateRangeChange,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  onChangePeriod
}: OrderFiltersProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <DateRangeSelector 
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            showCalendar={showCalendar}
            onShowCalendarChange={setShowCalendar}
          />

          <div className="relative w-full sm:w-auto">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar pedido (8 últimos dígitos ou produto)..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-10 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
              aria-label="Buscar pedido por ID ou produto"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpar busca"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2 justify-center sm:justify-start">
          <Button
            onClick={() => onFilterStatusChange('all')}
            variant={filterStatus === 'all' ? "default" : "secondary"}
          >
            Todos
          </Button>
          <Button
            onClick={() => onFilterStatusChange('paid')}
            variant={filterStatus === 'paid' ? "default" : "secondary"}
          >
            Pagos
          </Button>
          <Button
            onClick={() => onFilterStatusChange('pending')}
            variant={filterStatus === 'pending' ? "default" : "secondary"}
          >
            Pendentes
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
