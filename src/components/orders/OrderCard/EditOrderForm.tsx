
import React, { RefObject } from 'react';
import { Trash2, Plus, Save } from 'lucide-react';
import type { Comanda, Produto, ProdutoFiltrado } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface EditOrderFormProps {
  editedComanda: Partial<Comanda>;
  setEditedComanda: (comanda: Partial<Comanda>) => void;
  onSave: () => void;
  onCancel: () => void;
  getProdutos: Produto[];
  searchInputRef: RefObject<HTMLInputElement>;
  pesquisaProduto: string;
  setPesquisaProduto: (value: string) => void;
  produtosFiltrados: ProdutoFiltrado[];
  loadingProdutos: boolean;
}

export function EditOrderForm({
  editedComanda,
  setEditedComanda,
  onSave,
  onCancel,
  getProdutos,
  searchInputRef,
  pesquisaProduto,
  setPesquisaProduto,
  produtosFiltrados,
  loadingProdutos
}: EditOrderFormProps) {
  const { isDark } = useTheme();
  
  const handleProdutoChange = (index: number, field: keyof Produto, value: string | number) => {
    const updatedProdutos = [...(editedComanda.produtos || [])];
    updatedProdutos[index] = { ...updatedProdutos[index], [field]: value };
    setEditedComanda({ ...editedComanda, produtos: updatedProdutos });
  };

  const addProduto = () => {
    setEditedComanda({
      ...editedComanda,
      produtos: [...(editedComanda.produtos || []), { nome: '', quantidade: 1, valor: 0 }],
    });
  };

  const removeProduto = (index: number) => {
    setEditedComanda({
      ...editedComanda,
      produtos: (editedComanda.produtos || []).filter((_, i) => i !== index),
    });
  };

  const calculateSubtotal = () => {
    return (editedComanda.produtos || []).reduce((sum, produto) => sum + produto.valor * produto.quantidade, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (editedComanda.taxaentrega || 0);
  };

  const handleSelectProduct = (produto: ProdutoFiltrado) => {
    setEditedComanda({
      ...editedComanda,
      produtos: [...(editedComanda.produtos || []), { nome: produto.nome, quantidade: 1, valor: produto.valor }],
    });
    setPesquisaProduto('');
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <label htmlFor="pesquisa_produto" className="block text-sm font-medium text-foreground">
          Buscar Produto
        </label>
        <input
          id="pesquisa_produto"
          ref={searchInputRef}
          type="text"
          value={pesquisaProduto}
          onChange={(e) => setPesquisaProduto(e.target.value)}
          placeholder="Digite o nome ou número do produto"
          className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
          aria-label="Buscar produto por nome ou número"
        />
        {loadingProdutos && (
          <div className="absolute right-3 top-9 text-muted-foreground">Carregando...</div>
        )}
        {produtosFiltrados.length > 0 && (
          <div className="absolute z-10 w-full bg-background border border-border rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
            {produtosFiltrados.map((produto) => (
              <div
                key={produto.id}
                onClick={() => handleSelectProduct(produto)}
                className="px-4 py-2 hover:bg-accent cursor-pointer text-foreground"
              >
                {produto.nome} - R$ {produto.valor.toFixed(2)}
              </div>
            ))}
          </div>
        )}
      </div>

      {(editedComanda.produtos || []).map((produto, index) => (
        <div key={index} className="flex items-center gap-3 border-b border-border pb-2">
          <input
            type="text"
            value={produto.nome}
            onChange={(e) => handleProdutoChange(index, 'nome', e.target.value)}
            placeholder="Nome do produto"
            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
            aria-label={`Nome do produto ${index + 1}`}
          />
          <input
            type="number"
            value={produto.quantidade}
            onChange={(e) => handleProdutoChange(index, 'quantidade', parseInt(e.target.value) || 1)}
            placeholder="Qtd"
            min="1"
            className="w-20 px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
            aria-label={`Quantidade do produto ${index + 1}`}
          />
          <input
            type="number"
            value={produto.valor}
            onChange={(e) => handleProdutoChange(index, 'valor', parseFloat(e.target.value) || 0)}
            placeholder="Valor"
            step="0.01"
            min="0"
            className="w-24 px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
            aria-label={`Valor do produto ${index + 1}`}
          />
          <button
            onClick={() => removeProduto(index)}
            className="text-destructive hover:text-destructive/80"
            aria-label={`Remover produto ${index + 1}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      
      <button
        onClick={addProduto}
        className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
      >
        <Plus size={18} />
        Adicionar Produto
      </button>

      <div>
        <label htmlFor="endereco" className="block text-sm font-medium text-foreground">
          Endereço
        </label>
        <input
          id="endereco"
          type="text"
          value={editedComanda.endereco || ''}
          onChange={(e) => setEditedComanda({ ...editedComanda, endereco: e.target.value })}
          placeholder="Endereço de entrega"
          className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
          aria-label="Endereço de entrega"
        />
      </div>

      <div>
        <label htmlFor="bairro" className="block text-sm font-medium text-foreground">
          Bairro
        </label>
        <input
          id="bairro"
          type="text"
          value={editedComanda.bairro || ''}
          onChange={(e) => setEditedComanda({ ...editedComanda, bairro: e.target.value })}
          placeholder="Bairro"
          className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
          aria-label="Bairro"
        />
      </div>

      <div>
        <label htmlFor="taxa_entrega" className="block text-sm font-medium text-foreground">
          Taxa de Entrega
        </label>
        <input
          id="taxa_entrega"
          type="number"
          value={editedComanda.taxaentrega || 0}
          onChange={(e) => setEditedComanda({ ...editedComanda, taxaentrega: parseFloat(e.target.value) || 0 })}
          placeholder="Taxa de entrega"
          step="0.01"
          min="0"
          className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
          aria-label="Taxa de entrega"
        />
      </div>

      <div>
        <label htmlFor="forma_pagamento" className="block text-sm font-medium text-foreground">
          Forma de Pagamento
        </label>
        <select
          id="forma_pagamento"
          value={editedComanda.forma_pagamento || ''}
          onChange={(e) =>
            setEditedComanda({
              ...editedComanda,
              forma_pagamento: e.target.value as '' | 'pix' | 'dinheiro' | 'cartao' | 'misto',
            })
          }
          className="mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground w-full focus:ring-2 focus:ring-primary"
          aria-label="Selecione a forma de pagamento"
        >
          <option value="">Selecione</option>
          <option value="pix">Pix</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="cartao">Cartão</option>
          <option value="misto">Misto</option>
        </select>
      </div>

      {editedComanda.forma_pagamento === 'misto' && (
        <>
          <div>
            <label htmlFor="valor_cartao" className="block text-sm font-medium text-foreground">
              Valor em Cartão
            </label>
            <input
              id="valor_cartao"
              type="number"
              value={editedComanda.valor_cartao || 0}
              onChange={(e) => setEditedComanda({ ...editedComanda, valor_cartao: parseFloat(e.target.value) || 0 })}
              placeholder="Valor em cartão"
              step="0.01"
              min="0"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
              aria-label="Valor em cartão"
            />
          </div>
          <div>
            <label htmlFor="valor_dinheiro" className="block text-sm font-medium text-foreground">
              Valor em Dinheiro
            </label>
            <input
              id="valor_dinheiro"
              type="number"
              value={editedComanda.valor_dinheiro || 0}
              onChange={(e) => setEditedComanda({ ...editedComanda, valor_dinheiro: parseFloat(e.target.value) || 0 })}
              placeholder="Valor em dinheiro"
              step="0.01"
              min="0"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
              aria-label="Valor em dinheiro"
            />
          </div>
          <div>
            <label htmlFor="valor_pix" className="block text-sm font-medium text-foreground">
              Valor em Pix
            </label>
            <input
              id="valor_pix"
              type="number"
              value={editedComanda.valor_pix || 0}
              onChange={(e) => setEditedComanda({ ...editedComanda, valor_pix: parseFloat(e.target.value) || 0 })}
              placeholder="Valor em pix"
              step="0.01"
              min="0"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
              aria-label="Valor em pix"
            />
          </div>
        </>
      )}

      {(editedComanda.forma_pagamento === 'dinheiro' || editedComanda.forma_pagamento === 'misto') && (
        <>
          <div>
            <label htmlFor="quantiapaga" className="block text-sm font-medium text-foreground">
              Troco para (R$)
            </label>
            <input
              id="quantiapaga"
              type="number"
              value={editedComanda.quantiapaga || 0}
              onChange={(e) => {
                const quantiapaga = parseFloat(e.target.value) || 0;
                setEditedComanda({
                  ...editedComanda,
                  quantiapaga,
                  troco: quantiapaga >= calculateTotal() ? quantiapaga - calculateTotal() : 0,
                });
              }}
              placeholder="Valor entregue pelo cliente"
              step="0.01"
              min="0"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary text-foreground"
              aria-label="Valor entregue pelo cliente"
            />
          </div>
          <div>
            <label htmlFor="troco" className="block text-sm font-medium text-foreground">
              Troco (R$)
            </label>
            <input
              id="troco"
              type="number"
              value={(editedComanda.troco || 0).toFixed(2)}
              readOnly
              className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-muted text-muted-foreground"
              aria-label="Troco calculado"
            />
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <input
          id="pago"
          type="checkbox"
          checked={editedComanda.pago || false}
          onChange={(e) => setEditedComanda({ ...editedComanda, pago: e.target.checked })}
          className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
          aria-label="Marcar como pago"
        />
        <label htmlFor="pago" className="text-sm font-medium text-foreground">
          Pago
        </label>
      </div>

      <div className="font-bold text-foreground text-lg">
        Subtotal: R$ {calculateSubtotal().toFixed(2)}
      </div>
      <div className="font-bold text-foreground text-lg">
        Total: R$ {calculateTotal().toFixed(2)}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save size={18} />
          Salvar
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
