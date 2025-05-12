
import React, { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface PaymentTotalProps {
  subtotal: number;
  taxaentrega: number;
  total: number;
}

export const PaymentTotal: React.FC<PaymentTotalProps> = ({ subtotal, taxaentrega, total }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { isDark } = useTheme();
  
  // Visual feedback when values change
  useEffect(() => {
    setIsUpdating(true);
    const timer = setTimeout(() => {
      setIsUpdating(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [subtotal, taxaentrega, total]);
  
  return (
    <div className="mb-5 border rounded-lg p-3 bg-accent/30">
      <div className={`flex justify-between items-center mb-2 transition-colors duration-300 ${isUpdating ? 'bg-primary/10' : ''}`}>
        <h2 className="text-base font-semibold text-foreground">Subtotal:</h2>
        <span className="text-lg font-bold text-foreground">R$ {subtotal.toFixed(2)}</span>
      </div>
      <div className={`flex justify-between items-center mb-2 transition-colors duration-300 ${isUpdating ? 'bg-primary/10' : ''}`}>
        <h3 className="text-base text-muted-foreground">Entrega:</h3>
        <span className="text-base font-bold text-muted-foreground">R$ {taxaentrega.toFixed(2)}</span>
      </div>
      <div className={`flex justify-between items-center p-2 rounded bg-primary/10 transition-all duration-300 ${isUpdating ? 'scale-105' : ''}`}>
        <h2 className="text-base font-semibold text-foreground">Total:</h2>
        <span className="text-lg font-bold text-primary">R$ {total.toFixed(2)}</span>
      </div>
    </div>
  );
};
