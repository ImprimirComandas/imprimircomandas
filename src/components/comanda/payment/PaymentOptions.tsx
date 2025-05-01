
import React from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { getThemeClasses } from '../../../lib/theme';

interface PaymentOptionsProps {
  forma_pagamento: '' | 'pix' | 'dinheiro' | 'cartao' | 'misto';
  onFormaPagamentoChange: (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => void;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  forma_pagamento,
  onFormaPagamentoChange,
}) => {
  const { theme } = useTheme();
  
  const labelClasses = getThemeClasses(theme, {
    light: "text-gray-700",
    dark: "text-gray-300",
    lightBlue: "text-blue-800",
    darkPurple: "text-purple-200"
  });
  
  const textClasses = getThemeClasses(theme, {
    light: "text-gray-900",
    dark: "text-gray-100",
    lightBlue: "text-blue-900",
    darkPurple: "text-purple-100"
  });
  
  return (
    <div className="space-y-4">
      <div>
        <label className={`block text-sm font-medium ${labelClasses}`}>
          Forma de Pagamento
        </label>
        <div className="mt-2 flex flex-wrap gap-4">
          {['pix', 'dinheiro', 'cartao', 'misto'].map((forma) => (
            <label key={forma} className={`flex items-center ${textClasses}`}>
              <input
                type="radio"
                name="formaPagamento"
                value={forma}
                checked={forma_pagamento === forma}
                onChange={() => onFormaPagamentoChange(forma as 'pix' | 'dinheiro' | 'cartao' | 'misto')}
                className={`mr-2 h-4 w-4 ${getThemeClasses(theme, {
                  light: "text-green-600 border-gray-300 focus:ring-green-500",
                  dark: "text-green-500 border-gray-700 focus:ring-green-600",
                  lightBlue: "text-blue-600 border-blue-300 focus:ring-blue-500",
                  darkPurple: "text-purple-500 border-purple-700 focus:ring-purple-600"
                })}`}
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
