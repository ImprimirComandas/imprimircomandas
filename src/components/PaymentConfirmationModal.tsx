
import { Check, X } from 'lucide-react';
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
  if (!show || !comanda) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-sm sm:max-w-md shadow-lg transform transition-all duration-300"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Confirmar Pagamento
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-lg text-gray-700">
            Pedido #{comanda.id?.slice(-8) || 'N/A'}
          </p>
          <p className="text-gray-600 mt-2">
            Total: R$ {comanda.total.toFixed(2)}
          </p>
          <p className="text-gray-600">
            Forma de pagamento: {comanda.forma_pagamento.toUpperCase()}
          </p>
          <p className="text-gray-600">
            Status atual: {comanda.pago ? 'PAGO' : 'NÃO PAGO'}
          </p>
        </div>

        <div className="text-center mb-4">
          <p className="text-gray-700 font-medium">
            Deseja {comanda.pago ? 'cancelar o pagamento' : 'confirmar o pagamento'} deste pedido?
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-green-600 text-white hover:bg-green-700 shadow-sm flex items-center gap-2"
          >
            <Check size={18} />
            {comanda.pago ? 'Marcar como Não Pago' : 'Confirmar Pagamento'}
          </button>
        </div>
      </div>
    </div>
  );
}
