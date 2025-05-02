
import React from 'react';

interface PaymentOptionsProps {
  forma_pagamento: '' | 'pix' | 'dinheiro' | 'cartao' | 'misto';
  onFormaPagamentoChange: (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => void;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  forma_pagamento,
  onFormaPagamentoChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Forma de Pagamento
        </label>
        <div className="mt-2 flex flex-wrap gap-4">
          {['pix', 'dinheiro', 'cartao', 'misto'].map((forma) => (
            <label key={forma} className="flex items-center">
              <input
                type="radio"
                name="formaPagamento"
                value={forma}
                checked={forma_pagamento === forma}
                onChange={() => onFormaPagamentoChange(forma as 'pix' | 'dinheiro' | 'cartao' | 'misto')}
                className="mr-2 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                required
              />
              <span className="text-sm">{forma.charAt(0).toUpperCase() + forma.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
