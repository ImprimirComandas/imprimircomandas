
/**
 * Format a number as a currency string
 * @param value The number to format
 * @returns A formatted currency string
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default formatCurrency;
