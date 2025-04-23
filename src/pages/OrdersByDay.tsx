import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { format, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { Search, X, CheckCircle, XCircle, ChevronLeft, ChevronRight, Edit2, Save, Trash2, Plus, Printer, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { getUltimos8Digitos, imprimirComanda } from '../utils/printService';
import { DateRangePicker, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Estilo padrão
import 'react-date-range/dist/theme/default.css'; // Tema padrão

// Interfaces
interface Produto {
  nome: string;
  quantidade: number;
  valor: number;
}

interface Comanda {
  id: string;
  data: string;
  user_id: string;
  produtos: Produto[];
  total: number;
  forma_pagamento: '' | 'pix' | 'dinheiro' | 'cartao' | 'misto';
  pago: boolean;
  troco: number;
  quantiapaga: number;
  valor_cartao: number;
  valor_dinheiro: number;
  valor_pix: number;
  bairro: string;
  taxaentrega: number;
  endereco: string;
}

interface ProdutoFiltrado {
  id: string;
  nome: string;
  valor: number;
  numero?: number;
}

// Componente OrderCard
const OrderCard = ({
  comanda,
  onTogglePayment,
  onReprint,
  onDelete,
  onSaveEdit,
}: {
  comanda: Comanda;
  onTogglePayment: (comanda: Comanda) => void;
  onReprint: (comanda: Comanda) => void;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string, updatedComanda: Partial<Comanda>) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComanda, setEditedComanda] = useState<Partial<Comanda>>({});
  const [pesquisaProduto, setPesquisaProduto] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState<ProdutoFiltrado[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const getProdutos = useMemo(() => {
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
  }, [comanda.produtos]);

  useEffect(() => {
    if (isEditing) {
      setEditedComanda({
        produtos: getProdutos,
        forma_pagamento: comanda.forma_pagamento,
        pago: comanda.pago,
        troco: comanda.troco,
        quantiapaga: comanda.quantiapaga,
        valor_cartao: comanda.valor_cartao,
        valor_dinheiro: comanda.valor_dinheiro,
        valor_pix: comanda.valor_pix,
        bairro: comanda.bairro,
        taxaentrega: comanda.taxaentrega,
        endereco: comanda.endereco,
        total: comanda.total, // Initialize total
      });
    }
  }, [isEditing, comanda, getProdutos]);

  const searchProdutos = useCallback(
    debounce(async (searchTerm: string) => {
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
    }, 300),
    []
  );

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

    // Update the total in editedComanda before saving
    const updatedComanda = {
      ...editedComanda,
      total: totalComTaxa, // Ensure total is updated
    };

    onSaveEdit(comanda.id, updatedComanda);
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-4 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Pedido #{getUltimos8Digitos(comanda.id)}</h3>
          <p className="text-sm text-gray-500">
            {comanda.data ? new Date(comanda.data).toLocaleString('pt-BR') : 'Data indisponível'}
          </p>
          <p className="text-sm text-gray-500">Bairro: {comanda.bairro || 'Não especificado'}</p>
          <p className="text-sm text-gray-500">Endereço: {comanda.endereco || 'Não especificado'}</p>
          <p className="text-sm text-gray-500">Total: R$ {(comanda.total || 0).toFixed(2)}</p>
          {(comanda.forma_pagamento === 'dinheiro' || comanda.forma_pagamento === 'misto') && comanda.quantiapaga > 0 && (
            <>
              <p className="text-sm text-gray-500">Troco para: R$ {(comanda.quantiapaga || 0).toFixed(2)}</p>
              <p className="text-sm text-gray-500">Troco: R$ {(comanda.troco || 0).toFixed(2)}</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              comanda.pago ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
            }`}
          >
            {comanda.pago ? 'Pago' : 'Pendente'}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {isExpanded ? 'Ocultar' : 'Ver Detalhes'}
          </button>
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
            <div className="border-t pt-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="pesquisa_produto" className="block text-sm font-medium text-gray-700">
                      Buscar Produto
                    </label>
                    <input
                      id="pesquisa_produto"
                      ref={searchInputRef}
                      type="text"
                      value={pesquisaProduto}
                      onChange={handlePesquisaProdutoChange}
                      placeholder="Digite o nome ou número do produto"
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                      aria-label="Buscar produto por nome ou número"
                    />
                    {loadingProdutos && (
                      <div className="absolute right-3 top-9 text-gray-400">Carregando...</div>
                    )}
                    {produtosFiltrados.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
                        {produtosFiltrados.map((produto) => (
                          <div
                            key={produto.id}
                            onClick={() => handleSelectProduct(produto)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {produto.nome} - R$ {produto.valor.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {(editedComanda.produtos || []).map((produto, index) => (
                    <div key={index} className="flex items-center gap-3 border-b pb-2">
                      <input
                        type="text"
                        value={produto.nome}
                        onChange={(e) => handleProdutoChange(index, 'nome', e.target.value)}
                        placeholder="Nome do produto"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                        aria-label={`Nome do produto ${index + 1}`}
                      />
                      <input
                        type="number"
                        value={produto.quantidade}
                        onChange={(e) => handleProdutoChange(index, 'quantidade', parseInt(e.target.value) || 1)}
                        placeholder="Qtd"
                        min="1"
                        className="w-20 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                        aria-label={`Quantidade do produto ${index + 1}`}
                      />
                      <input
                        type="number"
                        value={produto.valor}
                        onChange={(e) => handleProdutoChange(index, 'valor', parseFloat(e.target.value) || 0)}
                        placeholder="Valor"
                        step="0.01"
                        min="0"
                        className="w-24 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                        aria-label={`Valor do produto ${index + 1}`}
                      />
                      <button
                        onClick={() => removeProduto(index)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Remover produto ${index + 1}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addProduto}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus size={18} />
                    Adicionar Produto
                  </button>

                  <div>
                    <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
                      Endereço
                    </label>
                    <input
                      id="endereco"
                      type="text"
                      value={editedComanda.endereco || ''}
                      onChange={(e) => setEditedComanda({ ...editedComanda, endereco: e.target.value })}
                      placeholder="Endereço de entrega"
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                      aria-label="Endereço de entrega"
                    />
                  </div>

                  <div>
                    <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
                      Bairro
                    </label>
                    <input
                      id="bairro"
                      type="text"
                      value={editedComanda.bairro || ''}
                      onChange={(e) => setEditedComanda({ ...editedComanda, bairro: e.target.value })}
                      placeholder="Bairro"
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                      aria-label="Bairro"
                    />
                  </div>

                  <div>
                    <label htmlFor="taxa_entrega" className="block text-sm font-medium text-gray-700">
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
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                      aria-label="Taxa de entrega"
                    />
                  </div>

                  <div>
                    <label htmlFor="forma_pagamento" className="block text-sm font-medium text-gray-700">
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
                      className="mt-1 px-3 py-2 rounded-lg border border-gray-200 w-full"
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
                        <label htmlFor="valor_cartao" className="block text-sm font-medium text-gray-700">
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
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                          aria-label="Valor em cartão"
                        />
                      </div>
                      <div>
                        <label htmlFor="valor_dinheiro" className="block text-sm font-medium text-gray-700">
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
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                          aria-label="Valor em dinheiro"
                        />
                      </div>
                      <div>
                        <label htmlFor="valor_pix" className="block text-sm font-medium text-gray-700">
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
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                          aria-label="Valor em pix"
                        />
                      </div>
                    </>
                  )}

                  {(editedComanda.forma_pagamento === 'dinheiro' || editedComanda.forma_pagamento === 'misto') && (
                    <>
                      <div>
                        <label htmlFor="quantiapaga" className="block text-sm font-medium text-gray-700">
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
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                          aria-label="Valor entregue pelo cliente"
                        />
                      </div>
                      <div>
                        <label htmlFor="troco" className="block text-sm font-medium text-gray-700">
                          Troco (R$)
                        </label>
                        <input
                          id="troco"
                          type="number"
                          value={(editedComanda.troco || 0).toFixed(2)}
                          readOnly
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-100"
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
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label="Marcar como pago"
                    />
                    <label htmlFor="pago" className="text-sm font-medium text-gray-700">
                      Pago
                    </label>
                  </div>

                  <div className="font-bold text-gray-800 text-lg">
                    Subtotal: R$ {calculateSubtotal().toFixed(2)}
                  </div>
                  <div className="font-bold text-gray-800 text-lg">
                    Total: R$ {calculateTotal().toFixed(2)}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save size={18} />
                      Salvar
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {getProdutos.length > 0 ? (
                    getProdutos.map((produto: Produto, index: number) => (
                      <div key={index} className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>
                          {produto.nome} (x{produto.quantidade})
                        </span>
                        <span>R$ {(produto.valor * produto.quantidade).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum produto registrado</p>
                  )}
                  <div className="mt-3 text-sm text-gray-600">
                    Subtotal: R$ {getProdutos.reduce((sum, p) => sum + p.valor * p.quantidade, 0).toFixed(2)}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    Taxa de Entrega: R$ {(comanda.taxaentrega || 0).toFixed(2)}
                  </div>
                  <div className="mt-3 font-bold text-gray-800 text-lg">
                    Total: R$ {(comanda.total || 0).toFixed(2)}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Pagamento: {comanda.forma_pagamento || 'Não especificado'}
                  </div>
                  {comanda.forma_pagamento === 'misto' && (
                    <>
                      {comanda.valor_cartao > 0 && (
                        <div className="mt-1 text-sm text-gray-500">
                          Cartão: R$ {(comanda.valor_cartao || 0).toFixed(2)}
                        </div>
                      )}
                      {comanda.valor_dinheiro > 0 && (
                        <div className="mt-1 text-sm text-gray-500">
                          Dinheiro: R$ {(comanda.valor_dinheiro || 0).toFixed(2)}
                        </div>
                      )}
                      {comanda.valor_pix > 0 && (
                        <div className="mt-1 text-sm text-gray-500">
                          Pix: R$ {(comanda.valor_pix || 0).toFixed(2)}
                        </div>
                      )}
                    </>
                  )}
                  {(comanda.forma_pagamento === 'dinheiro' || comanda.forma_pagamento === 'misto') && comanda.quantiapaga > 0 && (
                    <>
                      <div className="mt-1 text-sm text-gray-500">
                        Troco para: R$ {(comanda.quantiapaga || 0).toFixed(2)}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Troco: R$ {(comanda.troco || 0).toFixed(2)}
                      </div>
                    </>
                  )}
                  <div className="mt-5 flex gap-3 flex-wrap">
                    <button
                      onClick={() => onTogglePayment(comanda)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        comanda.pago ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                    >
                      {comanda.pago ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      {comanda.pago ? 'Desmarcar' : 'Confirmar'}
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <Edit2 size={18} />
                      Editar
                    </button>
                    <button
                      onClick={() => onReprint(comanda)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Printer size={18} />
                      Reimprimir
                    </button>
                    <button
                      onClick={() => onDelete(comanda.id)}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
                    >
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Componente Principal
export default function OrdersByDay() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [dateRange, setDateRange] = useState([
    {
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date()),
      key: 'selection',
    },
  ]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const fetchOrdersByPeriod = async (start: Date, end: Date) => {
    setLoading(true);
    try {
      const startISO = startOfDay(start).toISOString();
      const endISO = endOfDay(end).toISOString();
      const { data, error } = await supabase
        .from('comandas')
        .select('id, data, user_id, produtos, total, forma_pagamento, pago, troco, quantiapaga, valor_cartao, valor_dinheiro, valor_pix, bairro, taxaentrega, endereco')
        .gte('data', startISO)
        .lte('data', endISO)
        .order('data', { ascending: false });

      if (error) throw new Error(`Erro ao carregar pedidos: ${error.message}`);

      setComandas(data || []);
    } catch (error: unknown) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error(error.message || 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersByPeriod(dateRange[0].startDate, dateRange[0].endDate);
  }, [dateRange]);

  // Fechar calendário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateRangeChange = (ranges: RangeKeyDict) => {
    const { startDate, endDate } = ranges.selection;
    if (startDate && endDate) {
      setDateRange([{ startDate, endDate, key: 'selection' }]);
      setShowCalendar(false);
    }
  };

  const changePeriod = (direction: 'prev' | 'next') => {
    const daysDiff = Math.ceil((dateRange[0].endDate.getTime() - dateRange[0].startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const newStart = direction === 'prev' ? subDays(dateRange[0].startDate, daysDiff) : addDays(dateRange[0].startDate, daysDiff);
    const newEnd = direction === 'prev' ? subDays(dateRange[0].endDate, daysDiff) : addDays(dateRange[0].endDate, daysDiff);
    setDateRange([{ startDate: newStart, endDate: newEnd, key: 'selection' }]);
  };

  const togglePayment = async (comanda: Comanda) => {
    try {
      const { error } = await supabase
        .from('comandas')
        .update({ pago: !comanda.pago })
        .eq('id', comanda.id);

      if (error) throw new Error(`Erro ao atualizar pagamento: ${error.message}`);

      fetchOrdersByPeriod(dateRange[0].startDate, dateRange[0].endDate);
      toast.success(`Pagamento ${!comanda.pago ? 'confirmado' : 'desmarcado'}!`);
    } catch (error: Error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast.error(error.message || 'Erro ao atualizar pagamento');
    }
  };

  const reprintOrder = async (comanda: Comanda) => {
    try {
      const subtotal = comanda.produtos.reduce((sum, p) => sum + p.valor * p.quantidade, 0);
      const total = subtotal + (comanda.taxaentrega || 0);

      const formattedComanda: Comanda = {
        ...comanda,
        id: comanda.id || crypto.randomUUID(),
        data: comanda.data || new Date().toISOString(),
        user_id: comanda.user_id || '',
        produtos: comanda.produtos.map(p => ({
          nome: p.nome || 'Produto desconhecido',
          quantidade: p.quantidade || 1,
          valor: p.valor || 0,
        })),
        total,
        forma_pagamento: comanda.forma_pagamento || '',
        pago: comanda.pago || false,
        troco: comanda.troco || 0,
        quantiapaga: comanda.quantiapaga || 0,
        valor_cartao: comanda.valor_cartao || 0,
        valor_dinheiro: comanda.valor_dinheiro || 0,
        valor_pix: comanda.valor_pix || 0,
        bairro: comanda.bairro || 'Não especificado',
        taxaentrega: comanda.taxaentrega || 0,
        endereco: comanda.endereco || 'Não especificado',
      };

      await imprimirComanda(formattedComanda);
      toast.success('Comanda enviada para impressão');
    } catch (error: Error) {
      console.error('Erro ao reimprimir comanda:', error);
      toast.error(`Erro ao reimprimir comanda: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Erro ao excluir pedido: ${error.message}`);

      fetchOrdersByPeriod(dateRange[0].startDate, dateRange[0].endDate);
      toast.success('Pedido excluído com sucesso!');
    } catch (error: Error) {
      console.error('Erro ao excluir pedido:', error);
      toast.error(error.message || 'Erro ao excluir pedido');
    }
  };

  const saveEdit = async (id: string, updatedComanda: Partial<Comanda>) => {
    try {
      // Ensure total is included in the update
      const { error } = await supabase
        .from('comandas')
        .update({
          ...updatedComanda,
          total: updatedComanda.total, // Explicitly include total
        })
        .eq('id', id);

      if (error) throw new Error(`Erro ao salvar alterações: ${error.message}`);

      fetchOrdersByPeriod(dateRange[0].startDate, dateRange[0].endDate);
      toast.success('Comanda atualizada com sucesso!');
    } catch (error: Error) {
      console.error('Erro ao salvar alterações:', error);
      toast.error(error.message || 'Erro ao salvar alterações');
    }
  };

  const filteredComandas = useMemo(() => {
    return comandas.filter(comanda => {
      const matchesSearch = searchTerm
        ? getUltimos8Digitos(comanda.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
          comanda.produtos.some(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;

      const matchesStatus =
        filterStatus === 'all' ? true : filterStatus === 'paid' ? comanda.pago : !comanda.pago;

      return matchesSearch && matchesStatus;
    });
  }, [comandas, searchTerm, filterStatus]);

  const totais = useMemo(() => {
    return filteredComandas.reduce(
      (acc, comanda) => {
        const valor = comanda.total || 0;
        acc.total += valor;
        if (comanda.pago) acc.confirmados += valor;
        else acc.naoConfirmados += valor;
        return acc;
      },
      { confirmados: 0, naoConfirmados: 0, total: 0 }
    );
  }, [filteredComandas]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 text-center sm:text-left">
            Controle de Pedidos
          </h1>
          <p className="mt-2 text-gray-600 text-center sm:text-left">
            Gerencie seus pedidos por período
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 relative">
              <button
                onClick={() => changePeriod('prev')}
                className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                aria-label="Período anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-100"
                  aria-label="Selecionar período"
                >
                  <Calendar size={20} />
                  {format(dateRange[0].startDate, 'dd/MM/yyyy')} - {format(dateRange[0].endDate, 'dd/MM/yyyy')}
                </button>
                {showCalendar && (
                  <div ref={calendarRef} className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl">
                    <DateRangePicker
                      ranges={dateRange}
                      onChange={handleDateRangeChange}
                      maxDate={new Date()}
                      showDateDisplay={false}
                      direction="vertical"
                      months={1}
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => changePeriod('next')}
                className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                aria-label="Próximo período"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar pedido (8 últimos dígitos ou produto)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-10 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500"
                aria-label="Buscar pedido por ID ou produto"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Limpar busca"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2 justify-center sm:justify-start">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'paid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pagos
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pendentes
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-800">Confirmados</p>
            <p className="text-lg font-bold text-green-900">R$ {totais.confirmados.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-800">Não Confirmados</p>
            <p className="text-lg font-bold text-red-900">R$ {totais.naoConfirmados.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Total</p>
            <p className="text-lg font-bold text-gray-900">R$ {totais.total.toFixed(2)}</p>
          </div>
        </motion.div>

        <motion.div layout>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-600"></div>
            </div>
          ) : filteredComandas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >
              <p className="text-gray-600 text-lg font-medium">
                Nenhum pedido encontrado para este período.
              </p>
            </motion.div>
          ) : (
            filteredComandas.map(comanda => (
              <OrderCard
                key={comanda.id}
                comanda={comanda}
                onTogglePayment={togglePayment}
                onReprint={reprintOrder}
                onDelete={deleteOrder}
                onSaveEdit={saveEdit}
              />
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}