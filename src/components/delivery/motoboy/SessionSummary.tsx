
import React from 'react';
import { Card } from '../../ui/card';
import { Clock, Package, DollarSign, Minus, Plus, Calculator } from 'lucide-react';
import type { ExtendedMotoboySession, Motoboy } from '@/types';

interface SessionSummaryProps {
  session: ExtendedMotoboySession;
  motoboy: Motoboy;
  totalEntregas: number;
  totalTaxasColetadas: number;
  onClose: () => void;
}

export function SessionSummary({
  session,
  motoboy,
  totalEntregas,
  totalTaxasColetadas,
  onClose
}: SessionSummaryProps) {
  const valorFixo = motoboy.valor_fixo_sessao || 0;
  const taxaComissao = motoboy.taxa_comissao || 0;
  const entregasParaDesconto = motoboy.entregas_para_desconto || 0;
  const valorDescontoEntrega = motoboy.valor_desconto_entrega || 0;
  
  // Calculate discounts
  const aplicarDesconto = entregasParaDesconto > 0 && totalEntregas >= entregasParaDesconto;
  const totalDescontos = aplicarDesconto ? totalEntregas * valorDescontoEntrega : 0;
  
  // Calculate final payment based on payment type
  let valorFinalMotoboy = 0;
  
  switch (motoboy.tipo_pagamento) {
    case 'fixo':
      valorFinalMotoboy = valorFixo - totalDescontos;
      break;
    case 'comissao':
      valorFinalMotoboy = (totalEntregas * taxaComissao) - totalDescontos;
      break;
    case 'fixo_comissao':
      valorFinalMotoboy = valorFixo + (totalEntregas * taxaComissao) - totalDescontos;
      break;
    default:
      valorFinalMotoboy = -totalDescontos;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
          <Calculator className="h-6 w-6 text-primary mr-2" />
          Resumo da Sessão
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-sm font-medium">Duração da Sessão</span>
            </div>
            <span className="font-semibold">{session.duration || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center">
              <Package className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium">Total de Entregas</span>
            </div>
            <span className="font-semibold text-blue-600">{totalEntregas}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium">Total de Taxas Coletadas</span>
            </div>
            <span className="font-semibold text-green-600">R$ {totalTaxasColetadas.toFixed(2)}</span>
          </div>

          {motoboy.tipo_pagamento === 'fixo' || motoboy.tipo_pagamento === 'fixo_comissao' ? (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center">
                <Plus className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm font-medium">Valor Fixo da Sessão</span>
              </div>
              <span className="font-semibold text-primary">R$ {valorFixo.toFixed(2)}</span>
            </div>
          ) : null}

          {motoboy.tipo_pagamento === 'comissao' || motoboy.tipo_pagamento === 'fixo_comissao' ? (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center">
                <Plus className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm font-medium">Comissão por Entregas</span>
              </div>
              <span className="font-semibold text-primary">
                R$ {(totalEntregas * taxaComissao).toFixed(2)}
                <span className="text-xs text-muted-foreground ml-1">
                  ({totalEntregas} × R$ {taxaComissao.toFixed(2)})
                </span>
              </span>
            </div>
          ) : null}

          {aplicarDesconto && (
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center">
                <Minus className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">
                  Desconto Aplicado
                </span>
              </div>
              <span className="font-semibold text-red-600">
                -R$ {totalDescontos.toFixed(2)}
                <span className="text-xs text-red-500 ml-1">
                  ({totalEntregas} × R$ {valorDescontoEntrega.toFixed(2)})
                </span>
              </span>
            </div>
          )}

          {entregasParaDesconto > 0 && !aplicarDesconto && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Meta não atingida:</strong> Necessário {entregasParaDesconto} entregas para desconto
                (faltam {entregasParaDesconto - totalEntregas})
              </p>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center">
                <Calculator className="h-6 w-6 text-primary mr-2" />
                <span className="text-lg font-bold text-foreground">Valor Final para o Motoboy</span>
              </div>
              <span className="text-xl font-bold text-primary">
                R$ {Math.max(0, valorFinalMotoboy).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Fechar Sessão
          </button>
        </div>
      </Card>
    </div>
  );
}
