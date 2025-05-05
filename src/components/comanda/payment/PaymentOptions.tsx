
import React, { useEffect, useState } from 'react';
import type { Comanda } from '../../../types/database';

interface PaymentOptionsProps {
  forma_pagamento: Comanda['forma_pagamento'];
  onFormaPagamentoChange: (forma: Comanda['forma_pagamento']) => void;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  forma_pagamento,
  onFormaPagamentoChange,
}) => {
  const [selectedOption, setSelectedOption] = useState<Comanda['forma_pagamento']>(forma_pagamento);
  
  // Update local state when prop changes
  useEffect(() => {
    setSelectedOption(forma_pagamento);
  }, [forma_pagamento]);
  
  const handleOptionChange = (forma: Comanda['forma_pagamento']) => {
    setSelectedOption(forma);
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
                selectedOption === forma 
                  ? 'bg-blue-100 border-2 border-blue-500 font-medium shadow-sm' 
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="formaPagamento"
                value={forma}
                checked={selectedOption === forma}
                onChange={() => handleOptionChange(forma as Comanda['forma_pagamento'])}
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm capitalize">{forma}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
