
import { FC } from 'react';
import { Printer, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { Comanda } from '../types/database';

interface ComandasAnterioresProps {
  comandas: Comanda[];
  expandedComandas: { [key: string]: boolean };
  carregando: boolean;
  onReimprimir: (comanda: Comanda) => void;
  onExcluir: (id: string | undefined) => void;
  onToggleExpand: (id: string) => void;
  getUltimos8Digitos: (id: string | undefined) => string;
  onConfirmPayment: (comanda: Comanda) => void;
}

const ComandasAnterioresModificado: FC<ComandasAnterioresProps> = ({
  comandas,
  expandedComandas,
  carregando,
  onReimprimir,
  onExcluir,
  onToggleExpand,
  getUltimos8Digitos,
  onConfirmPayment
}) => {
  if (carregando) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Pedidos Anteriores</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (comandas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Pedidos Anteriores</h2>
        <p className="text-gray-500 text-center">Nenhum pedido encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Pedidos Anteriores</h2>
      <div className="divide-y">
        {comandas.map((comanda) => (
          <div key={comanda.id} className="py-3">
            <div 
              className="flex justify-between items-center cursor-pointer" 
              onClick={() => comanda.id && onToggleExpand(comanda.id)}
            >
              <div>
                <span className="font-semibold">Pedido #{getUltimos8Digitos(comanda.id)}</span>
                <span className={`ml-2 px-2 py-0.5 text-xs rounded ${comanda.pago ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {comanda.pago ? 'PAGO' : 'NÃO PAGO'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm mr-2">
                  {new Date(comanda.data).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
                {comanda.id && expandedComandas[comanda.id] ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>
            </div>
            
            {comanda.id && expandedComandas[comanda.id] && (
              <div className="mt-2 pl-2 border-l-2 border-gray-200">
                <div className="text-sm">
                  <p><strong>Endereço:</strong> {comanda.endereco}</p>
                  <p><strong>Bairro:</strong> {comanda.bairro}</p>
                  <p><strong>Taxa de Entrega:</strong> R$ {comanda.taxaentrega.toFixed(2)}</p>
                  <p><strong>Forma de Pagamento:</strong> {comanda.forma_pagamento.toUpperCase()}</p>
                  {comanda.forma_pagamento === 'dinheiro' && comanda.troco && comanda.quantiapaga && (
                    <p><strong>Troco para:</strong> R$ {comanda.quantiapaga.toFixed(2)} (R$ {comanda.troco.toFixed(2)})</p>
                  )}
                </div>
                
                <div className="mt-2">
                  <h4 className="font-semibold">Produtos:</h4>
                  <ul className="pl-2">
                    {comanda.produtos.map((produto, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span>{produto.nome} (x{produto.quantidade})</span>
                        <span className="font-medium">R$ {(produto.valor * produto.quantidade).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between font-semibold mt-1">
                    <span>Total:</span>
                    <span>R$ {comanda.total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Ações */}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => onReimprimir(comanda)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                  >
                    <Printer size={14} />
                    Imprimir
                  </button>
                  <button
                    onClick={() => onExcluir(comanda.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfirmPayment(comanda);
                    }}
                    className={`${
                      comanda.pago ? 'bg-orange-500' : 'bg-green-500'
                    } text-white px-2 py-1 rounded text-xs flex items-center gap-1`}
                  >
                    <Check size={14} />
                    {comanda.pago ? 'Cancelar Pgt' : 'Confirmar Pgt'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComandasAnterioresModificado;
