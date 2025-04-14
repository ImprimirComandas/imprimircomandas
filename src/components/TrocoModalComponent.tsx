
import React from 'react';

interface TrocoModalProps {
  show: boolean;
  needsTroco: boolean | null;
  quantiapagaInput: number | null;
  totalComTaxa: number;
  onClose: () => void;
  onConfirm: () => void;
  onChange: (field: string, value: any) => void;
}

export default function TrocoModalComponent({
  show,
  needsTroco,
  quantiapagaInput,
  totalComTaxa,
  onClose,
  onConfirm,
  onChange,
}: TrocoModalProps) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Calcular Troco</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precisa de troco?
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="needsTroco"
                  value="true"
                  checked={needsTroco === true}
                  onChange={(e) => onChange('needsTroco', e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Sim</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="needsTroco"
                  value="false"
                  checked={needsTroco === false}
                  onChange={(e) => onChange('needsTroco', e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Não</span>
              </label>
            </div>
          </div>
          {needsTroco === true && (
            <div>
              <label htmlFor="quantiapagaInput" className="block text-sm font-medium text-gray-700">
                Quantia Paga
              </label>
              <input
                type="number"
                id="quantiapagaInput"
                name="quantiapagaInput"
                value={quantiapagaInput === null ? '' : quantiapagaInput}
                onChange={(e) => onChange('quantiapagaInput', e.target.value)}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                min={totalComTaxa}
                step="0.01"
              />
            </div>
          )}
          {needsTroco === true && quantiapagaInput !== null && quantiapagaInput >= totalComTaxa && (
            <div className="font-semibold text-gray-700">
              Troco: R$ {(quantiapagaInput - totalComTaxa).toFixed(2)}
            </div>
          )}
          {needsTroco === false && (
            <div className="font-semibold text-gray-700">
              Quantia Paga: R$ {totalComTaxa.toFixed(2)} (sem troco)
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
