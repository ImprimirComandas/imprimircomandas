import { format } from 'date-fns';

export function calculateSessionDuration(start: string | null, end: string | null): string {
  try {
    if (!start) return '-';
    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) return '-';
    
    const endDate = end ? new Date(end) : new Date();
    if (end && isNaN(endDate.getTime())) return '-';
    
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error in calculateSessionDuration:', error);
    return '-';
  }
}

export function formatDate(date: string | null): string {
  try {
    if (!date) return '-';
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return '-';
    return format(parsedDate, 'dd/MM/yyyy HH:mm');
  } catch (error) {
    console.error('Error in formatDate:', error);
    return '-';
  }
}