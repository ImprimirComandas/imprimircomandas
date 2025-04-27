
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
  const days = Math.ceil(
    Math.abs(
      (currentRange[0].endDate?.getTime() || 0) - 
      (currentRange[0].startDate?.getTime() || 0)
    ) / (1000 * 60 * 60 * 24)
  ) + 1;

  if (direction === 'prev') {
    const startDate = subDays(currentRange[0].startDate || new Date(), days);
    const endDate = subDays(currentRange[0].endDate || new Date(), days);
    return [{ ...currentRange[0], startDate, endDate }];
  } else {
    const startDate = addDays(currentRange[0].startDate || new Date(), days);
    const endDate = addDays(currentRange[0].endDate || new Date(), days);
    return [{ ...currentRange[0], startDate, endDate }];
  }
};
