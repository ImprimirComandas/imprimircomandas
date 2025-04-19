
import { FC } from 'react';
import { Printer, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { Comanda } from '../types/database';
import { getUltimos8Digitos as getUltimos8DigitosUtil } from '../utils/printService';
import { Button } from './ui/button';

interface ComandasAnterioresProps {
  comandas: Comanda[];
  expandedComandas: { [key: string]: boolean };
  carregando: boolean;
  onReimprimir: (comanda: Comanda) => void;
  onExcluir: (id: string | undefined) => void;
  onToggleExpand: (id: string) => void;
  getUltimos8Digitos?: (id: string | undefined) => string;
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
  // Use the imported util function if the prop is not provided
  const formatId = getUltimos8Digitos || getUltimos8DigitosUtil;

  if (carregando) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (comandas.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">Nenhum pedido encontrado.</p>
    );
  }

  return (
    <ul className="space-y-4">
      {comandas.map((comanda) => {
        const isExpanded = comanda.id ? expandedComandas[comanda.id] : false;

        return (
          <li
            key={comanda.id}
            className="border rounded-md bg-gray-50 hover:bg-gray-100 transition"
          >
            {/* Cabeçalho */}
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-3">
                <span className="font-medium text-base">
                  Pedido #{formatId(comanda.id)}
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
                
                <Button
                  onClick={() => comanda.id && onToggleExpand(comanda.id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                >
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm button quando não expandido e não pago */}
            {!isExpanded && !comanda.pago && (
              <div className="px-4 pb-4">
                <Button
                  onClick={() => onConfirmPayment(comanda)}
                  variant="outline"
                  size="sm"
                  className="w-full bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                >
                  <Check size={16} className="mr-2" />
                  Confirmar Pagamento
                </Button>
              </div>
            )}

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
                  <Button
                    onClick={() => onReimprimir(comanda)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Printer size={16} />
                    Imprimir
                  </Button>
                  <Button
                    onClick={() => comanda.id && onExcluir(comanda.id)}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </Button>
                  {!comanda.pago && (
                    <Button
                      onClick={() => onConfirmPayment(comanda)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                    >
                      <Check size={16} />
                      Confirmar Pagamento
                    </Button>
                  )}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default ComandasAnterioresModificado;
