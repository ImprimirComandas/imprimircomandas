
import { useRef } from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRange, DateRangePicker } from 'react-date-range';
import { Button } from '@/components/ui/button';
import { calculateNewDateRange } from '@/utils/dateUtils';

interface DateRangeSelectorProps {
  dateRange: DateRange[];
  onDateRangeChange: (range: DateRange[]) => void;
  showCalendar: boolean;
  onShowCalendarChange: (show: boolean) => void;
}

export function DateRangeSelector({
  dateRange,
  onDateRangeChange,
  showCalendar,
  onShowCalendarChange
}: DateRangeSelectorProps) {
  const calendarRef = useRef<HTMLDivElement>(null);

  const handlePeriodChange = (direction: 'prev' | 'next') => {
    const newRange = calculateNewDateRange(dateRange, direction);
    onDateRangeChange(newRange);
  };

  return (
    <div className="flex items-center gap-3 relative">
      <Button
        onClick={() => handlePeriodChange('prev')}
        variant="default"
        size="icon"
        className="rounded-full"
      >
        <ChevronLeft size={20} />
      </Button>

      <div>
        <Button
          onClick={() => onShowCalendarChange(!showCalendar)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Calendar size={20} />
          {format(dateRange[0].startDate || new Date(), 'dd/MM/yyyy')} - 
          {format(dateRange[0].endDate || new Date(), 'dd/MM/yyyy')}
        </Button>
        
        {showCalendar && (
          <div
            ref={calendarRef}
            className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl"
          >
            <DateRangePicker
              ranges={dateRange}
              onChange={(item) => {
                onDateRangeChange([item.selection]);
                onShowCalendarChange(false);
              }}
              maxDate={new Date()}
              showDateDisplay={false}
              direction="vertical"
              months={1}
              className="rounded-lg"
            />
          </div>
        )}
      </div>

      <Button
        onClick={() => handlePeriodChange('next')}
        variant="default"
        size="icon"
        className="rounded-full"
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  );
}
