
import { format } from 'date-fns';

/**
 * Calculate the duration between two timestamps
 * @param startTime Start time in ISO string format
 * @param endTime End time in ISO string format or null for current time
 * @returns Formatted duration string in hours and minutes
 */
export const calculateSessionDuration = (startTime: string, endTime: string | null) => {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : new Date().getTime();
  const durationMs = end - start;
  
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}min`;
};

/**
 * Format a date to a readable string
 * @param dateString Date in ISO string format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
};
