
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';

interface TrocoModalProps {
  show: boolean;
  needsTroco: boolean | null;
  quantiapagaInput: string | number | null;
  totalComTaxa: number;
  onClose: () => void;
  onConfirm: () => void;
  onChange: (field: string, value: any) => void;
  onSaveAndPrint?: () => void;
}

export default function TrocoModal({
  show,
  needsTroco,
  quantiapagaInput,
  totalComTaxa,
  onClose,
  onConfirm,
  onChange,
  onSaveAndPrint,
}: TrocoModalProps) {
  const { isDark } = useTheme();
  
  if (!show) return null;

  const handleSetNeedsTroco = (value: boolean) => {
    console.log(`Setting needsTroco to:`, value);
    onChange('needsTroco', value);
  };

  const handleQuantiaPagaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('quantiapagaInput', e.target.value);
  };

  const handleConfirmAndSave = () => {
    if (needsTroco === true) {
      const value = typeof quantiapagaInput === 'string' 
        ? parseFloat(quantiapagaInput) 
        : quantiapagaInput;
        
      if (!value || value < totalComTaxa) {
        toast.error("O valor informado deve ser maior ou igual ao total do pedido");
        return;
      }
    }
    
    onConfirm();
    if (onSaveAndPrint) {
      onSaveAndPrint();
    }
  };

  // Parse the input value for display
  const parseQuantiaPaga = () => {
    if (typeof quantiapagaInput === 'string') {
      return quantiapagaInput ? parseFloat(quantiapagaInput) : null;
    }
    return quantiapagaInput;
  };
  
  // Calculate the change amount
  const getTrocoAmount = () => {
    const value = parseQuantiaPaga();
    if (needsTroco === true && value !== null && value > totalComTaxa) {
      return value - totalComTaxa;
    }
    return 0;
  };
  
  const trocoAmount = getTrocoAmount();

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`bg-card text-card-foreground rounded-xl p-6 w-full max-w-sm sm:max-w-md shadow-lg border border-border transform transition-all duration-300 ${
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-5">
          Precisa de Troco?
        </h2>
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => handleSetNeedsTroco(true)}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              needsTroco === true
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            type="button"
            aria-pressed={needsTroco === true}
          >
            Sim
          </button>
          <button
            onClick={() => handleSetNeedsTroco(false)}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              needsTroco === false
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            type="button"
            aria-pressed={needsTroco === false}
          >
            Não
          </button>
        </div>
        {needsTroco === true && (
          <div className="mb-5">
            <label
              htmlFor="quantiapaga"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Quantia Paga (R$)
            </label>
            <input
              id="quantiapaga"
              type="number"
              value={typeof quantiapagaInput === 'string' ? 
                quantiapagaInput : 
                quantiapagaInput !== null ? String(quantiapagaInput) : ''}
              onChange={handleQuantiaPagaChange}
              placeholder="Digite a quantia paga"
              className="w-full p-2.5 border border-input bg-background text-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
              step="0.01"
              min={totalComTaxa}
              aria-describedby="troco-info"
            />
            {parseQuantiaPaga() !== null && parseQuantiaPaga()! > totalComTaxa && (
              <p id="troco-info" className="mt-2 text-sm font-medium text-primary">
                Troco: R$ {trocoAmount.toFixed(2)}
              </p>
            )}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all duration-200"
            aria-label="Cancelar"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmAndSave}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              needsTroco === null
                ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            disabled={needsTroco === null}
            aria-label="Confirmar"
            type="button"
          >
            Confirmar e Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
