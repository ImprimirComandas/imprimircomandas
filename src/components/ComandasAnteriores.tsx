
import { Printer, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Comanda } from '../types/database';

interface ComandasAnterioresProps {
  comandas: Comanda[];
  expandedComandas: { [key: string]: boolean };
  carregando: boolean;
  onReimprimir: (comanda: Comanda) => void;
  onExcluir: (id: string | undefined) => void;
  onToggleExpand: (id: string) => void;
  getUltimos8Digitos: (id: string | undefined) => string;
}

export default function ComandasAnteriores({
  comandas,
  expandedComandas,
  carregando,
  onReimprimir,
  onExcluir,
  onToggleExpand,
  getUltimos8Digitos,
}: ComandasAnterioresProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-bold mb-4">Últimos Pedidos</h2>
      {carregando ? (
        <p className="text-center text-gray-500">Carregando...</p>
      ) : comandas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum pedido encontrado</p>
      ) : (
        <div className="space-y-4">
          {comandas.map((comanda) => (
            <div key={comanda.id} className="border rounded p-3">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    Pedido #{getUltimos8Digitos(comanda.id)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{comanda.endereco}</p>
                  <p className="text-sm text-gray-600 mt-1">Bairro: {comanda.bairro}</p>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(comanda.created_at || comanda.data).toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {comanda.produtos.length} itens • {comanda.forma_pagamento} • R$ {comanda.total.toFixed(2)} •{' '}
                    <span className={comanda.pago ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {comanda.pago ? 'Pago' : 'Não Pago'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => onReimprimir(comanda)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center gap-2 text-sm"
                    title="Reimprimir comanda"
                  >
                    <Printer size={16} />
                    Reimprimir
                  </button>
                  <button
                    type="button"
                    onClick={() => onExcluir(comanda.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-2 text-sm"
                    title="Excluir comanda"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleExpand(comanda.id!)}
                    className="text-gray-600 hover:text-gray-800"
                    title={expandedComandas[comanda.id!] ? 'Recolher itens' : 'Expandir itens'}
                  >
                    {expandedComandas[comanda.id!] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Lista de Itens (Produtos) */}
              {expandedComandas[comanda.id!] && (
                <div className="mt-3 border-t pt-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Itens do Pedido</h3>
                  <div className="space-y-2">
                    {comanda.produtos.map((produto, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm"
                      >
                        <span className="flex-1">{produto.nome}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Qtd: {produto.quantidade}</span>
                          <span>R$ {(produto.valor * produto.quantidade).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
