
import React, { useEffect, useState } from 'react';

interface PagamentoMistoModalProps {
  show: boolean;
  totalComTaxa: number;
  valorCartaoInput: number | null;
  valorDinheiroInput: number | null;
  valorPixInput: number | null;
  onClose: () => void;
  onConfirm: () => void;
  onChange: (field: string, value: string | number) => void;
}

export default function PagamentoMistoModal({
  show,
  totalComTaxa,
  valorCartaoInput,
  valorDinheiroInput,
  valorPixInput,
  onClose,
  onConfirm,
  onChange,
}: PagamentoMistoModalProps) {
  if (!show) return null;
  
  const totalAtual = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
  const diferenca = totalComTaxa - totalAtual;
  
  // Calculando o troco automaticamente se o pagamento em dinheiro for maior que o necessário
  const valorOutrasFormas = (valorCartaoInput || 0) + (valorPixInput || 0);
  const valorNecessarioEmDinheiro = totalComTaxa - valorOutrasFormas;
  const troco = (valorDinheiroInput || 0) > valorNecessarioEmDinheiro && valorDinheiroInput 
    ? valorDinheiroInput - valorNecessarioEmDinheiro 
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Pagamento Misto</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="valorCartaoInput" className="block text-sm font-medium text-gray-700">
              Valor no Cartão
            </label>
            <input
              type="number"
              id="valorCartaoInput"
              name="valorCartaoInput"
              value={valorCartaoInput === null ? '' : valorCartaoInput}
              onChange={(e) => onChange('valorCartaoInput', e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="valorDinheiroInput" className="block text-sm font-medium text-gray-700">
              Valor em Dinheiro
            </label>
            <input
              type="number"
              id="valorDinheiroInput"
              name="valorDinheiroInput"
              value={valorDinheiroInput === null ? '' : valorDinheiroInput}
              onChange={(e) => onChange('valorDinheiroInput', e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="valorPixInput" className="block text-sm font-medium text-gray-700">
              Valor no PIX
            </label>
            <input
              type="number"
              id="valorPixInput"
              name="valorPixInput"
              value={valorPixInput === null ? '' : valorPixInput}
              onChange={(e) => onChange('valorPixInput', e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              min="0"
              step="0.01"
            />
          </div>
          <div className="font-semibold text-gray-700">
            Total a pagar: R$ {totalComTaxa.toFixed(2)}
          </div>
          <div className={`font-semibold ${Math.abs(diferenca) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(diferenca) < 0.01
              ? 'Valores conferem!'
              : `Diferença: R$ ${diferenca.toFixed(2)} ${diferenca > 0 ? '(faltando)' : '(excedente)'}`}
          </div>

          {troco > 0 && (
            <div className="font-semibold text-green-600">
              Troco: R$ {troco.toFixed(2)}
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
              disabled={Math.abs(diferenca) >= 0.01}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
