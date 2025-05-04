
import React, { useEffect, useState } from 'react';

interface PaymentOptionsProps {
  forma_pagamento: '' | 'pix' | 'dinheiro' | 'cartao' | 'misto';
  onFormaPagamentoChange: (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => void;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  forma_pagamento,
  onFormaPagamentoChange,
}) => {
  const handleOptionChange = (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => {
    console.log("Selecting payment method:", forma);
    onFormaPagamentoChange(forma);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Forma de Pagamento <span className="text-red-500">*</span>
        </label>
        <div className="mt-2 flex flex-wrap gap-3">
          {['pix', 'dinheiro', 'cartao', 'misto'].map((forma) => (
            <label 
              key={forma} 
              className={`flex items-center p-3 rounded-md transition-colors duration-200 cursor-pointer ${
                forma_pagamento === forma 
                  ? 'bg-green-100 border-2 border-green-500 font-medium shadow-sm' 
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleOptionChange(forma as 'pix' | 'dinheiro' | 'cartao' | 'misto')}
            >
              <input
                type="radio"
                name="formaPagamento"
                value={forma}
                checked={forma_pagamento === forma}
                onChange={() => {}} // Controlled via the onClick handler on the label
                className="mr-2 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="text-sm capitalize">{forma}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
