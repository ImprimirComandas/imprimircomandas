
import { useState } from 'react';
import { Search, X, Clock, Filter } from 'lucide-react';
import { DateRange, RangeKeyDict } from 'react-date-range';
import { DateRangeSelector } from './DateRangeSelector';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

interface OrderFiltersProps {
  dateRange: DateRange[];
  onDateRangeChange: (range: RangeKeyDict) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: 'all' | 'paid' | 'pending';
  onFilterStatusChange: (status: 'all' | 'paid' | 'pending') => void;
  onChangePeriod: (direction: 'prev' | 'next') => void;
  showCalendar: boolean;
  onShowCalendarChange: (show: boolean) => void;
}

export function OrderFilters({
  dateRange,
  onDateRangeChange,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  onChangePeriod,
  showCalendar,
  onShowCalendarChange
}: OrderFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const { isDark } = useTheme();
  
  return (
    <div className="my-6 space-y-4 bg-card rounded-lg border border-border p-4">
      {/* Date selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <DateRangeSelector
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          showCalendar={showCalendar}
          onShowCalendarChange={onShowCalendarChange}
        />
        
        <div className="flex gap-2 w-full md:w-auto">
          {/* Search input */}
          <div className="relative flex-1 md:max-w-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar pedido..."
              className="w-full pl-3 pr-10 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
            {searchTerm ? (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => onSearchChange('')}
              >
                <X size={18} />
              </button>
            ) : (
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            )}
          </div>
          
          {/* Filter button */}
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} className="mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Filter options */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 pt-3 border-t border-border">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => onFilterStatusChange("all")}
            size="sm"
          >
            <Clock size={16} className="mr-1" />
            Todos
          </Button>
          <Button
            variant={filterStatus === "paid" ? "default" : "outline"}
            onClick={() => onFilterStatusChange("paid")}
            size="sm"
          >
            Pagos
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            onClick={() => onFilterStatusChange("pending")}
            size="sm"
          >
            Não Pagos
          </Button>
        </div>
      )}
    </div>
  );
}
