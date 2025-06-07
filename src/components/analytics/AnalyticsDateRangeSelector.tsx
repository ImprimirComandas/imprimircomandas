
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { DateRangePicker } from 'react-date-range';
import { addDays, subDays, format, isToday, isYesterday, startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface AnalyticsDateRangeSelectorProps {
  dateRange: DateRange[];
  onDateChange: (ranges: DateRange[]) => void;
  loading: boolean;
}

export function AnalyticsDateRangeSelector({ dateRange, onDateChange, loading }: AnalyticsDateRangeSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const currentRange = dateRange[0];

  const formatDateDisplay = (startDate: Date | undefined, endDate: Date | undefined) => {
    if (!startDate || !endDate) return 'Selecione um período';
    
    if (startDate.toDateString() === endDate.toDateString()) {
      if (isToday(startDate)) return 'Hoje';
      if (isYesterday(startDate)) return 'Ontem';
      return format(startDate, 'dd/MM/yyyy');
    }
    
    return `${format(startDate, 'dd/MM')} - ${format(endDate, 'dd/MM/yyyy')}`;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (!currentRange.startDate || !currentRange.endDate) return;
    
    const daysDiff = Math.ceil((currentRange.endDate.getTime() - currentRange.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let newStartDate: Date;
    let newEndDate: Date;
    
    if (direction === 'prev') {
      newStartDate = subDays(currentRange.startDate, daysDiff + 1);
      newEndDate = subDays(currentRange.endDate, daysDiff + 1);
    } else {
      newStartDate = addDays(currentRange.startDate, daysDiff + 1);
      newEndDate = addDays(currentRange.endDate, daysDiff + 1);
      
      // Don't allow future dates
      const today = new Date();
      if (newStartDate > today) return;
      if (newEndDate > today) {
        newEndDate = today;
      }
    }
    
    onDateChange([{
      ...currentRange,
      startDate: startOfDay(newStartDate),
      endDate: endOfDay(newEndDate)
    }]);
  };

  const resetToToday = () => {
    const today = new Date();
    onDateChange([{
      ...currentRange,
      startDate: startOfDay(today),
      endDate: endOfDay(today)
    }]);
    setShowCalendar(false);
  };

  const setQuickRange = (days: number) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    
    onDateChange([{
      ...currentRange,
      startDate: startOfDay(startDate),
      endDate: endOfDay(endDate)
    }]);
    setShowCalendar(false);
  };

  return (
    <div className="relative">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Período:</span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              disabled={loading}
              className="shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowCalendar(!showCalendar)}
              disabled={loading}
              className="min-w-[140px] text-sm"
            >
              {formatDateDisplay(currentRange.startDate, currentRange.endDate)}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              disabled={loading}
              className="shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetToToday}
              disabled={loading}
              title="Voltar para hoje"
              className="shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showCalendar && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2">
            <Card className="p-4 bg-background border shadow-lg">
              <div className="mb-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setQuickRange(1)}>
                  Hoje
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuickRange(7)}>
                  7 dias
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuickRange(15)}>
                  15 dias
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuickRange(30)}>
                  30 dias
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuickRange(90)}>
                  90 dias
                </Button>
              </div>
              
              <DateRangePicker
                ranges={dateRange}
                onChange={(ranges: any) => onDateChange([ranges.selection])}
                months={1}
                direction="horizontal"
                className="w-full"
                rangeColors={['hsl(var(--primary))']}
                maxDate={new Date()}
                showSelectionPreview={true}
                moveRangeOnFirstSelection={false}
              />
              
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setShowCalendar(false)} size="sm">
                  Aplicar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}
