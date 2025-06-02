
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { addDays, subDays, startOfDay, endOfDay, format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange, RangeKeyDict } from 'react-date-range';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateRangeSelector } from './DateRangeSelector';

interface UnifiedDateNavigatorProps {
  dateRange: DateRange[];
  onDateChange: (ranges: DateRange[]) => void;
  loading: boolean;
}

export function UnifiedDateNavigator({ dateRange, onDateChange, loading }: UnifiedDateNavigatorProps) {
  const [showRangePicker, setShowRangePicker] = useState(false);
  const currentDate = dateRange[0].startDate || new Date();
  const isRangeSelection = dateRange[0].startDate?.getTime() !== dateRange[0].endDate?.getTime();

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1);
    onDateChange([{
      startDate: startOfDay(newDate),
      endDate: endOfDay(newDate),
      key: 'selection',
    }]);
  };

  const goToToday = () => {
    const today = new Date();
    onDateChange([{
      startDate: startOfDay(today),
      endDate: endOfDay(today),
      key: 'selection',
    }]);
  };

  const handleRangeChange = (ranges: RangeKeyDict) => {
    const { startDate, endDate } = ranges.selection;
    if (startDate && endDate) {
      onDateChange([{ 
        startDate: startOfDay(startDate), 
        endDate: endOfDay(endDate), 
        key: 'selection' 
      }]);
      setShowRangePicker(false);
    }
  };

  const formatDateDisplay = () => {
    if (isRangeSelection) {
      return `${format(dateRange[0].startDate!, 'dd/MM/yyyy', { locale: ptBR })} - ${format(dateRange[0].endDate!, 'dd/MM/yyyy', { locale: ptBR })}`;
    }
    return format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col space-y-4">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDay('prev')}
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center min-w-[200px]">
              <h2 className="text-lg font-semibold text-foreground">
                {formatDateDisplay()}
              </h2>
              {isRangeSelection && (
                <p className="text-sm text-muted-foreground">Período Selecionado</p>
              )}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDay('next')}
              disabled={loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            {!isToday(currentDate) && !isRangeSelection && (
              <Button
                variant="outline"
                onClick={goToToday}
                disabled={loading}
              >
                Hoje
              </Button>
            )}
            
            <Button
              variant={showRangePicker ? "default" : "outline"}
              onClick={() => setShowRangePicker(!showRangePicker)}
              disabled={loading}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Período
            </Button>
          </div>
        </div>

        {/* Range Picker */}
        {showRangePicker && (
          <div className="border-t pt-4">
            <DateRangeSelector
              dateRange={dateRange}
              onDateChange={handleRangeChange}
              loading={loading}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
