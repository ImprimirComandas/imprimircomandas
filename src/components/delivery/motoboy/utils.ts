
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

export function summarizeDeliveries(stats: { bairro: string, count: number }[]): { 
  totalDeliveries: number; 
  byNeighborhood: { name: string; count: number }[] 
} {
  if (!stats || !Array.isArray(stats)) {
    return { totalDeliveries: 0, byNeighborhood: [] };
  }

  // Calculate total from all neighborhoods
  const totalDeliveries = stats.reduce((sum, item) => sum + item.count, 0);
  
  // Format for display
  const byNeighborhood = stats.map(s => ({
    name: s.bairro,
    count: s.count
  })).sort((a, b) => b.count - a.count);

  return { totalDeliveries, byNeighborhood };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
