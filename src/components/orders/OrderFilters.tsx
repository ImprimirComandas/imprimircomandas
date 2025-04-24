
import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DateRange } from 'react-date-range';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface OrderFiltersProps {
  dateRange: DateRange[];
  showCalendar: boolean;
  searchTerm: string;
  filterStatus: 'all' | 'paid' | 'pending';
  onDateRangeChange: (range: any) => void;
  onShowCalendarChange: (show: boolean) => void;
  onSearchTermChange: (term: string) => void;
  onFilterStatusChange: (status: 'all' | 'paid' | 'pending') => void;
  onPeriodChange: (direction: 'prev' | 'next') => void;
}

export function OrderFilters({
  dateRange,
  showCalendar,
  searchTerm,
  filterStatus,
  onDateRangeChange,
  onShowCalendarChange,
  onSearchTermChange,
  onFilterStatusChange,
  onPeriodChange,
}: OrderFiltersProps) {
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onShowCalendarChange(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onShowCalendarChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-xl p-6 mb-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => onPeriodChange('prev')}
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            aria-label="Período anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <button
              onClick={() => onShowCalendarChange(!showCalendar)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-100"
              aria-label="Selecionar período"
            >
              <Calendar size={20} />
              {format(dateRange[0].startDate!, 'dd/MM/yyyy')} - {format(dateRange[0].endDate!, 'dd/MM/yyyy')}
            </button>
            {showCalendar && (
              <div ref={calendarRef} className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl">
                <DateRangePicker
                  ranges={dateRange}
                  onChange={onDateRangeChange}
                  maxDate={new Date()}
                  showDateDisplay={false}
                  direction="vertical"
                  months={1}
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
          <button
            onClick={() => onPeriodChange('next')}
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            aria-label="Próximo período"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="relative w-full sm:w-auto">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar pedido (8 últimos dígitos ou produto)..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-10 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500"
            aria-label="Buscar pedido por ID ou produto"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchTermChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2 justify-center sm:justify-start">
        <button
          onClick={() => onFilterStatusChange('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => onFilterStatusChange('paid')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filterStatus === 'paid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pagos
        </button>
        <button
          onClick={() => onFilterStatusChange('pending')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filterStatus === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pendentes
        </button>
      </div>
    </motion.div>
  );
}
