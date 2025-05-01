
import React from 'react';

interface PaymentTotalProps {
  subtotal: number;
  taxaentrega: number;
  total: number;
}

export const PaymentTotal: React.FC<PaymentTotalProps> = ({ subtotal, taxaentrega, total }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-semibold">Subtotal:</h2>
        <span className="text-lg font-bold">R$ {subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base">Entrega:</h3>
        <span className="text-base font-bold">R$ {taxaentrega.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center mb-4 bg-green-50 p-2 rounded">
        <h2 className="text-base font-semibold">Total:</h2>
        <span className="text-lg font-bold text-green-700">R$ {total.toFixed(2)}</span>
      </div>
    </div>
  );
};
