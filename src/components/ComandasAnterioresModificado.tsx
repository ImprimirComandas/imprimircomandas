
import { FC } from 'react';
import { Printer, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { Comanda } from '../types/database';
import { getUltimos8Digitos as getUltimos8DigitosUtil } from '../utils/printService';
import { Button } from './ui/button';

interface ComandasAnterioresProps {
  comandas: Comanda[];
  expandedComandas: {
    [key: string]: boolean;
  };
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
  onConfirmPayment
}) => {
  // Use the imported util function if the prop is not provided
  const formatId = getUltimos8Digitos || getUltimos8DigitosUtil;
  
  if (carregando) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
      </div>
    );
  }
  
  if (comandas.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Nenhum pedido pendente encontrado.</p>;
  }
  
  return (
    <ul className="space-y-3">
      {comandas.map(comanda => {
        const isExpanded = comanda.id ? expandedComandas[comanda.id] : false;
        return (
          <li key={comanda.id} className="border rounded-md bg-card hover:bg-accent/5 transition-colors">
            {/* Cabeçalho */}
            <div className="p-3 flex justify-between items-center">
              <div>
                <div className="font-medium text-foreground">
                  #{formatId(comanda.id)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {comanda.bairro}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    R$ {comanda.total.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(comanda.data).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                
                <Button 
                  onClick={() => comanda.id && onToggleExpand(comanda.id)} 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                >
                  {isExpanded ? 
                    <ChevronUp size={18} className="text-muted-foreground" /> : 
                    <ChevronDown size={18} className="text-muted-foreground" />
                  }
                </Button>
              </div>
            </div>

            {/* Confirm button quando não expandido */}
            {!isExpanded && (
              <div className="px-3 pb-3">
                <Button 
                  onClick={() => onConfirmPayment(comanda)} 
                  size="sm" 
                  variant="outline"
                  className="w-full bg-green-50 hover:bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 dark:border-green-800"
                >
                  <Check size={16} className="mr-2" />
                  Confirmar Pagamento
                </Button>
              </div>
            )}

            {/* Detalhes expandidos */}
            {comanda.id && isExpanded && (
              <div className="px-3 pb-3 border-t border-border pt-3">
                <div className="grid gap-3 text-sm">
                  <div>
                    <div className="font-medium text-foreground mb-1">Entrega:</div>
                    <p className="text-sm">{comanda.endereco}</p>
                    <div className="flex justify-between text-muted-foreground text-xs mt-1">
                      <span>Taxa: R$ {comanda.taxaentrega.toFixed(2)}</span>
                      <span>{comanda.forma_pagamento.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="font-medium text-foreground mb-1">Itens:</div>
                    <ul className="space-y-1">
                      {comanda.produtos.map((produto, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span>{produto.quantidade}x {produto.nome}</span>
                          <span>R$ {(produto.valor * produto.quantidade).toFixed(2)}</span>
                        </li>
                      ))}
                      <li className="flex justify-between font-semibold mt-1 pt-1 border-t border-border">
                        <span>Total</span>
                        <span>R$ {comanda.total.toFixed(2)}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button 
                      onClick={() => onReimprimir(comanda)} 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      <Printer size={16} className="mr-2" />
                      Imprimir
                    </Button>
                    <Button 
                      onClick={() => comanda.id && onExcluir(comanda.id)} 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Excluir
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={() => onConfirmPayment(comanda)} 
                    variant="outline"
                    size="sm" 
                    className="w-full bg-green-50 hover:bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 dark:border-green-800"
                  >
                    <Check size={16} className="mr-2" />
                    Confirmar Pagamento
                  </Button>
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
