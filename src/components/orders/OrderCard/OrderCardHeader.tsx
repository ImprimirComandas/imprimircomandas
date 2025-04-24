
import React from 'react';
import { getUltimos8Digitos } from '@/utils/printService';
import type { Comanda } from '@/types/orders';

interface OrderCardHeaderProps {
  comanda: Comanda;
  isExpanded: boolean;
  onExpand: () => void;
}

export function OrderCardHeader({ comanda, isExpanded, onExpand }: OrderCardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-bold text-gray-800">Pedido #{getUltimos8Digitos(comanda.id)}</h3>
        <p className="text-sm text-gray-500">
          {comanda.data ? new Date(comanda.data).toLocaleString('pt-BR') : 'Data indisponível'}
        </p>
        <p className="text-sm text-gray-500">Bairro: {comanda.bairro || 'Não especificado'}</p>
        <p className="text-sm text-gray-500">Endereço: {comanda.endereco || 'Não especificado'}</p>
        <p className="text-sm text-gray-500">Total: R$ {(comanda.total || 0).toFixed(2)}</p>
        {(comanda.forma_pagamento === 'dinheiro' || comanda.forma_pagamento === 'misto') && comanda.quantiapaga > 0 && (
          <>
            <p className="text-sm text-gray-500">Troco para: R$ {(comanda.quantiapaga || 0).toFixed(2)}</p>
            <p className="text-sm text-gray-500">Troco: R$ {(comanda.troco || 0).toFixed(2)}</p>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            comanda.pago ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
          }`}
        >
          {comanda.pago ? 'Pago' : 'Pendente'}
        </span>
        <button
          onClick={onExpand}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {isExpanded ? 'Ocultar' : 'Ver Detalhes'}
        </button>
      </div>
    </div>
  );
}
