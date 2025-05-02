
import React from 'react';

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
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
          Endereço de Entrega
        </label>
        <input
          id="endereco"
          type="text"
          value={endereco}
          onChange={(e) => onChange('endereco', e.target.value)}
          placeholder="Endereço de entrega"
          className="w-full p-2 border rounded text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
          Bairro
        </label>
        <select
          id="bairro"
          value={bairro}
          onChange={(e) => onBairroChange(e.target.value)}
          className="w-full p-2 border rounded text-sm"
          required
        >
          <option value="">Selecione o bairro</option>
          {bairrosDisponiveis.map((bairroOption) => (
            <option key={bairroOption} value={bairroOption}>
              {bairroOption} {bairro === bairroOption && taxaentrega > 0 ? `(R$ ${taxaentrega.toFixed(2)})` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
