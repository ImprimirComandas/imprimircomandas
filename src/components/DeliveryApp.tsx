import { useState, useEffect } from 'react';
import { PlusCircle, Save, Trash2, Printer, LogOut, Settings, User, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

interface Produto {
  nome: string;
  valor: number;
  quantidade: number;
}

interface Comanda {
  id?: string;
  user_id?: string;
  produtos: Produto[];
  total: number;
  forma_pagamento: 'pix' | 'dinheiro' | 'cartao' | '';
  data: string;
  endereco: string;
  bairro: string;
  taxaentrega: number;
  pago: boolean;
  created_at?: string;
  quantiapaga?: number;
  troco?: number;
}

interface DeliveryAppProps {
  profile: Profile | null;
}

export default function DeliveryApp({ profile }: DeliveryAppProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [comanda, setComanda] = useState<Comanda>({
    produtos: [],
    total: 0,
    forma_pagamento: '',
    data: new Date().toISOString(),
    endereco: '',
    bairro: 'Jardim Paraíso',
    taxaentrega: 6,
    pago: false,
    quantiapaga: 0,
    troco: 0,
  });

  const [comandasAnteriores, setComandasAnteriores] = useState<Comanda[]>([]);
  const [nomeProduto, setNomeProduto] = useState('');
  const [valorProduto, setValorProduto] = useState('');
  const [quantidadeProduto, setQuantidadeProduto] = useState('1');
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [expandedComandas, setExpandedComandas] = useState<{ [key: string]: boolean }>({});
  const [showTrocoModal, setShowTrocoModal] = useState(false);
  const [needsTroco, setNeedsTroco] = useState<boolean | null>(null);
  const [quantiapagaInput, setquantiapagaInput] = useState('');

  useEffect(() => {
    const subtotal = comanda.produtos.reduce((acc, produto) => acc + (produto.valor * produto.quantidade), 0);
    setComanda(prev => ({ ...prev, total: subtotal }));
  }, [comanda.produtos]);

  const handleBairroChange = (bairro: string) => {
    const taxaentrega = bairro === 'Jardim Paraíso' ? 6 : 9;
    setComanda(prev => ({
      ...prev,
      bairro,
      taxaentrega,
    }));
  };

  const totalComTaxa = comanda.total + comanda.taxaentrega;

  useEffect(() => {
    carregarComandas();
  }, []);

  const carregarComandas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não está autenticado. Faça login para carregar comandas.');
      }

      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao carregar comandas do Supabase:', error);
        throw error;
      }

      console.log('Comandas carregadas:', data);
      setComandasAnteriores(data || []);
    } catch (error) {
      console.error('Erro ao carregar comandas:', error);
      alert('Erro ao carregar comandas anteriores. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const adicionarProduto = () => {
    if (!nomeProduto || !valorProduto || !quantidadeProduto) {
      alert('Preencha todos os campos do produto.');
      return;
    }

    const novoProduto: Produto = {
      nome: nomeProduto,
      valor: parseFloat(valorProduto),
      quantidade: parseInt(quantidadeProduto),
    };

    setComanda(prev => ({
      ...prev,
      produtos: [...prev.produtos, novoProduto],
    }));

    setNomeProduto('');
    setValorProduto('');
    setQuantidadeProduto('1');
  };

  const removerProduto = (index: number) => {
    setComanda(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index),
    }));
  };

  const validarComanda = () => {
    if (!comanda.endereco) {
      alert('Por favor, preencha o endereço de entrega');
      return false;
    }
    if (!comanda.bairro) {
      alert('Por favor, selecione o bairro');
      return false;
    }
    if (comanda.produtos.length === 0) {
      alert('Por favor, adicione pelo menos um produto');
      return false;
    }
    if (!comanda.forma_pagamento) {
      alert('Por favor, selecione a forma de pagamento');
      return false;
    }
    if (comanda.forma_pagamento === 'dinheiro') {
      if (needsTroco === null) {
        alert('Por favor, confirme se precisa de troco.');
        return false;
      }
      if (needsTroco && (!comanda.quantiapaga || comanda.quantiapaga <= totalComTaxa)) {
        alert('Por favor, informe uma quantia válida para calcular o troco (deve ser maior que o total com a taxa).');
        return false;
      }
    }
    return true;
  };

  const handleFormaPagamentoChange = (forma: 'pix' | 'dinheiro' | 'cartao' | '') => {
    setComanda(prev => ({
      ...prev,
      forma_pagamento: forma,
      quantiapaga: 0,
      troco: 0,
    }));
    setNeedsTroco(null);
    setquantiapagaInput('');
    if (forma === 'dinheiro') {
      setShowTrocoModal(true);
    } else {
      setShowTrocoModal(false);
    }
  };

  const handleTrocoConfirm = () => {
    if (needsTroco === null) {
      alert('Por favor, selecione se precisa de troco.');
      return;
    }
    if (needsTroco) {
      const quantia = parseFloat(quantiapagaInput);
      if (isNaN(quantia) || quantia <= totalComTaxa) {
        alert('Por favor, informe uma quantia válida maior que o total da comanda (incluindo a taxa de entrega).');
        return;
      }
      const trocoCalculado = quantia - totalComTaxa;
      setComanda(prev => ({
        ...prev,
        quantiapaga: quantia,
        troco: trocoCalculado,
      }));
    } else {
      setComanda(prev => ({
        ...prev,
        quantiapaga: 0,
        troco: 0,
      }));
    }
    setShowTrocoModal(false);
  };

  const salvarComanda = async () => {
    if (!validarComanda()) return;

    setSalvando(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não está autenticado. Faça login para salvar comandas.');
      }

      const comandaData: Omit<Comanda, 'id' | 'created_at'> = {
        user_id: user.id,
        produtos: comanda.produtos,
        total: totalComTaxa,
        forma_pagamento: comanda.forma_pagamento,
        data: comanda.data,
        endereco: comanda.endereco,
        bairro: comanda.bairro,
        taxaentrega: comanda.taxaentrega,
        pago: comanda.pago,
      };

      if (comanda.forma_pagamento === 'dinheiro' && needsTroco && comanda.quantiapaga && comanda.troco) {
        comandaData.quantiapaga = comanda.quantiapaga;
        comandaData.troco = comanda.troco;
      } else {
        comandaData.quantiapaga = undefined;
        comandaData.troco = undefined;
      }

      console.log('Dados a serem salvos no Supabase:', comandaData);

      const { data, error } = await supabase
        .from('comandas')
        .insert([comandaData])
        .select();

      if (error) {
        console.error('Erro ao salvar no Supabase:', error);
        throw new Error(error.message || 'Erro ao salvar no banco de dados');
      }

      console.log('Comanda salva com sucesso:', data);
      await carregarComandas();
      setExpandedComandas({});

      const comandaParaImprimir = { ...comandaData, id: data[0].id };
      imprimirComanda(comandaParaImprimir);

      setComanda({
        produtos: [],
        total: 0,
        forma_pagamento: '',
        data: new Date().toISOString(),
        endereco: '',
        bairro: 'Jardim Paraíso',
        taxaentrega: 6,
        pago: false,
        quantiapaga: 0,
        troco: 0,
      });
      setNomeProduto('');
      setValorProduto('');
      setQuantidadeProduto('1');
      setNeedsTroco(null);
      setquantiapagaInput('');
    } catch (error: unknown) {
      console.error('Erro ao salvar comanda:', error);
      if (error instanceof Error) {
        alert(`Erro ao salvar comanda: ${error.message || 'Tente novamente.'}`);
      } else {
        alert('Erro ao salvar comanda: Tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const getUltimos8Digitos = (id: string | undefined) => {
    if (!id) return 'N/A';
    return id.slice(-8);
  };

  const imprimirComanda = (comandaParaImprimir: Comanda) => {
    const printWindow = window.open('', '_blank', 'width=80mm,height=auto');
    if (!printWindow) {
      alert('Não foi possível abrir a janela de impressão. Verifique as configurações do navegador.');
      return;
    }
  
    // Removed unused subtotal calculation
  
    const styles = `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 2mm;
        font-family: Arial, sans-serif;
        font-size: 16px;
        width: 75mm;
        color: #000;
      }
      .header {
        text-align: center;
        margin-bottom: 2mm;
        font-weight: bold;
        font-size: 16px;
      }
      .order-id {
        text-align: center;
        font-size: 14px;
        margin-bottom: 2mm;
      }
      .info-section {
        margin-bottom: 2mm;
      }
      .info-section div {
        margin-bottom: 1mm;
      }
      .troco-section {

        text-align: right;
        margin-bottom: 1mm;
      }
      .troco-section div {
        margin-bottom: 1mm;
      }
      .divider {
        border-top: 1px dashed #000;
        margin: 2mm 0;
      }
      .produto-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2mm;
      }
      .produto-nome {
        flex: 2;
      }
      .produto-qtd {
        flex: 1;
        text-align: center;
      }
      .produto-valor {
      font-weigth: bold;
        flex: 1;
        text-align: right;
      }
      .totals-section {
        margin-top: 2mm;
      }

      .total {

        text-align: right;
        margin-bottom: 1mm;
      }
      .footer {
        margin-top: 2mm;
        text-align: center;
        font-size: 14px;
      }
      .status-pago {
        font-weight: bold;
        font-size: 26px;
        margin-bottom: 3mm;
      }
      .cut-line {
        border-top: 1px dashed #000;
        margin-top: 2mm;
      }
      .cut {
        text-align: center;
        margin-top: 10mm;
        font-size: 10px;
      }
    `;
  
    const headerSection = `
      <div class="header">Delivery</div>
      <div class="order-id">Pedido #${getUltimos8Digitos(comandaParaImprimir.id)}</div>
    `;
  
    const infoSection = `
      <div class="info-section">
        <div><strong>Forma de pagamento:</strong> ${comandaParaImprimir.forma_pagamento.toUpperCase()}</div>
        <div><strong>Endereço:</strong> ${comandaParaImprimir.endereco}</div>
        <div><strong>Bairro:</strong> ${comandaParaImprimir.bairro}</div>
        <div><strong>Data:</strong> ${new Date(comandaParaImprimir.data).toLocaleString('pt-BR')}</div>
      </div>
    `;
            
    const trocoSection = `
      ${
        comandaParaImprimir.quantiapaga && comandaParaImprimir.troco && comandaParaImprimir.quantiapaga > 0
          ? `
           
                       <div>Troco para: R$ ${comandaParaImprimir.quantiapaga.toFixed(2)}</div>
              <div>Valor do troco: R$ ${comandaParaImprimir.troco.toFixed(2)}</div>
            </div>
          `
          : ''
      }
    `;
  
    const produtosSection = `
      <div style="margin-bottom: 3mm;">
        ${comandaParaImprimir.produtos
          .map(
            (produto) => `
              <div class="produto-row">
                <div class="produto-nome">${produto.nome}</div>
                <div class="produto-qtd">${produto.quantidade}x</div>
                <div class="produto-valor">R$ ${(produto.valor * produto.quantidade).toFixed(2)}</div>
              </div>
            `
          )
          .join('')}
      </div>  <div class="divider"></div><div class="troco-section"><div class="taxa">Taxa de entrega: R$ ${comandaParaImprimir.taxaentrega.toFixed(2)}</div>
   
    `;
  
    const totalsSection = `
      <div class="totals-section">
          <div class="total">Total: R$ ${comandaParaImprimir.total.toFixed(2)}</div>
      </div>
    `;
  
    const footerSection = `
      <div class="footer">
        <div class="status-pago">${comandaParaImprimir.pago ? 'PAGO' : 'NÃO PAGO'}</div>
      </div>
    `;
  
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Delivery</title>
          <style>${styles}</style>
        </head>
        <body>
          <!-- Cabeçalho -->
          ${headerSection}
          <div class="cut-line"></div>
  
          <!-- Informações do Pedido -->
          ${infoSection}
  
          <!-- Divisor -->
          <div class="divider"></div>
  
          <!-- Lista de Produtos -->
          ${produtosSection}
  
          <!-- Divisor -->
          
  
          <!-- Totais -->
          ${totalsSection}
  
          <!-- Troco (se aplicável) -->
          ${trocoSection}
  
          <!-- Divisor -->
          <div class="cut-line"></div>
  
          <!-- Rodapé -->
          ${footerSection}
  
          <!-- Linha de Corte -->
          <div class="cut-line"></div>
          <div class="cut">Deus é fiel.</div>
  
          <!-- Script para Impressão Automática -->
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 100);
              }, 200);
            };
          </script>
        </body>
      </html>
    `;
  
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const reimprimirComanda = (comandaAntiga: Comanda) => {
    imprimirComanda(comandaAntiga);
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
    } catch (error) {
      console.error('Erro ao excluir comanda:', error);
      alert('Erro ao excluir o pedido. Tente novamente.');
    }
  };

  const toggleExpandComanda = (id: string) => {
    setExpandedComandas(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const calcularTotaisPorFormaPagamento = () => {
    const totais = {
      pix: 0,
      dinheiro: 0,
      cartao: 0,
      geral: 0,
    };

    comandasAnteriores.forEach(comanda => {
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

  const totais = calcularTotaisPorFormaPagamento();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        throw error;
      }
      console.log('Usuário deslogado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with profile menu */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile?.store_name || 'Delivery System'}
            </h1>
            
            <div className="relative">
              <button
                title="Expand or collapse items"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <span>{profile?.full_name}</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        // Add profile settings handler
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <Settings size={16} className="mr-2" />
                      Configurações de Perfil
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Formulário da Comanda */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
            <h1 className="text-xl md:text-2xl font-bold mb-6 text-center">Comanda de Delivery</h1>

            {/* Endereço */}
            <div className="mb-6">
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
                Endereço de Entrega
              </label>
              <input
                id="endereco"
                type="text"
                value={comanda.endereco}
                onChange={(e) => setComanda(prev => ({ ...prev, endereco: e.target.value }))}
                placeholder="Endereço de entrega"
                className="w-full p-2 border rounded text-sm md:text-base"
                required
              />
            </div>

            {/* Formulário de Adição de Produtos */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-6">
              <div className="flex-1">
                <label htmlFor="nomeProduto" className="block text-sm font-medium text-gray-700">
                  Nome do Produto
                </label>
                <input
                  id="nomeProduto"
                  type="text"
                  value={nomeProduto}
                  onChange={(e) => setNomeProduto(e.target.value)}
                  placeholder="Nome do Produto"
                  className="w-full p-2 border rounded text-sm md:text-base"
                />
              </div>
              <div className="flex gap-2">
                <div>
                  <label htmlFor="valorProduto" className="block text-sm font-medium text-gray-700">
                    Valor
                  </label>
                  <input
                    id="valorProduto"
                    type="number"
                    value={valorProduto}
                    onChange={(e) => setValorProduto(e.target.value)}
                    placeholder="Valor"
                    className="w-24 md:w-32 p-2 border rounded text-sm md:text-base"
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
                    onChange={(e) => setQuantidadeProduto(e.target.value)}
                    placeholder="Qtd"
                    className="w-16 md:w-20 p-2 border rounded text-sm md:text-base"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 invisible">Adicionar</label>
                  <button
                    onClick={adicionarProduto}
                    className="bg-blue-500 text-white px-3 md:px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-1 md:gap-2 text-sm md:text-base"
                  >
                    <PlusCircle size={18} />
                    <span className="hidden md:inline">Adicionar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Produtos */}
            <div className="mb-6">
              <h2 className="text-base md:text-lg font-semibold mb-3">Produtos</h2>
              <div className="space-y-2">
                {comanda.produtos.map((produto, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 md:p-3 rounded text-sm md:text-base">
                    <span className="flex-1">{produto.nome}</span>
                    <div className="flex items-center gap-2 md:gap-4">
                      <span className="text-gray-600">Qtd: {produto.quantidade}</span>
                      <span>R$ {(produto.valor * produto.quantidade).toFixed(2)}</span>
                      <button
                        onClick={() => removerProduto(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total, Forma de Pagamento, Status de Pagamento e Bairro */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base">Subtotal:</h2>
                <span className="font-bold">R$ {comanda.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base">Taxa de Entrega:</h2>
                <span className="font-bold">R$ {comanda.taxaentrega.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base">Total com Taxa:</h2>
                <span className="font-bold">R$ {totalComTaxa.toFixed(2)}</span>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-700">
                    Forma de Pagamento
                  </label>
                  <select
                    id="formaPagamento"
                    value={comanda.forma_pagamento}
                    onChange={(e) => handleFormaPagamentoChange(e.target.value as 'pix' | 'dinheiro' | 'cartao' | '')}
                    className="w-full p-2 border rounded text-sm md:text-base"
                    required
                  >
                    <option value="">Selecione a forma de pagamento</option>
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao">Cartão</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pago"
                    checked={comanda.pago}
                    onChange={(e) => setComanda(prev => ({ ...prev, pago: e.target.checked }))}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                  <label htmlFor="pago" className="text-sm font-medium text-gray-700">
                    Pedido Pago
                  </label>
                </div>

                {/* Bairro - Movido para o final */}
                <div>
                  <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
                    Bairro
                  </label>
                  <select
                    id="bairro"
                    value={comanda.bairro}
                    onChange={(e) => handleBairroChange(e.target.value)}
                    className="w-full p-2 border rounded text-sm md:text-base"
                    required
                  >
                    <option value="Jardim Paraíso">Jardim Paraíso (R$ 6,00)</option>
                    <option value="Aventureiro">Aventureiro (R$ 9,00)</option>
                    <option value="Jardim Sofia">Jardim Sofia (R$ 9,00)</option>
                    <option value="Cubatão">Cubatão (R$ 9,00)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Botão de Ação */}
            <div className="flex justify-end">
              <button
                onClick={salvarComanda}
                disabled={salvando}
                className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2 text-sm md:text-base ${
                  salvando ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save size={18} />
                {salvando ? 'Salvando...' : 'Salvar e Imprimir'}
              </button>
            </div>
          </div>

          {/* Modal de Troco */}
          {showTrocoModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Precisa de Troco?</h2>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setNeedsTroco(true)}
                    className={`px-4 py-2 rounded ${
                      needsTroco === true ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => {
                      setNeedsTroco(false);
                      setquantiapagaInput('');
                      setComanda(prev => ({ ...prev, quantiapaga: 0, troco: 0 }));
                    }}
                    className={`px-4 py-2 rounded ${
                      needsTroco === false ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Não
                  </button>
                </div>

                {needsTroco && (
                  <div className="mb-4">
                    <label htmlFor="quantiapaga" className="block text-sm font-medium text-gray-700">
                      Quantia Paga (R$)
                    </label>
                    <input
                      id="quantiapaga"
                      type="number"
                      value={quantiapagaInput}
                      onChange={(e) => setquantiapagaInput(e.target.value)}
                      placeholder="Digite a quantia paga"
                      className="w-full p-2 border rounded text-sm md:text-base"
                      step="0.01"
                      min={totalComTaxa + 0.01}
                    />
                    {quantiapagaInput && parseFloat(quantiapagaInput) > totalComTaxa && (
                      <p className="mt-2 text-sm text-gray-600">
                        Troco: R$ {(parseFloat(quantiapagaInput) - totalComTaxa).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowTrocoModal(false);
                      setNeedsTroco(null);
                      setquantiapagaInput('');
                      setComanda(prev => ({ ...prev, forma_pagamento: '', quantiapaga: 0, troco: 0 }));
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleTrocoConfirm}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={needsTroco === null}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Card com Totais por Forma de Pagamento */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Totais por Forma de Pagamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-600">PIX</p>
                <p className="text-lg font-bold text-gray-900">R$ {totais.pix.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-600">Dinheiro</p>
                <p className="text-lg font-bold text-gray-900">R$ {totais.dinheiro.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-600">Cartão</p>
                <p className="text-lg font-bold text-gray-900">R$ {totais.cartao.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-600">Total Geral</p>
                <p className="text-lg font-bold text-gray-900">R$ {totais.geral.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Lista de Comandas Anteriores */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Últimos Pedidos</h2>
            {carregando ? (
              <p className="text-center text-gray-500">Carregando...</p>
            ) : comandasAnteriores.length === 0 ? (
              <p className="text-center text-gray-500">Nenhum pedido encontrado</p>
            ) : (
              <div className="space-y-4">
                {comandasAnteriores.map((comanda) => (
                  <div key={comanda.id} className="border rounded p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">
                          Pedido #{getUltimos8Digitos(comanda.id)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{comanda.endereco}</p>
                        <p className="text-sm text-gray-600 mt-1">Bairro: {comanda.bairro}</p>
                        <div className="text-sm text-gray-600 mt-1">
                          {new Date(comanda.created_at || comanda.data).toLocaleString('pt-BR')}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {comanda.produtos.length} itens • {comanda.forma_pagamento} • R$ {comanda.total.toFixed(2)} •{' '}
                          <span className={comanda.pago ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {comanda.pago ? 'Pago' : 'Não Pago'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => reimprimirComanda(comanda)}
                          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center gap-2 text-sm"
                          title="Reimprimir comanda"
                        >
                          <Printer size={16} />
                          Reimprimir
                        </button>
                        <button
                          type="button"
                          onClick={() => excluirComanda(comanda.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-2 text-sm"
                          title="Excluir comanda"
                        >
                          <Trash2 size={16} />
                          Excluir
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExpandComanda(comanda.id!)}
                          className="text-gray-600 hover:text-gray-800"
                          title={expandedComandas[comanda.id!] ? 'Recolher itens' : 'Expandir itens'}
                        >
                          {expandedComandas[comanda.id!] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Lista de Itens (Produtos) */}
                    {expandedComandas[comanda.id!] && (
                      <div className="mt-3 border-t pt-3">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Itens do Pedido</h3>
                        <div className="space-y-2">
                          {comanda.produtos.map((produto, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm"
                            >
                              <span className="flex-1">{produto.nome}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">Qtd: ${produto.quantidade}</span>
                                <span>R$ ${(produto.valor * produto.quantidade).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}