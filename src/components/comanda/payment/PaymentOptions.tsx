
import React, { useEffect, useState } from 'react';

interface PaymentOptionsProps {
  forma_pagamento: '' | 'pix' | 'dinheiro' | 'cartao' | 'misto';
  onFormaPagamentoChange: (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => void;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  forma_pagamento,
  onFormaPagamentoChange,
}) => {
  const [selectedOption, setSelectedOption] = useState(forma_pagamento);
  
  // Update component state when prop changes (for real-time updates)
  useEffect(() => {
    setSelectedOption(forma_pagamento);
  }, [forma_pagamento]);
  
  const handleOptionChange = (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => {
    setSelectedOption(forma);
    onFormaPagamentoChange(forma);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Forma de Pagamento
        </label>
        <div className="mt-2 flex flex-wrap gap-4">
          {['pix', 'dinheiro', 'cartao', 'misto'].map((forma) => (
            <label 
              key={forma} 
              className={`flex items-center p-2 rounded-md transition-colors duration-200 cursor-pointer ${
                selectedOption === forma ? 'bg-blue-50 border border-blue-200' : 'border border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="formaPagamento"
                value={forma}
                checked={selectedOption === forma}
                onChange={() => handleOptionChange(forma as 'pix' | 'dinheiro' | 'cartao' | 'misto')}
                className="mr-2 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="text-sm">{forma.charAt(0).toUpperCase() + forma.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
