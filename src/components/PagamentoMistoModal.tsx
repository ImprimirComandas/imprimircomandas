
import React, { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

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
  const { isDark } = useTheme();
  
  if (!show) return null;
  
  const totalAtual = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
  const diferenca = totalComTaxa - totalAtual;
  
  // Calculando o troco automaticamente se o pagamento em dinheiro for maior que o necessário
  const valorOutrasFormas = (valorCartaoInput || 0) + (valorPixInput || 0);
  const valorNecessarioEmDinheiro = Math.max(0, totalComTaxa - valorOutrasFormas);
  const valorDinheiroAtual = valorDinheiroInput || 0;
  
  // Se o dinheiro for maior que o necessário, calcula o troco
  const troco = valorDinheiroAtual > valorNecessarioEmDinheiro
    ? valorDinheiroAtual - valorNecessarioEmDinheiro
    : 0;
  
  // Consideramos a confirmação válida se o valor total é pelo menos o valor da taxa
  const confirmacaoValida = totalAtual >= totalComTaxa;

  // Efeito para confirmar automaticamente quando o valor estiver correto
  useEffect(() => {
    if (confirmacaoValida && Math.abs(diferenca) < 0.01 && !troco) {
      // Delay pequeno para dar feedback visual ao usuário antes de confirmar
      const timer = setTimeout(() => {
        onConfirm();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [confirmacaoValida, diferenca, troco, onConfirm]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card text-card-foreground border border-border rounded-lg p-6 max-w-md w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-foreground">Pagamento Misto</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="valorCartaoInput" className="block text-sm font-medium text-foreground">
              Valor no Cartão
            </label>
            <input
              type="number"
              id="valorCartaoInput"
              name="valorCartaoInput"
              value={valorCartaoInput === null ? '' : valorCartaoInput}
              onChange={(e) => onChange('valorCartaoInput', e.target.value)}
              className="mt-1 p-2 w-full border border-input bg-background text-foreground rounded-md"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="valorDinheiroInput" className="block text-sm font-medium text-foreground">
              Valor em Dinheiro
            </label>
            <input
              type="number"
              id="valorDinheiroInput"
              name="valorDinheiroInput"
              value={valorDinheiroInput === null ? '' : valorDinheiroInput}
              onChange={(e) => onChange('valorDinheiroInput', e.target.value)}
              className="mt-1 p-2 w-full border border-input bg-background text-foreground rounded-md"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="valorPixInput" className="block text-sm font-medium text-foreground">
              Valor no PIX
            </label>
            <input
              type="number"
              id="valorPixInput"
              name="valorPixInput"
              value={valorPixInput === null ? '' : valorPixInput}
              onChange={(e) => onChange('valorPixInput', e.target.value)}
              className="mt-1 p-2 w-full border border-input bg-background text-foreground rounded-md"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="p-3 bg-accent rounded-md border border-border">
            <div className="font-semibold text-foreground mb-1">
              Total a pagar: R$ {totalComTaxa.toFixed(2)}
            </div>
            
            <div className="font-semibold text-foreground mb-1">
              Total informado: R$ {totalAtual.toFixed(2)}
            </div>
            
            {diferenca > 0 && (
              <div className="font-semibold text-orange-500 dark:text-orange-400">
                Faltando: R$ {diferenca.toFixed(2)}
              </div>
            )}

            {troco > 0 && (
              <div className="font-semibold text-green-600 dark:text-green-400">
                Troco: R$ {troco.toFixed(2)}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 px-4 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`py-2 px-4 rounded-md transition-colors ${
                confirmacaoValida 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              disabled={!confirmacaoValida}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
