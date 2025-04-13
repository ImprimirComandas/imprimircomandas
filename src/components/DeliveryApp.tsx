import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, Comanda, Produto } from '../types/database';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import ComandasAnterioresModificado from './ComandasAnterioresModificado';
import TotaisPorFormaPagamento from './TotaisPorFormaPagamento';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import TotaisPorStatusPagamento from './TotaisPorStatusPagamento';

interface DeliveryAppProps {
  profile: Profile | null;
}

export default function DeliveryApp({ profile }: DeliveryAppProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [comandasAnteriores, setComandasAnteriores] = useState<Comanda[]>([]);
  const [total, setTotal] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState<'pix' | 'dinheiro' | 'cartao' | 'misto' | ''>('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [taxaentrega, setTaxaentrega] = useState(0);
  const [pago, setPago] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [produtoNome, setProdutoNome] = useState('');
  const [produtoValor, setProdutoValor] = useState(0);
  const [expandedComandas, setExpandedComandas] = useState<{ [key: string]: boolean }>({});
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [comandaSelecionada, setComandaSelecionada] = useState<Comanda | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [quantiapaga, setQuantiapaga] = useState<number | null>(null);
  const [troco, setTroco] = useState<number | null>(null);
  const [valorCartao, setValorCartao] = useState<number | null>(null);
  const [valorDinheiro, setValorDinheiro] = useState<number | null>(null);
  const [valorPix, setValorPix] = useState<number | null>(null);

  useEffect(() => {
    carregarComandas();
  }, []);

  const carregarComandas = async () => {
    try {
      setCarregando(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('Usuário não está autenticado');
        setCarregando(false);
        setComandasAnteriores([]);
        return;
      }

      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao carregar comandas do Supabase:', error);
        throw error;
      }

      console.log('Comandas carregadas:', data);
      
      // Converter o campo produtos de JSONB para objeto JavaScript
      const comandasFormatadas = data?.map(comanda => ({
        ...comanda,
        produtos: Array.isArray(comanda.produtos) ? comanda.produtos : JSON.parse(comanda.produtos as any)
      })) || [];
      
      setComandasAnteriores(comandasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar comandas:', error);
      toast.error('Erro ao carregar comandas anteriores. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const adicionarProduto = () => {
    if (!produtoNome || !produtoValor || !quantidade) {
      toast.error('Por favor, preencha o nome, valor e quantidade do produto.');
      return;
    }

    const novoProduto = {
      nome: produtoNome,
      valor: produtoValor,
      quantidade: quantidade,
    };

    setProdutos([...produtos, novoProduto]);
    setTotal(total + produtoValor * quantidade);
    setProdutoNome('');
    setProdutoValor(0);
    setQuantidade(1);
  };

  const removerProduto = (index: number) => {
    const produtoRemovido = produtos[index];
    const novosProdutos = [...produtos];
    novosProdutos.splice(index, 1);
    setProdutos(novosProdutos);
    setTotal(total - produtoRemovido.valor * produtoRemovido.quantidade);
  };

  const limparComanda = () => {
    setProdutos([]);
    setTotal(0);
    setFormaPagamento('');
    setEndereco('');
    setBairro('');
    setTaxaentrega(0);
    setPago(false);
    setQuantiapaga(null);
    setTroco(null);
    setValorCartao(null);
    setValorDinheiro(null);
    setValorPix(null);
  };

  const toggleExpandComanda = (id: string) => {
    setExpandedComandas(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (produtos.length === 0) {
      toast.error('Adicione pelo menos um produto ao pedido.');
      return;
    }

    if (!formaPagamento) {
      toast.error('Selecione a forma de pagamento.');
      return;
    }

    if (!endereco || !bairro) {
      toast.error('Preencha o endereço e o bairro.');
      return;
    }

    if (formaPagamento === 'dinheiro' && (quantiapaga === null || quantiapaga <= 0)) {
      toast.error('Informe a quantia paga pelo cliente.');
      return;
    }

    if (formaPagamento === 'misto') {
      if ((valorCartao === null || valorCartao < 0) && (valorDinheiro === null || valorDinheiro < 0) && (valorPix === null || valorPix < 0)) {
        toast.error('Informe pelo menos um valor para as formas de pagamento (Cartão, Dinheiro ou PIX).');
        return;
      }

      let totalValores = (valorCartao || 0) + (valorDinheiro || 0) + (valorPix || 0);
      if (totalValores !== total) {
        toast.error('A soma dos valores das formas de pagamento deve ser igual ao total do pedido.');
        return;
      }
    }

    setSalvando(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autorizado');

      const comanda = {
        user_id: session.user.id,
        produtos: produtos,
        total: total,
        forma_pagamento: formaPagamento,
        data: new Date().toISOString(),
        endereco: endereco,
        bairro: bairro,
        taxaentrega: taxaentrega,
        pago: pago,
        quantiapaga: quantiapaga || 0,
        troco: troco || 0,
        valor_cartao: valorCartao || 0,
        valor_dinheiro: valorDinheiro || 0,
        valor_pix: valorPix || 0,
      };

      const { error } = await supabase
        .from('comandas')
        .insert([comanda]);

      if (error) throw error;

      toast.success('Comanda salva com sucesso!');
      limparComanda();
      await carregarComandas();
    } catch (error) {
      console.error('Erro ao salvar comanda:', error);
      toast.error('Erro ao salvar a comanda. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const calcularTroco = () => {
    if (quantiapaga !== null) {
      const trocoCalculado = quantiapaga - total;
      setTroco(trocoCalculado > 0 ? trocoCalculado : 0);
    } else {
      setTroco(0);
    }
  };

  const reimprimirComanda = (comandaAntiga: Comanda) => {
    try {
      // Import dynamically to avoid circular dependencies
      import('../utils/printService').then(module => {
        module.imprimirComanda(comandaAntiga);
        toast.success('Comanda enviada para impressão');
      });
    } catch (error) {
      console.error('Erro ao reimprimir comanda:', error);
      toast.error('Erro ao reimprimir comanda');
    }
  };

  const excluirComanda = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir comanda:', error);
        throw error;
      }

      await carregarComandas();
      setExpandedComandas(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[id];
        return newExpanded;
      });
      toast.success('Pedido excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir comanda:', error);
      toast.error('Erro ao excluir o pedido. Tente novamente.');
    }
  };

  const prepareConfirmPayment = (comanda: Comanda) => {
    setComandaSelecionada(comanda);
    setShowPaymentConfirmation(true);
  };

  const confirmarPagamento = async () => {
    if (!comandaSelecionada || !comandaSelecionada.id) return;
    
    try {
      const { error } = await supabase
        .from('comandas')
        .update({ pago: !comandaSelecionada.pago })
        .eq('id', comandaSelecionada.id);

      if (error) {
        console.error('Erro ao atualizar status de pagamento:', error);
        toast.error('Erro ao atualizar status de pagamento');
        return;
      }

      await carregarComandas();
      setShowPaymentConfirmation(false);
      
      const novoStatus = !comandaSelecionada.pago ? 'PAGO' : 'NÃO PAGO';
      toast.success(`Pedido marcado como ${novoStatus} com sucesso!`);
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error('Erro ao atualizar status de pagamento');
    }
  };

  const calcularTotais = () => {
    const totais = {
      pix: 0,
      dinheiro: 0,
      cartao: 0,
      geral: 0,
      confirmados: 0,
      naoConfirmados: 0
    };

    comandasAnteriores.forEach(comanda => {
      if (comanda.pago) {
        totais.confirmados += comanda.total;
      } else {
        totais.naoConfirmados += comanda.total;
      }
      
      totais.geral += comanda.total;
      
      if (comanda.forma_pagamento === 'pix') {
        totais.pix += comanda.total;
      } else if (comanda.forma_pagamento === 'dinheiro') {
        totais.dinheiro += comanda.total;
      } else if (comanda.forma_pagamento === 'cartao') {
        totais.cartao += comanda.total;
      }
    });

    return totais;
  };

  const getUltimos8Digitos = (id: string | undefined): string => {
    if (!id) return 'N/A';
    return id.slice(-8);
  };

  const totais = calcularTotais();

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section: New Order */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Novo Pedido</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Input */}
              <div>
                <label htmlFor="produto-nome" className="block text-sm font-medium text-gray-700">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  id="produto-nome"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={produtoNome}
                  onChange={(e) => setProdutoNome(e.target.value)}
                />
              </div>
              {/* Price Input */}
              <div>
                <label htmlFor="produto-valor" className="block text-sm font-medium text-gray-700">
                  Valor do Produto
                </label>
                <input
                  type="number"
                  id="produto-valor"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={produtoValor === 0 ? '' : produtoValor}
                  onChange={(e) => setProdutoValor(Number(e.target.value))}
                />
              </div>
              {/* Quantity Input */}
              <div>
                <label htmlFor="produto-quantidade" className="block text-sm font-medium text-gray-700">
                  Quantidade
                </label>
                <input
                  type="number"
                  id="produto-quantidade"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  min="1"
                />
              </div>
              {/* Add Product Button */}
              <button
                type="button"
                onClick={adicionarProduto}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors w-full"
              >
                Adicionar Produto
              </button>

              {/* Product List */}
              {produtos.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-700 mb-2">Produtos Adicionados</h3>
                  <ul>
                    {produtos.map((produto, index) => (
                      <li key={index} className="py-2 border-b border-gray-200 flex justify-between items-center">
                        <span>{produto.nome} - {produto.quantidade} x R$ {produto.valor.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => removerProduto(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="font-bold text-gray-800 mt-2">Total: R$ {total.toFixed(2)}</div>
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label htmlFor="forma-pagamento" className="block text-sm font-medium text-gray-700">
                  Forma de Pagamento
                </label>
                <select
                  id="forma-pagamento"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value as 'pix' | 'dinheiro' | 'cartao' | 'misto' | '')}
                >
                  <option value="">Selecione...</option>
                  <option value="pix">PIX</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                  <option value="misto">Misto</option>
                </select>
              </div>

              {/* Mixed Payment Inputs */}
              {formaPagamento === 'misto' && (
                <div className="space-y-2">
                  <div>
                    <label htmlFor="valor-cartao" className="block text-sm font-medium text-gray-700">
                      Valor no Cartão
                    </label>
                    <input
                      type="number"
                      id="valor-cartao"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      value={valorCartao === null ? '' : valorCartao}
                      onChange={(e) => setValorCartao(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label htmlFor="valor-dinheiro" className="block text-sm font-medium text-gray-700">
                      Valor em Dinheiro
                    </label>
                    <input
                      type="number"
                      id="valor-dinheiro"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      value={valorDinheiro === null ? '' : valorDinheiro}
                      onChange={(e) => setValorDinheiro(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label htmlFor="valor-pix" className="block text-sm font-medium text-gray-700">
                      Valor no PIX
                    </label>
                    <input
                      type="number"
                      id="valor-pix"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      value={valorPix === null ? '' : valorPix}
                      onChange={(e) => setValorPix(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {/* Address and Neighborhood */}
              <div>
                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <input
                  type="text"
                  id="endereco"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
                  Bairro
                </label>
                <input
                  type="text"
                  id="bairro"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                />
              </div>

              {/* Delivery Fee */}
              <div>
                <label htmlFor="taxaentrega" className="block text-sm font-medium text-gray-700">
                  Taxa de Entrega
                </label>
                <input
                  type="number"
                  id="taxaentrega"
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  value={taxaentrega === 0 ? '' : taxaentrega}
                  onChange={(e) => setTaxaentrega(Number(e.target.value))}
                />
              </div>

              {/* Amount Paid and Change */}
              {formaPagamento === 'dinheiro' && (
                <div className="space-y-2">
                  <div>
                    <label htmlFor="quantiapaga" className="block text-sm font-medium text-gray-700">
                      Quantia Paga
                    </label>
                    <input
                      type="number"
                      id="quantiapaga"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      value={quantiapaga === null ? '' : quantiapaga}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setQuantiapaga(value);
                      }}
                      onBlur={calcularTroco}
                    />
                  </div>
                  {troco !== null && (
                    <div className="font-semibold text-gray-700">Troco: R$ {troco.toFixed(2)}</div>
                  )}
                </div>
              )}

              {/* Paid Status */}
              <div className="flex items-center">
                <input
                  id="pago"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={pago}
                  onChange={(e) => setPago(e.target.checked)}
                />
                <label htmlFor="pago" className="ml-2 block text-sm text-gray-900">
                  Pago
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={salvando}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors w-full"
              >
                {salvando ? 'Salvando...' : 'Salvar Comanda'}
              </button>
            </form>
          </div>

          {/* Section: Previous Orders */}
          <div>
            <TotaisPorStatusPagamento 
              confirmados={totais.confirmados} 
              naoConfirmados={totais.naoConfirmados} 
              total={totais.geral} 
            />
            <TotaisPorFormaPagamento totais={totais} />
            <ComandasAnterioresModificado
              comandas={comandasAnteriores}
              expandedComandas={expandedComandas}
              carregando={carregando}
              onReimprimir={reimprimirComanda}
              onExcluir={excluirComanda}
              onToggleExpand={toggleExpandComanda}
              getUltimos8Digitos={getUltimos8Digitos}
              onConfirmPayment={prepareConfirmPayment}
            />
          </div>
        </div>
      </div>

      <PaymentConfirmationModal
        show={showPaymentConfirmation}
        comanda={comandaSelecionada}
        onClose={() => setShowPaymentConfirmation(false)}
        onConfirm={confirmarPagamento}
      />
    </div>
  );
}
