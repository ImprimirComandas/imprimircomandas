import React, { useMemo } from 'react';

interface PagamentoMistoModalProps {
  show: boolean;
  totalComTaxa: number;
  valorCartaoInput: string;
  valorDinheiroInput: string;
  valorPixInput: string;
  onClose: () => void;
  onConfirm: (paymentDetails: { cartao: number; dinheiro: number; pix: number; troco: number | null }) => void;
  onChange: (field: string, value: string) => void;
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
  // Parse input values safely
  const parseInput = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  };

  // Calculate totals and troco using useMemo for performance
  const { totalAtual, remaining, troco } = useMemo(() => {
    const cartao = parseInput(valorCartaoInput);
    const dinheiro = parseInput(valorDinheiroInput);
    const pix = parseInput(valorPixInput);
    const total = cartao + dinheiro + pix;
    const remainingBalance = totalComTaxa - total;
    const cashTroco = dinheiro > 0 ? Math.max(dinheiro - Math.max(totalComTaxa - cartao - pix, 0), 0) : 0;

    return {
      totalAtual: total,
      remaining: remainingBalance > 0 ? remainingBalance : 0,
      troco: cashTroco > 0 ? cashTroco : null,
    };
  }, [valorCartaoInput, valorDinheiroInput, valorPixInput, totalComTaxa]);

  if (!show) return null;

  // Determine if Confirm button should be enabled
  const isConfirmDisabled = totalAtual < totalComTaxa;

  // Handle input change with validation
  const handleInputChange = (field: string, value: string) => {
    // Allow empty input or valid number (including decimals)
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onChange(field, value);
    }
  };

  // Handle confirm action
  const handleConfirm = () => {
    if (!isConfirmDisabled) {
      onConfirm({
        cartao: parseInput(valorCartaoInput),
        dinheiro: parseInput(valorDinheiroInput),
        pix: parseInput(valorPixInput),
        troco,
      });
    }
  };

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
              value={valorCartaoInput}
              onChange={(e) => handleInputChange('valorCartaoInput', e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              min="0"
              step="0.01"
              placeholder="0.00"
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
              value={valorDinheiroInput}
              onChange={(e) => handleInputChange('valorDinheiroInput', e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              min="0"
              step="0.01"
              placeholder="0.00"
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
              value={valorPixInput}
              onChange={(e) => handleInputChange('valorPixInput', e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-gray-700">
              Total a pagar: R$ {totalComTaxa.toFixed(2)}
            </div>
            <div className="font-semibold text-gray-700">
              Total pago: R$ {totalAtual.toFixed(2)}
            </div>
            {remaining > 0 && (
              <div className="text-red-600 font-semibold">
                Faltando: R$ {remaining.toFixed(2)}
              </div>
            )}
            {troco !== null && (
              <div className="text-green-600 font-semibold">
                Troco (dinheiro): R$ {troco.toFixed(2)}
              </div>
            )}
            {totalAtual >= totalComTaxa && remaining === 0 && troco === null && (
              <div className="text-green-600 font-semibold">Valores conferem!</div>
            )}
          </div>
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
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className={`py-2 px-4 rounded-md ${
                isConfirmDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}