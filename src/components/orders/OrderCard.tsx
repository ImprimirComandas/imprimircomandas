import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Edit2, Save, Trash2, Plus, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { supabase } from '@/lib/supabase';
import { getUltimos8Digitos } from '@/utils/printService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Comanda, Produto, ProdutoFiltrado } from '@/types';

interface OrderCardProps {
  comanda: Comanda;
  onTogglePayment: (comanda: Comanda) => void;
  onReprint: (comanda: Comanda) => void;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string, updatedComanda: Partial<Comanda>) => void;
}

export function OrderCard({
  comanda,
  onTogglePayment,
  onReprint,
  onDelete,
  onSaveEdit,
}: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComanda, setEditedComanda] = useState<Partial<Comanda>>({});
  const [pesquisaProduto, setPesquisaProduto] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState<ProdutoFiltrado[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const getProdutos = (): Produto[] => {
    try {
      const produtos = Array.isArray(comanda.produtos)
        ? comanda.produtos
        : typeof comanda.produtos === 'string'
        ? JSON.parse(comanda.produtos)
        : [];
      return produtos.map((p: Produto) => ({
        nome: p.nome || 'Produto desconhecido',
        quantidade: p.quantidade || 1,
        valor: p.valor || 0,
      }));
    } catch (error) {
      console.error('Erro ao processar produtos:', error);
      return [];
    }
  };

  const searchProdutos = debounce(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setProdutosFiltrados([]);
      return;
    }
    setLoadingProdutos(true);
    try {
      const { data, error } = await supabase.rpc('search_produtos_by_name_or_number', {
        search_term: searchTerm.trim(),
      });
      if (error) throw new Error(`Erro na busca de produtos: ${error.message}`);
      setProdutosFiltrados(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao buscar produtos: ${errorMessage}`);
    } finally {
      setLoadingProdutos(false);
    }
  }, 300);

  const handlePesquisaProdutoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPesquisaProduto(value);
    searchProdutos(value);
  };

  const handleSelectProduct = (produto: ProdutoFiltrado) => {
    setEditedComanda({
      ...editedComanda,
      produtos: [...(editedComanda.produtos || []), { nome: produto.nome, quantidade: 1, valor: produto.valor }],
    });
    setPesquisaProduto('');
    setProdutosFiltrados([]);
    if (searchInputRef.current) searchInputRef.current.blur();
  };

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

  const handleSave = () => {
    const { produtos, forma_pagamento, bairro, endereco, quantiapaga } = editedComanda;

    if (!produtos?.length || produtos.some(p => !p.nome || p.quantidade <= 0 || p.valor < 0)) {
      toast.error('Preencha todos os campos dos produtos corretamente');
      return;
    }
    if (!bairro) {
      toast.error('Selecione um bairro');
      return;
    }
    if (!endereco) {
      toast.error('Informe o endereço');
      return;
    }
    if (!forma_pagamento) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }

    const totalComTaxa = calculateTotal();

    if (forma_pagamento === 'dinheiro' || forma_pagamento === 'misto') {
      if ((quantiapaga || 0) < totalComTaxa) {
        toast.error('A quantia paga deve ser maior ou igual ao total do pedido');
        return;
      }
      editedComanda.troco = (quantiapaga || 0) - totalComTaxa;
    } else {
      editedComanda.quantiapaga = 0;
      editedComanda.troco = 0;
    }

    if (forma_pagamento === 'misto') {
      const totalMisto = (editedComanda.valor_cartao || 0) + (editedComanda.valor_dinheiro || 0) + (editedComanda.valor_pix || 0);
      if (totalMisto < totalComTaxa) {
        toast.error('A soma dos valores do pagamento misto deve cobrir o total do pedido');
        return;
      }
    }

    onSaveEdit(comanda.id, editedComanda);
    setIsEditing(false);
  };

  return (
    <Card className="mb-4 overflow-hidden transition-all duration-300">
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-card-foreground">Pedido #{getUltimos8Digitos(comanda.id)}</h3>
            <p className="text-sm text-muted-foreground">
              {comanda.data ? new Date(comanda.data).toLocaleString('pt-BR') : 'Data indisponível'}
            </p>
            <p className="text-sm text-muted-foreground">Bairro: {comanda.bairro || 'Não especificado'}</p>
            <p className="text-sm text-muted-foreground">Endereço: {comanda.endereco || 'Não especificado'}</p>
            <p className="text-sm text-muted-foreground">Total: R$ {(comanda.total || 0).toFixed(2)}</p>
            {(comanda.forma_pagamento === 'dinheiro' || comanda.forma_pagamento === 'misto') && comanda.quantiapaga > 0 && (
              <>
                <p className="text-sm text-muted-foreground">Troco para: R$ {(comanda.quantiapaga || 0).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Troco: R$ {(comanda.troco || 0).toFixed(2)}</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                comanda.pago ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {comanda.pago ? 'Pago' : 'Pendente'}
            </span>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              className="text-primary"
            >
              {isExpanded ? 'Ocultar' : 'Ver Detalhes'}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div className="border-t pt-4 border-border">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="pesquisa_produto" className="block text-sm font-medium text-card-foreground">
                        Buscar Produto
                      </label>
                      <input
                        id="pesquisa_produto"
                        ref={searchInputRef}
                        type="text"
                        value={pesquisaProduto}
                        onChange={handlePesquisaProdutoChange}
                        placeholder="Digite o nome ou número do produto"
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                        aria-label="Buscar produto por nome ou número"
                      />
                      {loadingProdutos && (
                        <div className="absolute right-3 top-9 text-muted-foreground">Carregando...</div>
                      )}
                      {produtosFiltrados.length > 0 && (
                        <div className="absolute z-10 w-full bg-card border border-input rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
                          {produtosFiltrados.map((produto) => (
                            <div
                              key={produto.id}
                              onClick={() => handleSelectProduct(produto)}
                              className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            >
                              {produto.nome} - R$ {produto.valor.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {(editedComanda.produtos || []).map((produto, index) => (
                      <div key={index} className="flex items-center gap-3 border-b pb-2 border-border">
                        <input
                          type="text"
                          value={produto.nome}
                          onChange={(e) => handleProdutoChange(index, 'nome', e.target.value)}
                          placeholder="Nome do produto"
                          className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                          aria-label={`Nome do produto ${index + 1}`}
                        />
                        <input
                          type="number"
                          value={produto.quantidade}
                          onChange={(e) => handleProdutoChange(index, 'quantidade', parseInt(e.target.value) || 1)}
                          placeholder="Qtd"
                          min="1"
                          className="w-20 px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                          aria-label={`Quantidade do produto ${index + 1}`}
                        />
                        <input
                          type="number"
                          value={produto.valor}
                          onChange={(e) => handleProdutoChange(index, 'valor', parseFloat(e.target.value) || 0)}
                          placeholder="Valor"
                          step="0.01"
                          min="0"
                          className="w-24 px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                          aria-label={`Valor do produto ${index + 1}`}
                        />
                        <Button
                          onClick={() => removeProduto(index)}
                          variant="ghost"
                          className="text-destructive hover:text-destructive/80"
                          aria-label={`Remover produto ${index + 1}`}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={addProduto}
                      variant="outline"
                      className="flex items-center gap-2 text-primary"
                    >
                      <Plus size={18} />
                      Adicionar Produto
                    </Button>

                    <div>
                      <label htmlFor="endereco" className="block text-sm font-medium text-card-foreground">
                        Endereço
                      </label>
                      <input
                        id="endereco"
                        type="text"
                        value={editedComanda.endereco || ''}
                        onChange={(e) => setEditedComanda({ ...editedComanda, endereco: e.target.value })}
                        placeholder="Endereço de entrega"
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                        aria-label="Endereço de entrega"
                      />
                    </div>

                    <div>
                      <label htmlFor="bairro" className="block text-sm font-medium text-card-foreground">
                        Bairro
                      </label>
                      <input
                        id="bairro"
                        type="text"
                        value={editedComanda.bairro || ''}
                        onChange={(e) => setEditedComanda({ ...editedComanda, bairro: e.target.value })}
                        placeholder="Bairro"
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                        aria-label="Bairro"
                      />
                    </div>

                    <div>
                      <label htmlFor="taxa_entrega" className="block text-sm font-medium text-card-foreground">
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
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                        aria-label="Taxa de entrega"
                      />
                    </div>

                    <div>
                      <label htmlFor="forma_pagamento" className="block text-sm font-medium text-card-foreground">
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
                        className="mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground w-full"
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
                          <label htmlFor="valor_cartao" className="block text-sm font-medium text-card-foreground">
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
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                            aria-label="Valor em cartão"
                          />
                        </div>
                        <div>
                          <label htmlFor="valor_dinheiro" className="block text-sm font-medium text-card-foreground">
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
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                            aria-label="Valor em dinheiro"
                          />
                        </div>
                        <div>
                          <label htmlFor="valor_pix" className="block text-sm font-medium text-card-foreground">
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
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                            aria-label="Valor em pix"
                          />
                        </div>
                      </>
                    )}

                    {(editedComanda.forma_pagamento === 'dinheiro' || editedComanda.forma_pagamento === 'misto') && (
                      <>
                        <div>
                          <label htmlFor="quantiapaga" className="block text-sm font-medium text-card-foreground">
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
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                            aria-label="Valor entregue pelo cliente"
                          />
                        </div>
                        <div>
                          <label htmlFor="troco" className="block text-sm font-medium text-card-foreground">
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
                      <label htmlFor="pago" className="text-sm font-medium text-card-foreground">
                        Pago
                      </label>
                    </div>

                    <div className="font-bold text-card-foreground text-lg">
                      Subtotal: R$ {calculateSubtotal().toFixed(2)}
                    </div>
                    <div className="font-bold text-card-foreground text-lg">
                      Total: R$ {calculateTotal().toFixed(2)}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleSave}
                        variant="default"
                        className="flex items-center gap-2"
                      >
                        <Save size={18} />
                        Salvar
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="secondary"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {getProdutos().length > 0 ? (
                      getProdutos().map((produto: Produto, index: number) => (
                        <div key={index} className="flex justify-between text-sm text-card-foreground mb-2">
                          <span>
                            {produto.nome} (x{produto.quantidade})
                          </span>
                          <span>R$ {(produto.valor * produto.quantidade).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum produto registrado</p>
                    )}
                    <div className="mt-3 text-sm text-card-foreground">
                      Subtotal: R$ {getProdutos().reduce((sum, p) => sum + p.valor * p.quantidade, 0).toFixed(2)}
                    </div>
                    <div className="mt-1 text-sm text-card-foreground">
                      Taxa de Entrega: R$ {(comanda.taxaentrega || 0).toFixed(2)}
                    </div>
                    <div className="mt-3 font-bold text-card-foreground text-lg">
                      Total: R$ {(comanda.total || 0).toFixed(2)}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Pagamento: {comanda.forma_pagamento || 'Não especificado'}
                    </div>
                    {comanda.forma_pagamento === 'misto' && (
                      <>
                        {comanda.valor_cartao > 0 && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            Cartão: R$ {(comanda.valor_cartao || 0).toFixed(2)}
                          </div>
                        )}
                        {comanda.valor_dinheiro > 0 && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            Dinheiro: R$ {(comanda.valor_dinheiro || 0).toFixed(2)}
                          </div>
                        )}
                        {comanda.valor_pix > 0 && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            Pix: R$ {(comanda.valor_pix || 0).toFixed(2)}
                          </div>
                        )}
                      </>
                    )}
                    {(comanda.forma_pagamento === 'dinheiro' || comanda.forma_pagamento === 'misto') && comanda.quantiapaga > 0 && (
                      <>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Troco para: R$ {(comanda.quantiapaga || 0).toFixed(2)}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Troco: R$ {(comanda.troco || 0).toFixed(2)}
                        </div>
                      </>
                    )}
                    <div className="mt-5 flex gap-3 flex-wrap">
                      <Button
                        onClick={() => onTogglePayment(comanda)}
                        variant={comanda.pago ? "destructive" : "default"}
                        className="flex items-center gap-2"
                      >
                        {comanda.pago ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        {comanda.pago ? 'Desmarcar' : 'Confirmar'}
                      </Button>
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="flex items-center gap-2 text-primary"
                      >
                        <Edit2 size={18} />
                        Editar
                      </Button>
                      <Button
                        onClick={() => onReprint(comanda)}
                        variant="default"
                        className="flex items-center gap-2"
                      >
                        <Printer size={18} />
                        Reimprimir
                      </Button>
                      <Button
                        onClick={() => onDelete(comanda.id)}
                        variant="secondary"
                      >
                        Excluir
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Card>
  );
}
