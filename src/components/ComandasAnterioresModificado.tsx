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
  onConfirmPayment,
}) => {
  if (carregando) {
    return (
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Pedidos Anteriores</h2>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
        </div>
      </section>
    );
  }

  if (comandas.length === 0) {
    return (
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Pedidos Anteriores</h2>
        <p className="text-gray-500 text-center py-4">Nenhum pedido encontrado.</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-6">Pedidos Anteriores</h2>
      <ul className="space-y-4">
        {comandas.map((comanda) => {
          const isExpanded = comanda.id ? expandedComandas[comanda.id] : false;

          return (
            <li
              key={comanda.id}
              className="border rounded-md bg-gray-50 hover:bg-gray-100 transition"
            >
              {/* Cabeçalho */}
              <button
                className="w-full flex justify-between items-center p-4 text-left"
                onClick={() => comanda.id && onToggleExpand(comanda.id)}
                aria-expanded={!!isExpanded}
                aria-controls={`comanda-${comanda.id}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-base">
                    Pedido #{getUltimos8Digitos(comanda.id)}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      comanda.pago
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {comanda.pago ? 'Pago' : 'Pendente'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {new Date(comanda.data).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </div>
              </button>

              {/* Detalhes */}
              {comanda.id && isExpanded && (
                <div id={`comanda-${comanda.id}`} className="p-4 bg-white border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {/* Informações de entrega */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Entrega</h3>
                      <p>
                        <span className="font-medium">Endereço:</span> {comanda.endereco}
                      </p>
                      <p>
                        <span className="font-medium">Bairro:</span> {comanda.bairro}
                      </p>
                      <p>
                        <span className="font-medium">Taxa:</span> R${' '}
                        {comanda.taxaentrega.toFixed(2)}
                      </p>
                    </div>

                    {/* Informações de pagamento */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Pagamento</h3>
                      <p>
                        <span className="font-medium">Forma:</span>{' '}
                        {comanda.forma_pagamento.toUpperCase()}
                      </p>
                      {comanda.forma_pagamento === 'dinheiro' &&
                        comanda.troco &&
                        comanda.quantiapaga && (
                          <p>
                            <span className="font-medium">Troco:</span> R${' '}
                            {comanda.quantiapaga.toFixed(2)} (R$ {comanda.troco.toFixed(2)})
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Produtos */}
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Itens</h3>
                    <ul className="space-y-2">
                      {comanda.produtos.map((produto, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center text-sm"
                        >
                          <span>
                            {produto.quantidade}x {produto.nome}
                          </span>
                          <span className="font-medium">
                            R$ {(produto.valor * produto.quantidade).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex justify-between text-sm font-semibold">
                      <span>Total</span>
                      <span>R$ {comanda.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      onClick={() => onReimprimir(comanda)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
                      aria-label="Reimprimir comanda"
                    >
                      <Printer size={16} />
                      Imprimir
                    </button>
                    <button
                      onClick={() => comanda.id && onExcluir(comanda.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                      aria-label="Excluir comanda"
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                    <button
                      onClick={() => onConfirmPayment(comanda)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-white rounded text-sm hover:brightness-90 transition ${
                        comanda.pago ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      aria-label={comanda.pago ? 'Cancelar pagamento' : 'Confirmar pagamento'}
                    >
                      <Check size={16} />
                      {comanda.pago ? 'Desfazer Pagamento' : 'Confirmar Pagamento'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ComandasAnterioresModificado;