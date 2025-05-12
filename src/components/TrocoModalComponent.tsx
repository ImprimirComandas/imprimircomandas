
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { toast } from '@/hooks/use-toast';

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
  const { isDark } = useTheme();
  
  if (!show) return null;

  const handleSetNeedsTroco = (value: boolean) => {
    console.log(`TrocoModalComponent: Setting needsTroco to:`, value);
    // Pass the boolean value directly, not as a string
    onChange('needsTroco', value);
  };

  const handleQuantiaPagaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : null;
    console.log(`TrocoModalComponent: Setting quantiapagaInput to:`, value);
    onChange('quantiapagaInput', value);
  };

  const handleConfirm = () => {
    if (needsTroco === true && (!quantiapagaInput || quantiapagaInput < totalComTaxa)) {
      toast({
        title: "Erro",
        description: "O valor informado deve ser maior ou igual ao total do pedido",
        variant: "destructive"
      });
      return;
    }
    
    onConfirm();
  };

  // Calculate the change amount
  const trocoAmount = needsTroco === true && quantiapagaInput !== null && quantiapagaInput >= totalComTaxa 
    ? quantiapagaInput - totalComTaxa 
    : 0;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-card text-card-foreground border border-border rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-foreground">Calcular Troco</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Precisa de troco?
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleSetNeedsTroco(true)}
                className={`px-4 py-2 rounded-md ${
                  needsTroco === true 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => handleSetNeedsTroco(false)}
                className={`px-4 py-2 rounded-md ${
                  needsTroco === false 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                Não
              </button>
            </div>
          </div>
          {needsTroco === true && (
            <div>
              <label htmlFor="quantiapagaInput" className="block text-sm font-medium text-foreground">
                Quantia Paga
              </label>
              <input
                type="number"
                id="quantiapagaInput"
                name="quantiapagaInput"
                value={quantiapagaInput === null ? '' : quantiapagaInput}
                onChange={handleQuantiaPagaChange}
                className="mt-1 p-2 w-full border border-input rounded-md bg-background text-foreground"
                min={totalComTaxa}
                step="0.01"
              />
              
              {quantiapagaInput !== null && quantiapagaInput >= totalComTaxa && (
                <div className="mt-2 font-semibold text-primary">
                  Troco: R$ {trocoAmount.toFixed(2)}
                </div>
              )}
            </div>
          )}
          {needsTroco === false && (
            <div className="font-semibold text-foreground">
              Quantia Paga: R$ {totalComTaxa.toFixed(2)} (sem troco)
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground py-2 px-4 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={needsTroco === null}
              className={`py-2 px-4 rounded-md transition-colors ${
                needsTroco === null
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
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
