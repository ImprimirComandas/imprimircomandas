
import { Check, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import type { Comanda } from '../types/database';

interface PaymentConfirmationModalProps {
  show: boolean;
  comanda: Comanda | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function PaymentConfirmationModal({
  show,
  comanda,
  onClose,
  onConfirm,
}: PaymentConfirmationModalProps) {
  const { isDark } = useTheme();
  
  if (!show || !comanda) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
      onClick={(e) => {
        // Close when clicking outside the modal
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-card text-card-foreground rounded-xl p-6 w-full max-w-sm sm:max-w-md shadow-lg border border-border transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            Confirmar Pagamento
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" title="Fechar">
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-lg text-foreground">
            Pedido #{comanda.id?.slice(-8) || 'N/A'}
          </p>
          <p className="text-muted-foreground mt-2">
            Total: R$ {comanda.total.toFixed(2)}
          </p>
          <p className="text-muted-foreground">
            Forma de pagamento: {comanda.forma_pagamento.toUpperCase()}
          </p>
          <p className="text-muted-foreground">
            Status atual: <span className={`font-medium ${comanda.pago ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {comanda.pago ? 'PAGO' : 'NÃO PAGO'}
            </span>
          </p>
        </div>

        <div className="text-center mb-4">
          <p className="text-foreground font-medium">
            Deseja {comanda.pago ? 'cancelar o pagamento' : 'confirmar o pagamento'} deste pedido?
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              comanda.pago 
                ? 'bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800' 
                : 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
            } shadow-sm`}
          >
            <Check size={18} />
            {comanda.pago ? 'Marcar como Não Pago' : 'Confirmar Pagamento'}
          </button>
        </div>
      </div>
    </div>
  );
}
