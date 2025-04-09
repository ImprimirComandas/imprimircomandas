import { Printer, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

// Define and export the Comanda type
export interface Comanda {
  id?: string;
  endereco: string;
  bairro: string;
  created_at?: string;
  data: string;
  produtos: {
    nome: string;
    quantidade: number;
    valor: number;
  }[];
  forma_pagamento: string;
  total: number;
}

interface ComandasAnterioresProps {
  comandas: Comanda[];
  expandedComandas: { [key: string]: boolean };
  onReimprimir: (comanda: Comanda) => void;
  onExcluir: (id: string | undefined) => void;
  onToggleExpand: (id: string) => void;
}

export default function ComandasAnteriores({
  comandas,
  expandedComandas,
  onReimprimir,
  onExcluir,
  onToggleExpand,
}: ComandasAnterioresProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-bold mb-4">Últimos Pedidos</h2>
      {comandas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum pedido encontrado</p>
      ) : (
        <div className="space-y-4">
          {comandas.map((comanda) => (
            <div key={comanda.id} className="border rounded p-3">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    Pedido #{comanda.id?.slice(-8)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{comanda.endereco}</p>
                  <p className="text-sm text-gray-600 mt-1">Bairro: {comanda.bairro}</p>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(comanda.created_at || comanda.data).toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {comanda.produtos.length} itens • {comanda.forma_pagamento} • R$ {comanda.total.toFixed(2)} •{' '}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onReimprimir(comanda)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Printer size={16} />
                  </button>
                  <button
                    onClick={() => onExcluir(comanda.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => onToggleExpand(comanda.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedComandas[comanda.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
              {expandedComandas[comanda.id] && (
                <div className="mt-2">
                  <h3 className="text-sm font-semibold text-gray-900">Detalhes</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {comanda.produtos.map((produto, index: number) => (
                      <li key={index}>
                        {produto.nome} - {produto.quantidade}x - R$ {(produto.valor * produto.quantidade).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
