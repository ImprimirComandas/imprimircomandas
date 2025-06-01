
import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Card } from '../../../ui/card';
import type { Motoboy } from '@/types';

interface MotoboyEditFormProps {
  motoboy: Motoboy;
  onSave: (motoboy: Motoboy) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export function MotoboyEditForm({ motoboy, onSave, onCancel, loading }: MotoboyEditFormProps) {
  const [nome, setNome] = useState(motoboy.nome);
  const [telefone, setTelefone] = useState(motoboy.telefone || '');
  const [valorFixoSessao, setValorFixoSessao] = useState(motoboy.valor_fixo_sessao || 0);
  const [entregasParaDesconto, setEntregasParaDesconto] = useState(motoboy.entregas_para_desconto || 0);
  const [valorDescontoEntrega, setValorDescontoEntrega] = useState(motoboy.valor_desconto_entrega || 0);
  const [taxaComissao, setTaxaComissao] = useState(motoboy.taxa_comissao || 0);
  const [tipoPagamento, setTipoPagamento] = useState<'fixo' | 'comissao' | 'fixo_comissao'>(motoboy.tipo_pagamento || 'fixo');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    await onSave({
      ...motoboy,
      nome: nome.trim(),
      telefone: telefone.trim(),
      valor_fixo_sessao: valorFixoSessao,
      entregas_para_desconto: entregasParaDesconto,
      valor_desconto_entrega: valorDescontoEntrega,
      taxa_comissao: taxaComissao,
      tipo_pagamento: tipoPagamento,
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Save className="h-5 w-5 text-primary mr-2" />
        Editar Motoboy
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-foreground mb-1">
            Nome
          </label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
            placeholder="Nome do motoboy"
            required
          />
        </div>

        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-foreground mb-1">
            Telefone
          </label>
          <input
            id="telefone"
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label htmlFor="tipo_pagamento" className="block text-sm font-medium text-foreground mb-1">
            Tipo de Pagamento
          </label>
          <select
            id="tipo_pagamento"
            value={tipoPagamento}
            onChange={(e) => setTipoPagamento(e.target.value as 'fixo' | 'comissao' | 'fixo_comissao')}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="fixo">Valor Fixo por Sessão</option>
            <option value="comissao">Comissão por Entrega</option>
            <option value="fixo_comissao">Fixo + Comissão</option>
          </select>
        </div>

        {(tipoPagamento === 'fixo' || tipoPagamento === 'fixo_comissao') && (
          <div>
            <label htmlFor="valor_fixo" className="block text-sm font-medium text-foreground mb-1">
              Valor Fixo por Sessão (R$)
            </label>
            <input
              id="valor_fixo"
              type="number"
              step="0.01"
              min="0"
              value={valorFixoSessao}
              onChange={(e) => setValorFixoSessao(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
              placeholder="0.00"
            />
          </div>
        )}

        {(tipoPagamento === 'comissao' || tipoPagamento === 'fixo_comissao') && (
          <div>
            <label htmlFor="taxa_comissao" className="block text-sm font-medium text-foreground mb-1">
              Taxa de Comissão por Entrega (R$)
            </label>
            <input
              id="taxa_comissao"
              type="number"
              step="0.01"
              min="0"
              value={taxaComissao}
              onChange={(e) => setTaxaComissao(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
              placeholder="0.00"
            />
          </div>
        )}

        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-primary hover:text-primary/80 mb-3"
          >
            {showAdvanced ? 'Ocultar' : 'Mostrar'} Configurações de Desconto
          </button>
          
          {showAdvanced && (
            <div className="space-y-4">
              <div>
                <label htmlFor="entregas_desconto" className="block text-sm font-medium text-foreground mb-1">
                  Entregas para Desconto
                </label>
                <input
                  id="entregas_desconto"
                  type="number"
                  min="0"
                  value={entregasParaDesconto}
                  onChange={(e) => setEntregasParaDesconto(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="Ex: 10 entregas"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Número de entregas necessárias para aplicar desconto
                </p>
              </div>

              <div>
                <label htmlFor="valor_desconto" className="block text-sm font-medium text-foreground mb-1">
                  Valor do Desconto por Entrega (R$)
                </label>
                <input
                  id="valor_desconto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorDescontoEntrega}
                  onChange={(e) => setValorDescontoEntrega(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Valor descontado do motoboy por entrega (se atingir a meta)
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !nome.trim()}
            className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <svg
                className="animate-spin h-4 w-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </button>
        </div>
      </form>
    </Card>
  );
}
