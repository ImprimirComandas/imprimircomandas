import React from 'react';
import { CheckCircle, XCircle, Edit2, Printer } from 'lucide-react';
import type { Comanda, Produto } from '@/types';

interface OrderCardDetailsProps {
  comanda: Comanda;
  getProdutos: Produto[];
  onTogglePayment: (comanda: Comanda) => void;
  onStartEdit: () => void;
  onReprint: (comanda: Comanda) => void;
  onDelete: (id: string) => void;
}

export function OrderCardDetails({ 
  comanda, 
  getProdutos, 
  onTogglePayment, 
  onStartEdit, 
  onReprint, 
  onDelete 
}: OrderCardDetailsProps) {
  return (
    <>
      {getProdutos.length > 0 ? (
        getProdutos.map((produto: Produto, index: number) => (
          <div key={index} className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              {produto.nome} (x{produto.quantidade})
            </span>
            <span>R$ {(produto.valor * produto.quantidade).toFixed(2)}</span>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">Nenhum produto registrado</p>
      )}
      
      <div className="mt-3 text-sm text-gray-600">
        Subtotal: R$ {getProdutos.reduce((sum, p) => sum + p.valor * p.quantidade, 0).toFixed(2)}
      </div>
      
      <div className="mt-1 text-sm text-gray-600">
        Taxa de Entrega: R$ {(comanda.taxaentrega || 0).toFixed(2)}
      </div>
      
      <div className="mt-3 font-bold text-gray-800 text-lg">
        Total: R$ {(comanda.total || 0).toFixed(2)}
      </div>
      
      <div className="mt-1 text-sm text-gray-500">
        Pagamento: {comanda.forma_pagamento || 'Não especificado'}
      </div>
      
      {comanda.forma_pagamento === 'misto' && (
        <>
          {comanda.valor_cartao > 0 && (
            <div className="mt-1 text-sm text-gray-500">
              Cartão: R$ {(comanda.valor_cartao || 0).toFixed(2)}
            </div>
          )}
          {comanda.valor_dinheiro > 0 && (
            <div className="mt-1 text-sm text-gray-500">
              Dinheiro: R$ {(comanda.valor_dinheiro || 0).toFixed(2)}
            </div>
          )}
          {comanda.valor_pix > 0 && (
            <div className="mt-1 text-sm text-gray-500">
              Pix: R$ {(comanda.valor_pix || 0).toFixed(2)}
            </div>
          )}
        </>
      )}
      
      {(comanda.forma_pagamento === 'dinheiro' || comanda.forma_pagamento === 'misto') && comanda.quantiapaga > 0 && (
        <>
          <div className="mt-1 text-sm text-gray-500">
            Troco para: R$ {(comanda.quantiapaga || 0).toFixed(2)}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Troco: R$ {(comanda.troco || 0).toFixed(2)}
          </div>
        </>
      )}
      
      <div className="mt-5 flex gap-3 flex-wrap">
        <button
          onClick={() => onTogglePayment(comanda)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            comanda.pago ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {comanda.pago ? <XCircle size={18} /> : <CheckCircle size={18} />}
          {comanda.pago ? 'Desmarcar' : 'Confirmar'}
        </button>
        
        <button
          onClick={onStartEdit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          <Edit2 size={18} />
          Editar
        </button>
        
        <button
          onClick={() => onReprint(comanda)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Printer size={18} />
          Reimprimir
        </button>
        
        <button
          onClick={() => onDelete(comanda.id)}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Excluir
        </button>
      </div>
    </>
  );
}
