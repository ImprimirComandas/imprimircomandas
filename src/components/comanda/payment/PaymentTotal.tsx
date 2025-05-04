
import React, { useEffect, useState } from 'react';

interface PaymentTotalProps {
  subtotal: number;
  taxaentrega: number;
  total: number;
}

export const PaymentTotal: React.FC<PaymentTotalProps> = ({ subtotal, taxaentrega, total }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Visual feedback when values change
  useEffect(() => {
    setIsUpdating(true);
    const timer = setTimeout(() => {
      setIsUpdating(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [subtotal, taxaentrega, total]);
  
  return (
    <div>
      <div className={`flex justify-between items-center mb-2 transition-colors duration-300 ${isUpdating ? 'bg-blue-50' : ''}`}>
        <h2 className="text-base font-semibold">Subtotal:</h2>
        <span className="text-lg font-bold">R$ {subtotal.toFixed(2)}</span>
      </div>
      <div className={`flex justify-between items-center mb-2 transition-colors duration-300 ${isUpdating ? 'bg-blue-50' : ''}`}>
        <h3 className="text-base">Entrega:</h3>
        <span className="text-base font-bold">R$ {taxaentrega.toFixed(2)}</span>
      </div>
      <div className={`flex justify-between items-center mb-4 bg-green-50 p-2 rounded transition-all duration-300 ${isUpdating ? 'scale-105' : ''}`}>
        <h2 className="text-base font-semibold">Total:</h2>
        <span className="text-lg font-bold text-green-700">R$ {total.toFixed(2)}</span>
      </div>
    </div>
  );
};
