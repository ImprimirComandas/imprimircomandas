
import { useRef } from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRange } from 'react-date-range';
import { Button } from '@/components/ui/button';
import { RangeKeyDict } from 'react-date-range';
import { useTheme } from '@/hooks/useTheme';
import 'react-date-range/dist/styles.css'; // Import styles
import 'react-date-range/dist/theme/default.css'; // Import theme

interface DateRangeSelectorProps {
  dateRange: DateRange[];
  onDateRangeChange: (range: RangeKeyDict) => void;
  showCalendar: boolean;
  onShowCalendarChange: (show: boolean) => void;
  onChangePeriod: (direction: 'prev' | 'next') => void;
}

export function DateRangeSelector({
  dateRange,
  onDateRangeChange,
  showCalendar,
  onShowCalendarChange,
  onChangePeriod
}: DateRangeSelectorProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  // This function now directly calls the parent's onChangePeriod function
  const handlePeriodChange = (direction: 'prev' | 'next') => {
    console.log(`DateRangeSelector: Calling onChangePeriod with direction: ${direction}`);
    onChangePeriod(direction);
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
            className="absolute z-50 mt-2 bg-card border border-border rounded-lg shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <DateRange
              ranges={dateRange}
              onChange={onDateRangeChange}
              maxDate={new Date()}
              showDateDisplay={false}
              direction="vertical"
              months={1}
              className="rounded-lg"
              color={isDark ? 'hsl(var(--primary))' : 'hsl(var(--primary))'}
              rangeColors={[isDark ? 'hsl(var(--primary))' : 'hsl(var(--primary))']}
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
