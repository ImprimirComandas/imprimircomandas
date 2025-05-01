
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { getThemeClasses } from '../../lib/theme';

interface AddressFormProps {
  endereco: string;
  bairro: string;
  bairrosDisponiveis: string[];
  taxaentrega: number;
  onChange: (field: string, value: string) => void;
  onBairroChange: (bairro: string) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  endereco,
  bairro,
  bairrosDisponiveis,
  taxaentrega,
  onChange,
  onBairroChange,
}) => {
  const { theme } = useTheme();
  
  const inputClasses = getThemeClasses(theme, {
    light: "bg-white border-gray-300 text-gray-900",
    dark: "bg-gray-800 border-gray-600 text-gray-100",
    lightBlue: "bg-blue-50 border-blue-200 text-blue-900",
    darkPurple: "bg-purple-900 border-purple-700 text-gray-100"
  });
  
  const labelClasses = getThemeClasses(theme, {
    light: "text-gray-700",
    dark: "text-gray-300",
    lightBlue: "text-blue-800",
    darkPurple: "text-gray-300"
  });
  
  const warningClasses = getThemeClasses(theme, {
    light: "text-amber-600 bg-amber-100",
    dark: "text-amber-400 bg-amber-900/50",
    lightBlue: "text-amber-700 bg-amber-50",
    darkPurple: "text-amber-300 bg-amber-900/50"
  });

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="endereco" className={`block text-sm font-medium ${labelClasses}`}>
          Endereço de Entrega
        </label>
        <input
          id="endereco"
          type="text"
          value={endereco}
          onChange={(e) => onChange('endereco', e.target.value)}
          placeholder="Endereço de entrega"
          className={`w-full p-2 border rounded text-sm ${inputClasses}`}
          required
        />
      </div>

      <div>
        <label htmlFor="bairro" className={`block text-sm font-medium ${labelClasses}`}>
          Bairro
        </label>
        {bairrosDisponiveis.length > 0 ? (
          <select
            id="bairro"
            value={bairro}
            onChange={(e) => onBairroChange(e.target.value)}
            className={`w-full p-2 border rounded text-sm ${inputClasses}`}
            required
          >
            <option value="">Selecione o bairro</option>
            {bairrosDisponiveis.map((bairroOption) => (
              <option key={bairroOption} value={bairroOption}>
                {bairroOption} {bairro === bairroOption && taxaentrega > 0 ? `(R$ ${taxaentrega.toFixed(2)})` : ''}
              </option>
            ))}
          </select>
        ) : (
          <div className={`text-sm ${warningClasses} p-2 rounded`}>
            Nenhum bairro cadastrado. Por favor, adicione bairros nas configurações.
          </div>
        )}
      </div>
    </div>
  );
};
