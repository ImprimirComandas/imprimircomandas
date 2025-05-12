
import { startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { DateRange } from 'react-date-range';

export const getInitialDateRange = (): DateRange[] => [{
  startDate: startOfDay(new Date()),
  endDate: endOfDay(new Date()),
  key: 'selection'
}];

export const calculateNewDateRange = (
  currentRange: DateRange[],
  direction: 'prev' | 'next'
): DateRange[] => {
  if (!currentRange[0].startDate || !currentRange[0].endDate) {
    console.error("Invalid date range, missing startDate or endDate");
    return currentRange;
  }

  // Calculate the number of days in the current range
  const days = Math.ceil(
    Math.abs(
      (currentRange[0].endDate.getTime() || 0) - 
      (currentRange[0].startDate.getTime() || 0)
    ) / (1000 * 60 * 60 * 24)
  ) + 1;

  console.log(`Changing period by ${days} days in direction: ${direction}`);

  if (direction === 'prev') {
    const startDate = subDays(currentRange[0].startDate, days);
    const endDate = subDays(currentRange[0].endDate, days);
    console.log(`New dates - Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`);
    return [{ 
      startDate: startOfDay(startDate), 
      endDate: endOfDay(endDate), 
      key: 'selection' 
    }];
  } else {
    const startDate = addDays(currentRange[0].startDate, days);
    const endDate = addDays(currentRange[0].endDate, days);
    const maxDate = new Date();
    
    // Don't allow future dates
    if (startDate > maxDate) {
      console.log("Can't go to future dates");
      return currentRange;
    }
    
    const actualEndDate = Math.min(endDate.getTime(), maxDate.getTime()) === endDate.getTime() ? endDate : maxDate;
    console.log(`New dates - Start: ${startDate.toISOString()}, End: ${actualEndDate.toISOString()}`);
    
    return [{ 
      startDate: startOfDay(startDate), 
      endDate: endOfDay(actualEndDate),
      key: 'selection' 
    }];
  }
};
