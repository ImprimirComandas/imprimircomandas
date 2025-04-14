import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Save, Trash2, Search, Edit, X } from 'lucide-react';
import ComandasAnterioresModificado from './ComandasAnterioresModificado';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import TotaisPorStatusPagamento from './TotaisPorStatusPagamento';
import TotaisPorFormaPagamento from './TotaisPorFormaPagamento';
import TrocoModalComponent from './TrocoModal';
import type { Profile, Comanda, Produto } from '../types/database';
import { useComandas } from '../hooks/useComandas';

const bairroTaxas = {
  'Jardim Paraíso': 6,
  'Aventureiro': 9,
  'Jardim Sofia': 9,
  'Cubatão': 9,
};

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
    comanda,
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
    onChange,
    removerProduto,
    atualizarQuantidadeProduto,
    onBairroChange,
    onFormaPagamentoChange,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    salvarComanda,
    selecionarProdutoCadastrado
  } = useComandas();

  const [nomeProduto, setNomeProduto] = useState('');
  const [valorProduto, setValorProduto] = useState('');
  const [quantidadeProduto, setQuantidadeProduto] = useState('1');
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

  const handleChange = (field: string, value: any) => {
    if (field === 'nomeProduto') {
      setNomeProduto(value);
    } else if (field === 'valorProduto') {
      setValorProduto(value);
    } else if (field === 'quantidadeProduto') {
      setQuantidadeProduto(value);
    } else {
      onChange(field, value);
    }
  };

  const adicionarProduto = () => {
    if (!nomeProduto || !valorProduto) {
      toast.error('Preencha o nome e valor do produto');
      return;
    }

    const novoProduto: Produto = {
      nome: nomeProduto,
      valor: parseFloat(valorProduto),
      quantidade: parseInt(quantidadeProduto) || 1
    };

    if (removerProduto) {
      setNomeProduto('');
      setValorProduto('');
      setQuantidadeProduto('1');
      toast.success('Produto adicionado ao pedido');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">App de Delivery - {profile?.store_name || 'Seu Restaurante'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="space-y-6">
          <CadastroProdutoForm
            onSaveProduto={onSaveProduto}
            onEditProduto={onEditProduto}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
          />
          
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">Adicionar Produtos ao Pedido</h2>
            
            <div className="mb-4">
              <label htmlFor="pesquisaProduto" className="block text-sm font-medium text-gray-700">
                Buscar Produto Cadastrado
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
                  onChange={(e) => onChange('endereco', e.target.value)}
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
                  onChange={(e) => onBairroChange(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="Jardim Paraíso">Jardim Paraíso (R$ 6,00)</option>
                  <option value="Aventureiro">Aventureiro (R$ 9,00)</option>
                  <option value="Jardim Sofia">Jardim Sofia (R$ 9,00)</option>
                  <option value="Cubatão">Cubatão (R$ 9,00)</option>
                </select>
              </div>
              
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
                  onChange={(e) => onFormaPagamentoChange(e.target.value as 'pix' | 'dinheiro' | 'cartao' | 'misto' | '')}
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
                  onChange={(e) => onChange('pago', e.target.checked)}
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
        
        <div className="space-y-6">
          <TotaisPorStatusPagamento
            confirmados={totais.confirmados || 0}
            naoConfirmados={totais.naoConfirmados || 0}
            total={totais.geral || 0}
          />
          
          <TotaisPorFormaPagamento totais={totais} />
          
          <ComandasAnterioresModificado
            comandas={comandasAnteriores}
            carregando={carregando}
            expandedComandas={expandedComandas}
            onToggleExpand={toggleExpandComanda}
            onReimprimir={reimprimirComanda}
            onExcluir={excluirComanda}
            onConfirmPayment={(comanda) => {
              setComandaSelecionada(comanda);
              setShowPaymentConfirmation(true);
            }}
          />
        </div>
      </div>
      
      <PaymentConfirmationModal
        show={showPaymentConfirmation}
        comanda={comandaSelecionada}
        onClose={() => setShowPaymentConfirmation(false)}
        onConfirm={confirmarPagamento}
      />
      
      <TrocoModalComponent
        show={showTrocoModal}
        needsTroco={needsTroco}
        quantiapagaInput={quantiapagaInput?.toString() || ''}
        totalComTaxa={totalComTaxa}
        onClose={closeTrocoModal}
        onConfirm={handleTrocoConfirm}
        onChange={onChange}
      />
    </div>
  );
}
