
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

/**
 * Calculate the payment for a motoboy based on the new shop rules
 * @param session Motoboy session data
 * @param deliveries List of deliveries
 * @param defaultNeighborhood Default store neighborhood
 * @param defaultDeliveryRate Default delivery rate for the default neighborhood
 */
export function calculateMotoboyPayment(
  session: { start_time: string; end_time: string | null },
  deliveries: { bairro: string; valor_entrega: number }[],
  defaultNeighborhood: string = 'Jardim Paraíso',
  defaultDeliveryRate: number = 6
): { 
  payment: number; 
  details: { 
    basePayment: number;
    extraDeliveries: number;
    extraRates: number;
    hours: number;
    defaultNeighborhoodDeliveries: number;
    otherNeighborhoodDeliveries: number;
    requiredDefaultDeliveries: number;
  }
} {
  // Calculate session duration in hours
  const startTime = new Date(session.start_time);
  const endTime = session.end_time ? new Date(session.end_time) : new Date();
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  
  // Normalize default neighborhood name for case-insensitive comparison
  const normalizedDefaultNeighborhood = defaultNeighborhood.toLowerCase().trim();

  // Count deliveries by neighborhood type
  const defaultNeighborhoodDeliveries = deliveries.filter(
    d => d.bairro.toLowerCase().trim() === normalizedDefaultNeighborhood
  ).length;
  const otherNeighborhoodDeliveries = deliveries.length - defaultNeighborhoodDeliveries;
  
  // Payment calculation variables
  let basePayment = 0;
  let extraDeliveries = 0;
  let extraRates = 0;
  let requiredDefaultDeliveries = 0;

  // Calculate required deliveries and base payment based on hours worked
  if (durationHours <= 6) {
    // 6-hour shift: R$90 base for 10 default neighborhood deliveries
    basePayment = 90;
    requiredDefaultDeliveries = 10;
  } else if (durationHours <= 12) {
    // 12-hour shift: R$180 base for 20 default neighborhood deliveries
    basePayment = 180;
    requiredDefaultDeliveries = 20;
  } else {
    // For shifts longer than 12 hours, calculate proportionally
    const shiftMultiplier = Math.ceil(durationHours / 12);
    basePayment = 180 * shiftMultiplier;
    requiredDefaultDeliveries = 20 * shiftMultiplier;
  }
  
  // Calculate extra payment for deliveries beyond the required amount
  if (defaultNeighborhoodDeliveries > requiredDefaultDeliveries) {
    const additionalDefaultDeliveries = defaultNeighborhoodDeliveries - requiredDefaultDeliveries;
    extraDeliveries += additionalDefaultDeliveries * defaultDeliveryRate;
  }
  
  // Add payment for all non-default neighborhood deliveries
  if (otherNeighborhoodDeliveries > 0) {
    // Sum the extra amount above the default rate for each delivery
    deliveries.forEach(delivery => {
      if (delivery.bairro.toLowerCase().trim() !== normalizedDefaultNeighborhood) {
        // Add the difference between the actual rate and default rate
        extraRates += Math.max(0, delivery.valor_entrega - defaultDeliveryRate);
      }
    });
  }
  
  // Calculate total payment
  const totalPayment = basePayment + extraDeliveries + extraRates;
  
  return {
    payment: totalPayment,
    details: {
      basePayment,
      extraDeliveries,
      extraRates,
      hours: Math.ceil(durationHours),
      defaultNeighborhoodDeliveries,
      otherNeighborhoodDeliveries,
      requiredDefaultDeliveries
    }
  };
}
