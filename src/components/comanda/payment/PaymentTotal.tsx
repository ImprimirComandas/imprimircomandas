
import React from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { getThemeClasses } from '../../../lib/theme';

interface PaymentTotalProps {
  subtotal: number;
  taxaentrega: number;
  total: number;
}

export const PaymentTotal: React.FC<PaymentTotalProps> = ({ subtotal, taxaentrega, total }) => {
  const { theme } = useTheme();
  
  return (
    <div>
      <div className={`flex justify-between items-center mb-2 ${getThemeClasses(theme, {
        light: "text-gray-900",
        dark: "text-gray-100",
        lightBlue: "text-blue-900",
        darkPurple: "text-purple-100"
      })}`}>
        <h2 className="text-base font-semibold">Subtotal:</h2>
        <span className="text-lg font-bold">R$ {subtotal.toFixed(2)}</span>
      </div>
      <div className={`flex justify-between items-center mb-2 ${getThemeClasses(theme, {
        light: "text-gray-900",
        dark: "text-gray-100",
        lightBlue: "text-blue-900",
        darkPurple: "text-purple-100"
      })}`}>
        <h3 className="text-base">Entrega:</h3>
        <span className="text-base font-bold">R$ {taxaentrega.toFixed(2)}</span>
      </div>
      <div className={`flex justify-between items-center mb-4 p-2 rounded ${getThemeClasses(theme, {
        light: "bg-green-50 text-green-700",
        dark: "bg-green-900/30 text-green-300",
        lightBlue: "bg-blue-50 text-blue-700",
        darkPurple: "bg-purple-900/30 text-purple-300"
      })}`}>
        <h2 className="text-base font-semibold">Total:</h2>
        <span className="text-lg font-bold">R$ {total.toFixed(2)}</span>
      </div>
    </div>
  );
};
