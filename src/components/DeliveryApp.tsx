import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Save, Trash2, Search, Edit, X } from 'lucide-react';
import ComandasAnterioresModificado from './ComandasAnterioresModificado';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import TotaisPorStatusPagamento from './TotaisPorStatusPagamento';
import type { Profile, Comanda, Produto } from '../types/database';
import TrocoModal from './TrocoModal';

// Taxas de bairro
const bairroTaxas = {
  'Jardim Paraíso': 6,
  'Aventureiro': 9,
  'Jardim Sofia': 9,
  'Cubatão': 9,
};

// CadastroProdutoForm Component
interface CadastroProdutoFormProps {
  onSaveProduto: (nome: string, valor: string) => Promise<void>;
  onEditProduto: (id: string, nome: string, valor: string) => Promise<void>;
  editingProduct: { id: string; nome: string; valor: number } | null;
  setEditingProduct: (product: { id: string; nome: string; valor: number } | null) => void;
}

const CadastroProdutoForm = ({ onSaveProduto, onEditProduto, editingProduct, setEditingProduct }: CadastroProdutoFormProps) => {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setNome(editingProduct.nome);
      setValor(editingProduct.valor.toString());
    } else {
      setNome('');
      setValor('');
    }
  }, [editingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !valor) {
      toast.error('Preencha o nome e o valor do produto.');
      return;
    }
    const valorNum = Number(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      toast.error('O valor deve ser um número válido maior que zero.');
      return;
    }
    setSalvando(true);
    try {
      if (editingProduct) {
        await onEditProduto(editingProduct.id, nome, valor);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await onSaveProduto(nome, valor);
        toast.success('Produto cadastrado com sucesso!');
      }
      setNome('');
      setValor('');
      setEditingProduct(null);
    } catch (error) {
      toast.error('Erro ao salvar produto.');
    } finally {
      setSalvando(false);
    }
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setNome('');
    setValor('');
  };

  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
      <h2 className="text-lg font-semibold mb-4 text-blue-800">
        {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nomeProdutoCadastro" className="block text-sm font-medium text-gray-700">
            Nome do Produto
          </label>
          <input
            id="nomeProdutoCadastro"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Água Mineral 500ml"
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        <div>
          <label htmlFor="valorProdutoCadastro" className="block text-sm font-medium text-gray-700">
            Valor (R$)
          </label>
          <input
            id="valorProdutoCadastro"
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0.00"
            className="w-full p-2 border rounded text-sm"
            step="0.01"
            min="0"
          />
        </div>
        <div className="flex justify-end space-x-3">
          {editingProduct && (
            <button
              type="button"
              onClick={cancelEditing}
              disabled={salvando}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={salvando}
            className={`inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 ${
              salvando ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Save className="h-4 w-4 mr-2" />
            {salvando ? 'Salvando...' : editingProduct ? 'Salvar Edição' : 'Cadastrar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ComandaForm Component
interface ComandaFormProps {
  comanda: Comanda;
  pesquisaProduto: string;
  produtosFiltrados: { id: string; nome: string; valor: number }[];
  salvando: boolean;
  totalComTaxa: number;
  onRemoveProduto: (index: number) => void;
  onUpdateQuantidade: (index: number, quantidade: number) => void;
  onSaveComanda: () => void;
  onChange: (field: string, value: any) => void;
  onBairroChange: (bairro: string) => void;
  onFormaPagamentoChange: (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => void;
  selecionarProdutoCadastrado: (produto: { id: string; nome: string; valor: number }) => void;
  startEditingProduct: (produto: { id: string; nome: string; valor: number }) => void;
}

const ComandaForm = ({
  comanda,
  pesquisaProduto,
  produtosFiltrados,
  salvando,
  totalComTaxa,
  onRemoveProduto,
  onUpdateQuantidade,
  onSaveComanda,
  onChange,
  onBairroChange,
  onFormaPagamentoChange,
  selecionarProdutoCadastrado,
  startEditingProduct,
}: ComandaFormProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      {/* Busca de Produtos */}
      <div className="mb-4">
        <label htmlFor="pesquisaProduto" className="block text-sm font-medium text-gray-700">
          Buscar Produto
        </label>
        <div className="relative">
          <input
            id="pesquisaProduto"
            type="text"
            value={pesquisaProduto}
            onChange={(e) => onChange('pesquisaProduto', e.target.value)}
            placeholder="Digite para buscar produtos cadastrados"
            className="w-full p-2 pl-8 border rounded text-sm"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          {pesquisaProduto && produtosFiltrados.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
              {produtosFiltrados.map((produto) => (
                <div
                  key={produto.id}
                  className="p-2 hover:bg-gray-100 flex justify-between items-center"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => selecionarProdutoCadastrado(produto)}
                  >
                    <div className="font-medium">{produto.nome}</div>
                    <div className="text-sm text-gray-600">R$ {produto.valor.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => startEditingProduct(produto)}
                    className="text-blue-600 hover:text-blue-900 ml-2"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {pesquisaProduto && produtosFiltrados.length === 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 p-2 text-center text-gray-500">
              Nenhum produto encontrado
            </div>
          )}
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="mb-6">
        <h2 className="text-base md:text-lg font-semibold mb-3">Produtos</h2>
        <div className="space-y-2">
          {comanda.produtos.map((produto: Produto, index: number) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
              <span className="flex-1">{produto.nome}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={produto.quantidade}
                  onChange={(e) => onUpdateQuantidade(index, Number(e.target.value))}
                  className="w-16 p-1 border rounded text-sm"
                  min="1"
                />
                <span>R$ {(produto.valor * produto.quantidade).toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => onRemoveProduto(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Endereço */}
      <div className="mb-4">
        <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
          Endereço de Entrega
        </label>
        <input
          id="endereco"
          type="text"
          value={comanda.endereco}
          onChange={(e) => onChange('endereco', e.target.value)}
          placeholder="Endereço de entrega"
          className="w-full p-2 border rounded text-sm"
          required
        />
      </div>

      {/* Bairro */}
      <div className="mb-4">
        <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
          Bairro
        </label>
        <select
          id="bairro"
          value={comanda.bairro}
          onChange={(e) => onBairroChange(e.target.value)}
          className="w-full p-2 border rounded text-sm"
          required
        >
          <option value="Jardim Paraíso">Jardim Paraíso (R$ 6,00)</option>
          <option value="Aventureiro">Aventureiro (R$ 9,00)</option>
          <option value="Jardim Sofia">Jardim Sofia (R$ 9,00)</option>
          <option value="Cubatão">Cubatão (R$ 9,00)</option>
        </select>
      </div>

      {/* Total, Forma de Pagamento e Status de Pagamento */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-semibold">Subtotal:</h2>
          <span className="text-lg font-bold">R$ {comanda.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base">Taxa de Entrega:</h3>
          <span className="text-base font-bold">R$ {comanda.taxaentrega.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base">Total com Taxa:</h2>
          <span className="text-base font-bold">R$ {totalComTaxa.toFixed(2)}</span>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-700">
              Forma de Pagamento
            </label>
            <select
              id="formaPagamento"
              value={comanda.forma_pagamento}
              onChange={(e) => onFormaPagamentoChange(e.target.value as 'pix' | 'dinheiro' | 'cartao' | 'misto' | '')}
              className="w-full p-2 border rounded text-sm"
              required
            >
              <option value="">Selecione a forma de pagamento</option>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="misto">Pagamento Misto</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pago"
              checked={comanda.pago}
              onChange={(e) => onChange('pago', e.target.checked)}
              className="h-4 w-4 text-green-600 border-gray-300 rounded"
            />
            <label htmlFor="pago" className="text-sm font-medium text-gray-700">
              Pedido Pago
            </label>
          </div>
        </div>
      </div>

      {/* Botão de Ação */}
      <div className="flex justify-end">
        <button
          onClick={onSaveComanda}
          disabled={salvando}
          className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2 text-sm ${
            salvando ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save size={18} />
          {salvando ? 'Salvando...' : 'Salvar e Imprimir'}
        </button>
      </div>
    </div>
  );
};

// useComandas Hook
const useComandas = () => {
  const [comandasAnteriores, setComandasAnteriores] = useState<Comanda[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [expandedComandas, setExpandedComandas] = useState<{ [key: string]: boolean }>({});
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [comandaSelecionada, setComandaSelecionada] = useState<Comanda | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregarComandas = async () => {
    try {
      setCarregando(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Usuário não está autenticado');
        setComandasAnteriores([]);
        return;
      }

      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const comandasFormatadas = data?.map(comanda => ({
        ...comanda,
        produtos: Array.isArray(comanda.produtos) ? comanda.produtos : JSON.parse(comanda.produtos as string),
      })) || [];
      setComandasAnteriores(comandasFormatadas);
    } catch (error) {
      toast.error('Erro ao carregar comandas anteriores.');
    } finally {
      setCarregando(false);
    }
  };

  const toggleExpandComanda = (id: string) => {
    setExpandedComandas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const reimprimirComanda = (comanda: Comanda) => {
    import('../utils/printService').then(module => {
      module.imprimirComanda(comanda);
      toast.success('Comanda enviada para impressão');
    }).catch(() => toast.error('Erro ao reimprimir comanda'));
  };

  const excluirComanda = async (id: string | undefined) => {
    if (!id || !confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      const { error } = await supabase.from('comandas').delete().eq('id', id);
      if (error) throw error;
      await carregarComandas();
      setExpandedComandas(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[id];
        return newExpanded;
      });
      toast.success('Pedido excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir o pedido.');
    }
  };

  const confirmarPagamento = async () => {
    if (!comandaSelecionada || !comandaSelecionada.id) return;
    try {
      const { error } = await supabase
        .from('comandas')
        .update({ pago: !comandaSelecionada.pago })
        .eq('id', comandaSelecionada.id);
      if (error) throw error;
      await carregarComandas();
      setShowPaymentConfirmation(false);
      toast.success(`Pedido marcado como ${!comandaSelecionada.pago ? 'PAGO' : 'NÃO PAGO'}!`);
    } catch (error) {
      toast.error('Erro ao atualizar status de pagamento');
    }
  };

  const calcularTotais = () => {
    const totais = { pix: 0, dinheiro: 0, cartao: 0, geral: 0, confirmados: 0, naoConfirmados: 0 };
    comandasAnteriores.forEach(comanda => {
      if (comanda.pago) totais.confirmados += comanda.total;
      else totais.naoConfirmados += comanda.total;
      totais.geral += comanda.total;
      if (comanda.forma_pagamento === 'pix') totais.pix += comanda.total;
      else if (comanda.forma_pagamento === 'dinheiro') totais.dinheiro += comanda.total;
      else if (comanda.forma_pagamento === 'cartao') totais.cartao += comanda.total;
    });
    return totais;
  };

  return {
    comandasAnteriores,
    carregando,
    expandedComandas,
    salvando,
    setSalvando,
    reimprimirComanda,
    excluirComanda,
    toggleExpandComanda,
    carregarComandas,
    totais: calcularTotais(),
    confirmarPagamento,
    comandaSelecionada,
    setComandaSelecionada,
    showPaymentConfirmation,
    setShowPaymentConfirmation,
  };
};

// useComandaForm Hook
const useComandaForm = (carregarComandas: () => Promise<void>, setSalvando: (value: boolean) => void) => {
  const [comanda, setComanda] = useState<Comanda>({
    id: '',
    user_id: '',
    produtos: [],
    total: 0,
    forma_pagamento: '',
    data: '',
    endereco: '',
    bairro: 'Jardim Paraíso',
    taxaentrega: 6,
    pago: false,
    quantiapaga: 0,
    troco: 0,
    valor_cartao: 0,
    valor_dinheiro: 0,
    valor_pix: 0,
  });
  const [pesquisaProduto, setPesquisaProduto] = useState('');
  const [produtosCadastrados, setProdutosCadastrados] = useState<{ id: string; nome: string; valor: number }[]>([]);
  const [editingProduct, setEditingProduct] = useState<{ id: string; nome: string; valor: number } | null>(null);
  const [showTrocoModal, setShowTrocoModal] = useState(false);
  const [needsTroco, setNeedsTroco] = useState<boolean | null>(null);
  const [quantiapagaInput, setQuantiapagaInput] = useState<number | null>(null);
  const [showPagamentoMistoModal, setShowPagamentoMistoModal] = useState(false);
  const [valorCartaoInput, setValorCartaoInput] = useState<number | null>(null);
  const [valorDinheiroInput, setValorDinheiroInput] = useState<number | null>(null);
  const [valorPixInput, setValorPixInput] = useState<number | null>(null);

  // Buscar produtos do Supabase
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const { data, error } = await supabase.from('produtos').select('id, nome, valor').order('nome');
        if (error) throw error;
        setProdutosCadastrados(data || []);
      } catch (error) {
        toast.error('Erro ao carregar produtos cadastrados.');
      }
    };
    fetchProdutos();
  }, []);

  const produtosFiltrados = produtosCadastrados.filter(p =>
    p.nome.toLowerCase().includes(pesquisaProduto.toLowerCase())
  );

  const totalComTaxa = comanda.total + comanda.taxaentrega;

  const onChange = (field: string, value: any) => {
    if (field === 'pesquisaProduto') setPesquisaProduto(value);
    else if (field === 'endereco') setComanda(prev => ({ ...prev, endereco: value }));
    else if (field === 'pago') setComanda(prev => ({ ...prev, pago: value }));
    else if (field === 'quantiapagaInput') setQuantiapagaInput(value ? Number(value) : null);
    else if (field === 'needsTroco') setNeedsTroco(value === 'true' ? true : value === 'false' ? false : null);
    else if (field === 'valorCartaoInput') setValorCartaoInput(value ? Number(value) : null);
    else if (field === 'valorDinheiroInput') setValorDinheiroInput(value ? Number(value) : null);
    else if (field === 'valorPixInput') setValorPixInput(value ? Number(value) : null);
  };

  const onBairroChange = (bairro: string) => {
    const taxa = bairroTaxas[bairro as keyof typeof bairroTaxas] || 0;
    setComanda(prev => ({ ...prev, bairro, taxaentrega: taxa }));
  };

  const onFormaPagamentoChange = (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => {
    setComanda(prev => ({ ...prev, forma_pagamento: forma }));
    if (forma === 'dinheiro') {
      setShowTrocoModal(true);
      setNeedsTroco(null); // Reset needsTroco when opening modal
    } else if (forma === 'misto') {
      setShowPagamentoMistoModal(true);
    } else {
      setShowTrocoModal(false);
      setShowPagamentoMistoModal(false);
      setNeedsTroco(null);
      setQuantiapagaInput(null);
    }
  };

  const salvarProduto = async (nome: string, valor: string) => {
    const valorNum = Number(valor);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autorizado');
    const { data, error } = await supabase
      .from('produtos')
      .insert([{ nome, valor: valorNum, user_id: session.user.id }])
      .select('id, nome, valor');
    if (error) throw error;
    if (data && data[0]) {
      setProdutosCadastrados(prev => [...prev, data[0]].sort((a, b) => a.nome.localeCompare(b.nome)));
    }
  };

  const editarProduto = async (id: string, nome: string, valor: string) => {
    const valorNum = Number(valor);
    const { error } = await supabase
      .from('produtos')
      .update({ nome, valor: valorNum })
      .eq('id', id);
    if (error) throw error;
    setProdutosCadastrados(prev =>
      prev
        .map(p => (p.id === id ? { id, nome, valor: valorNum } : p))
        .sort((a, b) => a.nome.localeCompare(b.nome))
    );
  };

  const adicionarProdutoCadastrado = (produto: { id: string; nome: string; valor: number }) => {
    const novoProduto: Produto = { nome: produto.nome, valor: produto.valor, quantidade: 1 };
    setComanda(prev => ({
      ...prev,
      produtos: [...prev.produtos, novoProduto],
      total: prev.total + produto.valor,
    }));
    setPesquisaProduto('');
  };

  const removerProduto = (index: number) => {
    const produtoRemovido = comanda.produtos[index];
    setComanda(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index),
      total: prev.total - produtoRemovido.valor * produtoRemovido.quantidade,
    }));
  };

  const atualizarQuantidadeProduto = (index: number, quantidade: number) => {
    if (quantidade < 1) {
      toast.error('A quantidade deve ser pelo menos 1.');
      return;
    }
    setComanda(prev => {
      const novosProdutos = [...prev.produtos];
      const produtoAntigo = novosProdutos[index];
      const diferencaQuantidade = quantidade - produtoAntigo.quantidade;
      novosProdutos[index] = { ...produtoAntigo, quantidade };
      return {
        ...prev,
        produtos: novosProdutos,
        total: prev.total + diferencaQuantidade * produtoAntigo.valor,
      };
    });
  };

  const selecionarProdutoCadastrado = (produto: { id: string; nome: string; valor: number }) => {
    adicionarProdutoCadastrado(produto);
  };

  const startEditingProduct = (produto: { id: string; nome: string; valor: number }) => {
    setEditingProduct(produto);
  };

  const salvarComanda = async () => {
    if (comanda.produtos.length === 0) {
      toast.error('Adicione pelo menos um produto.');
      return;
    }
    if (!comanda.forma_pagamento) {
      toast.error('Selecione a forma de pagamento.');
      return;
    }
    if (!comanda.endereco || !comanda.bairro) {
      toast.error('Preencha o endereço e o bairro.');
      return;
    }
    if (comanda.forma_pagamento === 'dinheiro' && needsTroco === null) {
      toast.error('Selecione se precisa de troco.');
      return;
    }
    if (comanda.forma_pagamento === 'dinheiro' && needsTroco && (quantiapagaInput === null || quantiapagaInput <= 0)) {
      toast.error('Informe a quantia paga.');
      return;
    }
    if (comanda.forma_pagamento === 'misto') {
      const totalValores = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
      if (totalValores !== totalComTaxa) {
        toast.error('A soma dos valores deve ser igual ao total.');
        return;
      }
    }

    setSalvando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autorizado');

      const novaComanda = {
        user_id: session.user.id,
        produtos: comanda.produtos,
        total: totalComTaxa,
        forma_pagamento: comanda.forma_pagamento,
        data: new Date().toISOString(),
        endereco: comanda.endereco,
        bairro: comanda.bairro,
        taxaentrega: comanda.taxaentrega,
        pago: comanda.pago,
        quantiapaga: comanda.forma_pagamento === 'dinheiro' && !needsTroco ? totalComTaxa : quantiapagaInput || 0,
        troco: comanda.forma_pagamento === 'dinheiro' && !needsTroco ? 0 : quantiapagaInput && quantiapagaInput > totalComTaxa ? quantiapagaInput - totalComTaxa : 0,
        valor_cartao: valorCartaoInput || 0,
        valor_dinheiro: valorDinheiroInput || 0,
        valor_pix: valorPixInput || 0,
      };

      const { data, error } = await supabase.from('comandas').insert([novaComanda]).select().single();
      if (error) throw error;

      // Print the comanda
      await import('../utils/printService').then(module => {
        module.imprimirComanda({ ...novaComanda, id: data.id });
        toast.success('Comanda salva e enviada para impressão!');
      }).catch(() => {
        toast.error('Comanda salva, mas erro ao imprimir.');
      });

      // Reset form
      setComanda({
        id: '',
        user_id: '',
        produtos: [],
        total: 0,
        forma_pagamento: '',
        data: '',
        endereco: '',
        bairro: 'Jardim Paraíso',
        taxaentrega: 6,
        pago: false,
        quantiapaga: 0,
        troco: 0,
        valor_cartao: 0,
        valor_dinheiro: 0,
        valor_pix: 0,
      });
      setQuantiapagaInput(null);
      setValorCartaoInput(null);
      setValorDinheiroInput(null);
      setValorPixInput(null);
      setNeedsTroco(null);
      await carregarComandas();
    } catch (error: any) {
      toast.error(`Erro ao salvar comanda: ${error.message || 'Desconhecido'}`);
    } finally {
      setSalvando(false);
    }
  };

  const handleTrocoConfirm = () => {
    if (needsTroco === null) {
      toast.error('Selecione se precisa de troco.');
      return;
    }
    if (needsTroco && (quantiapagaInput === null || quantiapagaInput < totalComTaxa)) {
      toast.error('Quantia paga insuficiente.');
      return;
    }
    if (!needsTroco) {
      setQuantiapagaInput(totalComTaxa); // Set exact amount if no change needed
    }
    setShowTrocoModal(false);
  };

  const closeTrocoModal = () => {
    setShowTrocoModal(false);
    setQuantiapagaInput(null);
    setNeedsTroco(null);
  };

  const handlePagamentoMistoConfirm = () => {
    const totalValores = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
    if (totalValores === totalComTaxa) {
      setShowPagamentoMistoModal(false);
    } else {
      toast.error('A soma dos valores deve ser igual ao total.');
    }
  };

  const closePagamentoMistoModal = () => {
    setShowPagamentoMistoModal(false);
    setValorCartaoInput(null);
    setValorDinheiroInput(null);
    setValorPixInput(null);
  };

  return {
    comanda,
    pesquisaProduto,
    produtosFiltrados,
    editingProduct,
    setEditingProduct,
    showTrocoModal,
    needsTroco,
    quantiapagaInput,
    totalComTaxa,
    showPagamentoMistoModal,
    valorCartaoInput,
    valorDinheiroInput,
    valorPixInput,
    onBairroChange,
    salvarProduto,
    editarProduto,
    removerProduto,
    atualizarQuantidadeProduto,
    onFormaPagamentoChange,
    onChange,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    salvarComanda,
    selecionarProdutoCadastrado,
    startEditingProduct,
  };
};

// TrocoModal Props Interface
interface TrocoModalProps {
  show: boolean;
  needsTroco: boolean | null;
  quantiapagaInput: number | null;
  totalComTaxa: number;
  onClose: () => void;
  onConfirm: () => void;
  onChange: (field: string, value: any) => void;
  onSaveAndPrint?: () => void;
}

// TrocoModal Component
const TrocoModal = ({
  show,
  needsTroco,
  quantiapagaInput,
  totalComTaxa,
  onClose,
  onConfirm,
  onChange,
  onSaveAndPrint,
}: TrocoModalProps) => {
  if (!show) return
};

// DeliveryApp Component
interface DeliveryAppProps {
  profile: Profile | null;
}

export default function DeliveryApp({ profile }: DeliveryAppProps) {
  const {
    comandasAnteriores,
    carregando,
    expandedComandas,
    salvando,
    setSalvando,
    reimprimirComanda,
    excluirComanda,
    toggleExpandComanda,
    carregarComandas,
    totais,
    confirmarPagamento,
    comandaSelecionada,
    setComandaSelecionada,
    showPaymentConfirmation,
    setShowPaymentConfirmation,
  } = useComandas();

  const {
    comanda,
    nomeProduto,
    valorProduto,
    quantidadeProduto,
    pesquisaProduto,
    produtosFiltrados,
    showTrocoModal,
    needsTroco,
    quantiapagaInput,
    totalComTaxa,
    showPagamentoMistoModal,
    valorCartaoInput,
    valorDinheiroInput,
    valorPixInput,
    handleBairroChange,
    adicionarProduto,
    removerProduto,
    handleFormaPagamentoChange,
    handleChange,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    salvarComanda,
    selecionarProdutoCadastrado
  } = useComandaForm(carregarComandas, setSalvando);

  const [editingProduct, setEditingProduct] = useState<{ id: string; nome: string; valor: number } | null>(null);

  const onSaveProduto = async (nome: string, valor: string) => {
    try {
      const valorNum = Number(valor);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autorizado');
      const { data, error } = await supabase
        .from('produtos')
        .insert([{ nome, valor: valorNum, user_id: session.user.id }])
        .select('id, nome, valor');
      if (error) throw error;
      if (data && data[0]) {
        toast.success('Produto cadastrado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao salvar produto.');
    }
  };

  const onEditProduto = async (id: string, nome: string, valor: string) => {
    try {
      const valorNum = Number(valor);
      const { error } = await supabase
        .from('produtos')
        .update({ nome, valor: valorNum })
        .eq('id', id);
      if (error) throw error;
      toast.success('Produto atualizado com sucesso!');
      setEditingProduct(null);
    } catch (error) {
      toast.error('Erro ao atualizar produto.');
    }
  };

  const startEditingProduct = (produto: { id: string; nome: string; valor: number }) => {
    setEditingProduct(produto);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">App de Delivery - {profile?.store_name || 'Seu Restaurante'}</h1>
      
      {/* Grid para layout responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Coluna da esquerda - Form */}
        <div className="space-y-6">
          {/* Componente para cadastro de produtos */}
          <CadastroProdutoForm
            onSaveProduto={onSaveProduto}
            onEditProduto={onEditProduto}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
          />
          
          {/* Cadastro de Produtos para a comanda */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">Adicionar Produtos ao Pedido</h2>
            
            {/* Busca de produtos cadastrados */}
            <div className="mb-4">
              <label htmlFor="pesquisaProduto" className="block text-sm font-medium text-gray-700">
                Buscar Produto Cadastrado
              </label>
              <div className="relative">
                <input
                  id="pesquisaProduto"
                  type="text"
                  value={pesquisaProduto}
                  onChange={(e) => handleChange('pesquisaProduto', e.target.value)}
                  placeholder="Digite para buscar produtos cadastrados"
                  className="w-full p-2 pl-8 border rounded text-sm"
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                
                {pesquisaProduto && produtosFiltrados.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {produtosFiltrados.map((produto) => (
                      <div
                        key={produto.id}
                        className="p-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                        onClick={() => selecionarProdutoCadastrado(produto)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{produto.nome}</div>
                          <div className="text-sm text-gray-600">R$ {produto.valor.toFixed(2)}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingProduct(produto);
                          }}
                          className="text-blue-600 hover:text-blue-900 ml-2"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {pesquisaProduto && produtosFiltrados.length === 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 p-2 text-center text-gray-500">
                    Nenhum produto encontrado
                  </div>
                )}
              </div>
            </div>
            
            {/* Formulário de adição manual de produtos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="nomeProduto" className="block text-sm font-medium text-gray-700">
                  Nome do Produto
                </label>
                <input
                  id="nomeProduto"
                  type="text"
                  value={nomeProduto}
                  onChange={(e) => handleChange('nomeProduto', e.target.value)}
                  placeholder="Ex: X-Bacon"
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              <div>
                <label htmlFor="valorProduto" className="block text-sm font-medium text-gray-700">
                  Valor (R$)
                </label>
                <input
                  id="valorProduto"
                  type="number"
                  value={valorProduto}
                  onChange={(e) => handleChange('valorProduto', e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2 border rounded text-sm"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="quantidadeProduto" className="block text-sm font-medium text-gray-700">
                  Quantidade
                </label>
                <input
                  id="quantidadeProduto"
                  type="number"
                  value={quantidadeProduto}
                  onChange={(e) => handleChange('quantidadeProduto', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  min="1"
                />
              </div>
            </div>
            
            <button
              onClick={adicionarProduto}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Adicionar Produto ao Pedido
            </button>
          </div>
          
          {/* Lista de produtos da comanda */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">Produtos do Pedido</h2>
            
            {comanda.produtos.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum produto adicionado ainda.</p>
            ) : (
              <div className="space-y-2">
                {comanda.produtos.map((produto, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                    <span className="flex-1">{produto.nome}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Qtd: {produto.quantidade}</span>
                      <span>R$ {(produto.valor * produto.quantidade).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => removerProduto(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center mt-4 font-semibold">
                  <span>Subtotal:</span>
                  <span>R$ {comanda.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Informações de Entrega e Pagamento */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg font-semibold mb-4">Informações de Entrega</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
                  Endereço de Entrega
                </label>
                <input
                  id="endereco"
                  type="text"
                  value={comanda.endereco}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                  placeholder="Rua, número, complemento"
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
                  Bairro
                </label>
                <select
                  id="bairro"
                  value={comanda.bairro}
                  onChange={(e) => handleBairroChange(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="Jardim Paraíso">Jardim Paraíso (R$ 6,00)</option>
                  <option value="Aventureiro">Aventureiro (R$ 9,00)</option>
                  <option value="Jardim Sofia">Jardim Sofia (R$ 9,00)</option>
                  <option value="Cubatão">Cubatão (R$ 9,00)</option>
                </select>
              </div>
              
              {/* Taxa de entrega */}
              <div className="flex justify-between text-sm">
                <span>Taxa de Entrega:</span>
                <span className="font-semibold">R$ {comanda.taxaentrega.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-base font-semibold">
                <span>Total com Taxa:</span>
                <span>R$ {totalComTaxa.toFixed(2)}</span>
              </div>
              
              <div>
                <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-700">
                  Forma de Pagamento
                </label>
                <select
                  id="formaPagamento"
                  value={comanda.forma_pagamento}
                  onChange={(e) => handleFormaPagamentoChange(e.target.value as 'pix' | 'dinheiro' | 'cartao' | 'misto' | '')}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="">Selecione a forma de pagamento</option>
                  <option value="pix">PIX</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                  <option value="misto">Pagamento Misto</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pago"
                  checked={comanda.pago}
                  onChange={(e) => handleChange('pago', e.target.checked)}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="pago" className="ml-2 text-sm text-gray-700">
                  Pedido Pago
                </label>
              </div>
              
              <button
                onClick={salvarComanda}
                disabled={salvando}
                className={`w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2 ${
                  salvando ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save size={18} />
                {salvando ? 'Salvando...' : 'Salvar e Imprimir'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Coluna da direita - Comandas anteriores e gráficos */}
        <div className="space-y-6">
          <TotaisPorStatusPagamento
            confirmados={totais.confirmados}
            naoConfirmados={totais.naoConfirmados}
            pix={totais.pix}
            dinheiro={totais.dinheiro}
            cartao={totais.cartao}
          />
          
          <ComandasAnterioresModificado
            comandas={comandasAnteriores}
            carregando={carregando}
            expandidas={expandedComandas}
            onToggleExpand={toggleExpandComanda}
            onReimprimir={reimprimirComanda}
            onExcluir={excluirComanda}
            onConfirmarPagamento={(comanda) => {
              setComandaSelecionada(comanda);
              setShowPaymentConfirmation(true);
            }}
            onCarregarComandas={carregarComandas}
          />
        </div>
      </div>
      
      {/* Modal de Confirmação de Pagamento */}
      <PaymentConfirmationModal
        show={showPaymentConfirmation}
        comanda={comandaSelecionada}
        onClose={() => setShowPaymentConfirmation(false)}
        onConfirm={confirmarPagamento}
      />
      
      {/* Modal de Troco */}
      <TrocoModal
        show={showTrocoModal}
        needsTroco={needsTroco}
        quantiapagaInput={quantiapagaInput}
        totalComTaxa={totalComTaxa}
        onClose={closeTrocoModal}
        onConfirm={handleTrocoConfirm}
        onChange={handleChange}
      />
    </div>
  );
}
