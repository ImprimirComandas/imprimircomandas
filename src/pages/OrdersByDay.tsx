import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { format, parseISO, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { Search, X, CheckCircle, XCircle, ChevronLeft, ChevronRight, Edit2, Save, Trash2, Plus, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import type { Comanda, Produto } from '../types/database';

// Interface for filtered products in search
interface ProdutoFiltrado {
  id: string;
  nome: string;
  valor: number;
  numero?: number;
}

// Printing Functions
const getUltimos8Digitos = (id: string | undefined): string => {
  if (!id) return 'N/A';
  return id.slice(-8);
};

const fetchStoreInfo = async (): Promise<{ storeName: string; avatarUrl: string | null }> => {
  let storeName = 'Loja Padrão';
  let avatarUrl = null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('profiles')
        .select('store_name, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (data?.store_name) storeName = data.store_name;
      if (data?.avatar_url) avatarUrl = data.avatar_url;
    }
  } catch (error) {
    console.error('Erro ao buscar dados da loja para impressão:', error);
  }

  return { storeName, avatarUrl };
};

const truncateProductName = (name: string, maxLength: number = 20): string => {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 3) + '...';
};

const generatePrintStyles = (): string => `
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
    line-height: 1.2;
  }
  .store-logo {
    width: 40mm;
    height: 40mm;
    margin: 0 auto 2mm;
    display: block;
    object-fit: contain;
  }
  .header {
    text-align: center;
    margin-bottom: 2mm;
  }
  .header-title {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 1mm;
  }
  .header-info {
    font-size: 14px;
  }
  .divider {
    border-top: 1px dashed #000;
    margin: 2mm 0;
  }
  .section-title {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 2mm;
    text-transform: uppercase;
  }
  .customer-info div {
    margin-bottom: 1mm;
    font-size: 16px;
  }
  .product-table {
    margin-bottom: 2mm;
  }
  .product-header {
    display: flex;
    font-weight: bold;
    border-bottom: 1px solid #000;
    padding-bottom: 1mm;
    margin-bottom: 2mm;
  }
  .product-row {
    display: flex;
    margin-bottom: 1mm;
  }
  .col-item {
    flex: 2.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 45mm;
  }
  .col-qtd {
    flex: 0.8;
    text-align: center;
  }
  .col-valor {
    flex: 1.2;
    text-align: right;
    font-weight: bold;
  }
  .totals-section {
    margin: 2mm 0;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1mm;
    font-size: 16px;
  }
  .total-row.total {
    font-weight: bold;
    font-size: 16px;
    border-top: 1px solid #000;
    padding-top: 2mm;
  }
  .payment-section {
    margin-bottom: 2mm;
  }
  .payment-section div {
    margin-bottom: 1mm;
    font-size: 16px;
  }
  .payment-status {
    text-align: center;
    font-weight: bold;
    font-size: 26px;
    margin: 2mm 0;
  }
  .footer {
    text-align: center;
    font-size: 14px;
    margin-top: 2mm;
  }
  .cut-line {
    border-top: 1px dashed #000;
    margin: 2mm 0;
  }
  .cut-text {
    text-align: center;
    font-size: 10px;
  }
`;

const createLogoSection = (avatarUrl: string | null, storeName: string): string =>
  avatarUrl ? `<img src="${avatarUrl}" alt="${storeName}" class="store-logo" />` : '';

const createHeaderSection = (storeName: string, comanda: Comanda): string => `
  <div class="header">
    <div class="header-title">${storeName}</div>
    <div class="header-info">Pedido #${getUltimos8Digitos(comanda.id)}</div>
    <div class="header-info">Data: ${format(parseISO(comanda.created_at || new Date().toISOString()), 'dd/MM/yyyy HH:mm')}</div>
  </div>
`;

const createCustomerSection = (comanda: Comanda): string => `
  <div class="customer-info">
    <div>Endereço: ${comanda.endereco || 'Não especificado'}</div>
    <div>Bairro: ${comanda.bairro || 'Não especificado'}</div>
  </div>
`;

const createProductsSection = (comanda: Comanda): string => {
  const productsHtml = comanda.produtos
    .map(
      (produto) => `
        <div class="product-row">
          <div class="col-qtd">${produto.quantidade || 1}</div>
          <div class="col-item">${truncateProductName(produto.nome || 'Produto desconhecido')}</div>
          <div class="col-valor">R$ ${((produto.valor || 0) * (produto.quantidade || 1)).toFixed(2)}</div>
        </div>
      `
    )
    .join('');

  return `
    <div class="product-table">
      ${productsHtml}
    </div>
  `;
};

const createTotalsSection = (comanda: Comanda): string => {
  const subtotal = comanda.produtos.reduce((sum, produto) => sum + ((produto.valor || 0) * (produto.quantidade || 1)), 0);

  return `
    <div class="totals-section">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>R$ ${subtotal.toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span>Taxa de Entrega:</span>
        <span>R$ ${(comanda.taxaentrega || 0).toFixed(2)}</span>
      </div>
      <div class="total-row total">
        <span>Total:</span>
        <span>R$ ${(comanda.total || 0).toFixed(2)}</span>
      </div>
    </div>
  `;
};

const createPaymentSection = (comanda: Comanda): string => {
  let paymentDetails = `<div>Forma de Pagamento: ${(comanda.forma_pagamento || 'Não especificado').toUpperCase()}</div>`;

  if (comanda.forma_pagamento === 'misto') {
    paymentDetails += `
      ${comanda.valor_cartao > 0 ? `<div>Cartão: R$ ${comanda.valor_cartao.toFixed(2)}</div>` : ''}
      ${comanda.valor_dinheiro > 0 ? `<div>Dinheiro: R$ ${comanda.valor_dinheiro.toFixed(2)}</div>` : ''}
      ${comanda.valor_pix > 0 ? `<div>PIX: R$ ${comanda.valor_pix.toFixed(2)}</div>` : ''}
    `;
  }

  if ((comanda.forma_pagamento === 'dinheiro' || comanda.forma_pagamento === 'misto') && comanda.quantiapaga && comanda.quantiapaga > 0) {
    paymentDetails += `
      <div>Troco para: R$ ${comanda.quantiapaga.toFixed(2)}</div>
      <div>Troco: R$ ${(comanda.troco || 0).toFixed(2)}</div>
    `;
  }

  return `
    <div class="payment-section">
      ${paymentDetails}
    </div>
    <div class="divider"></div>
    <div class="payment-status">${comanda.pago ? 'PAGO' : 'NÃO PAGO'}</div>
  `;
};

const createFooterSection = (): string => `
  <div class="footer">
    <div>Deus é fiel.</div>
  </div>
`;

const createPrintScript = (): string => `
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
`;

const assembleHtmlContent = (
  styles: string,
  logoSection: string,
  headerSection: string,
  customerSection: string,
  productsSection: string,
  totalsSection: string,
  paymentSection: string,
  footerSection: string,
  printScript: string
): string => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Comanda</title>
      <style>${styles}</style>
    </head>
    <body>
      ${logoSection}
      ${headerSection}
      <div class="divider"></div>
      ${customerSection}
      <div class="divider"></div>
      ${productsSection}
      ${totalsSection}
      <div class="divider"></div>
      ${paymentSection}
      <div class="divider"></div>
      ${footerSection}
      ${printScript}
    </body>
  </html>
`;

const openPrintWindow = (printContent: string): Window | null => {
  const printWindow = window.open('', '_blank', 'width=300,height=auto');
  if (!printWindow) {
    toast.error('Não foi possível abrir a janela de impressão. Verifique as configurações do navegador.');
    return null;
  }
  printWindow.document.write(printContent);
  printWindow.document.close();
  return printWindow;
};

const imprimirComanda = async (comanda: Comanda): Promise<void> => {
  try {
    const { storeName, avatarUrl } = await fetchStoreInfo();
    const styles = generatePrintStyles();
    const logoSection = createLogoSection(avatarUrl, storeName);
    const headerSection = createHeaderSection(storeName, comanda);
    const customerSection = createCustomerSection(comanda);
    const productsSection = createProductsSection(comanda);
    const totalsSection = createTotalsSection(comanda);
    const paymentSection = createPaymentSection(comanda);
    const footerSection = createFooterSection();
    const printScript = createPrintScript();

    const printContent = assembleHtmlContent(
      styles,
      logoSection,
      headerSection,
      customerSection,
      productsSection,
      totalsSection,
      paymentSection,
      footerSection,
      printScript
    );

    openPrintWindow(printContent);
  } catch (error: any) {
    console.error('Erro ao imprimir comanda:', error);
    toast.error(`Erro ao imprimir comanda: ${error.message || 'Erro desconhecido'}`);
  }
};

// OrderCard Component
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
  const [editedProdutos, setEditedProdutos] = useState<Produto[]>([]);
  const [editedFormaPagamento, setEditedFormaPagamento] = useState(comanda.forma_pagamento || '');
  const [editedPago, setEditedPago] = useState(comanda.pago || false);
  const [editedTroco, setEditedTroco] = useState(comanda.troco || 0);
  const [editedQuantiapaga, setEditedQuantiapaga] = useState(comanda.quantiapaga || 0);
  const [editedValorCartao, setEditedValorCartao] = useState(comanda.valor_cartao || 0);
  const [editedValorDinheiro, setEditedValorDinheiro] = useState(comanda.valor_dinheiro || 0);
  const [editedValorPix, setEditedValorPix] = useState(comanda.valor_pix || 0);
  const [editedBairro, setEditedBairro] = useState(comanda.bairro || '');
  const [editedTaxaEntrega, setEditedTaxaEntrega] = useState(comanda.taxaentrega || 0);
  const [editedEndereco, setEditedEndereco] = useState(comanda.endereco || '');
  const [pesquisaProduto, setPesquisaProduto] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState<ProdutoFiltrado[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const getProdutos = (): Produto[] => {
    try {
      if (Array.isArray(comanda.produtos)) {
        return comanda.produtos.map(p => ({
          nome: p.nome || 'Produto desconhecido',
          quantidade: p.quantidade || 1,
          valor: p.valor || 0,
        }));
      }
      if (typeof comanda.produtos === 'string') {
        const parsed = JSON.parse(comanda.produtos);
        return Array.isArray(parsed)
          ? parsed.map(p => ({
              nome: p.nome || 'Produto desconhecido',
              quantidade: p.quantidade || 1,
              valor: p.valor || 0,
            }))
          : [];
      }
      return [];
    } catch (error) {
      console.error('Erro ao processar produtos:', error);
      return [];
    }
  };

  const produtos = getProdutos();

  useEffect(() => {
    if (isEditing) {
      setEditedProdutos(produtos);
      setEditedFormaPagamento(comanda.forma_pagamento || '');
      setEditedPago(comanda.pago || false);
      setEditedTroco(comanda.troco || 0);
      setEditedQuantiapaga(comanda.quantiapaga || 0);
      setEditedValorCartao(comanda.valor_cartao || 0);
      setEditedValorDinheiro(comanda.valor_dinheiro || 0);
      setEditedValorPix(comanda.valor_pix || 0);
      setEditedBairro(comanda.bairro || '');
      setEditedTaxaEntrega(comanda.taxaentrega || 0);
      setEditedEndereco(comanda.endereco || '');
    }
  }, [isEditing, comanda]);

  const searchProdutos = useCallback(
    debounce(async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setProdutosFiltrados([]);
        return;
      }
      setLoadingProdutos(true);
      try {
        const trimmedTerm = searchTerm.trim();
        const { data, error } = await supabase
          .rpc('search_produtos_by_name_or_number', { search_term: trimmedTerm });
        if (error) throw new Error(`Erro na busca de produtos: ${error.message}`);
        setProdutosFiltrados(data || []);
      } catch (error: any) {
        console.error('Erro ao buscar produtos:', error);
        toast.error(`Erro ao buscar produtos: ${error.message}`);
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
    setEditedProdutos([...editedProdutos, { nome: produto.nome, quantidade: 1, valor: produto.valor }]);
    setPesquisaProduto('');
    setProdutosFiltrados([]);
    if (searchInputRef.current) searchInputRef.current.blur();
  };

  const handleProdutoChange = (index: number, field: keyof Produto, value: string | number) => {
    const updatedProdutos = [...editedProdutos];
    updatedProdutos[index] = { ...updatedProdutos[index], [field]: value };
    setEditedProdutos(updatedProdutos);
  };

  const addProduto = () => {
    setEditedProdutos([...editedProdutos, { nome: '', quantidade: 1, valor: 0 }]);
  };

  const removeProduto = (index: number) => {
    setEditedProdutos(editedProdutos.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return editedProdutos.reduce((sum, produto) => sum + (produto.valor * produto.quantidade), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + editedTaxaEntrega;
  };

  const handleSave = () => {
    // Input validations
    if (editedProdutos.length === 0 || editedProdutos.some(p => !p.nome || p.quantidade <= 0 || p.valor < 0)) {
      toast.error('Preencha todos os campos dos produtos corretamente');
      return;
    }
    if (!editedBairro) {
      toast.error('Selecione um bairro');
      return;
    }
    if (!editedEndereco) {
      toast.error('Informe o endereço');
      return;
    }
    if (!editedFormaPagamento) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }

    const totalComTaxa = calculateTotal();

    // Validate quantiapaga and troco
    if (editedFormaPagamento === 'dinheiro' || editedFormaPagamento === 'misto') {
      if (editedQuantiapaga < totalComTaxa) {
        toast.error('A quantia paga deve ser maior ou igual ao total do pedido');
        return;
      }
      const calculatedTroco = editedQuantiapaga - totalComTaxa;
      if (calculatedTroco < 0) {
        toast.error('O troco não pode ser negativo');
        return;
      }
      setEditedTroco(calculatedTroco);
    } else {
      setEditedQuantiapaga(0);
      setEditedTroco(0);
    }

    // Validate mixed payment
    if (editedFormaPagamento === 'misto') {
      const totalMisto = editedValorCartao + editedValorDinheiro + editedValorPix;
      if (totalMisto < totalComTaxa) {
        toast.error('A soma dos valores do pagamento misto deve cobrir o total do pedido');
        return;
      }
    }

    const updatedComanda: Partial<Comanda> = {
      produtos: editedProdutos,
      forma_pagamento: editedFormaPagamento,
      pago: editedPago,
      total: totalComTaxa,
      troco: editedFormaPagamento === 'dinheiro' || editedFormaPagamento === 'misto' ? editedTroco : 0,
      quantiapaga: editedFormaPagamento === 'dinheiro' || editedFormaPagamento === 'misto' ? editedQuantiapaga : 0,
      valor_cartao: editedFormaPagamento === 'misto' ? editedValorCartao : 0,
      valor_dinheiro: editedFormaPagamento === 'misto' ? editedValorDinheiro : 0,
      valor_pix: editedFormaPagamento === 'misto' ? editedValorPix : 0,
      bairro: editedBairro,
      taxaentrega: editedTaxaEntrega,
      endereco: editedEndereco,
    };

    console.log('Salvando comanda atualizada:', updatedComanda);

    onSaveEdit(comanda.id!, updatedComanda);
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
            {comanda.created_at ? format(parseISO(comanda.created_at), 'dd/MM/yyyy HH:mm') : 'Data indisponível'}
          </p>
          <p className="text-sm text-gray-500">Bairro: {comanda.bairro || 'Não especificado'}</p>
          <p className="text-sm text-gray-500">Endereço: {comanda.endereco || 'Não especificado'}</p>
          <p className="text-sm text-gray-500">Total: R$ {(comanda.total || 0).toFixed(2)}</p>
          {(comanda.forma_pagamento === 'dinheiro' || comanda.forma_pagamento === 'misto') && comanda.quantiapaga > 0 && (
            <>
              <p className="text-sm text-gray-500">Quantia Paga: R$ {(comanda.quantiapaga || 0).toFixed(2)}</p>
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
                  {/* Product Search */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">Buscar Produto</label>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={pesquisaProduto}
                      onChange={handlePesquisaProdutoChange}
                      placeholder="Digite o nome ou número do produto"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                  {/* Product List */}
                  {editedProdutos.map((produto, index) => (
                    <div key={index} className="flex items-center gap-3 border-b pb-2">
                      <input
                        type="text"
                        value={produto.nome}
                        onChange={(e) => handleProdutoChange(index, 'nome', e.target.value)}
                        placeholder="Nome do produto"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={produto.quantidade}
                        onChange={(e) => handleProdutoChange(index, 'quantidade', parseInt(e.target.value) || 1)}
                        placeholder="Qtd"
                        min="1"
                        className="w-20 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={produto.valor}
                        onChange={(e) => handleProdutoChange(index, 'valor', parseFloat(e.target.value) || 0)}
                        placeholder="Valor"
                        step="0.01"
                        min="0"
                        className="w-24 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeProduto(index)}
                        className="text-red-600 hover:text-red-800"
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

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço</label>
                    <input
                      type="text"
                      value={editedEndereco}
                      onChange={(e) => setEditedEndereco(e.target.value)}
                      placeholder="Endereço de entrega"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Neighborhood */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bairro</label>
                    <input
                      type="text"
                      value={editedBairro}
                      onChange={(e) => setEditedBairro(e.target.value)}
                      placeholder="Bairro"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Delivery Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Taxa de Entrega</label>
                    <input
                      type="number"
                      value={editedTaxaEntrega}
                      onChange={(e) => setEditedTaxaEntrega(parseFloat(e.target.value) || 0)}
                      placeholder="Taxa de entrega"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
                    <select
                      value={editedFormaPagamento}
                      onChange={(e) => {
                        setEditedFormaPagamento(e.target.value);
                        if (e.target.value !== 'dinheiro' && e.target.value !== 'misto') {
                          setEditedQuantiapaga(0);
                          setEditedTroco(0);
                          setEditedValorCartao(0);
                          setEditedValorDinheiro(0);
                          setEditedValorPix(0);
                        }
                      }}
                      className="mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    >
                      <option value="">Selecione</option>
                      <option value="pix">Pix</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao">Cartão</option>
                      <option value="misto">Misto</option>
                    </select>
                  </div>

                  {/* Mixed Payment Fields */}
                  {editedFormaPagamento === 'misto' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Valor em Cartão</label>
                        <input
                          type="number"
                          value={editedValorCartao}
                          onChange={(e) => setEditedValorCartao(parseFloat(e.target.value) || 0)}
                          placeholder="Valor em cartão"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Valor em Dinheiro</label>
                        <input
                          type="number"
                          value={editedValorDinheiro}
                          onChange={(e) => setEditedValorDinheiro(parseFloat(e.target.value) || 0)}
                          placeholder="Valor em dinheiro"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Valor em Pix</label>
                        <input
                          type="number"
                          value={editedValorPix}
                          onChange={(e) => setEditedValorPix(parseFloat(e.target.value) || 0)}
                          placeholder="Valor em pix"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}

                  {/* Quantia Paga and Troco */}
                  {(editedFormaPagamento === 'dinheiro' || editedFormaPagamento === 'misto') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantia Paga (R$)</label>
                        <input
                          type="number"
                          value={editedQuantiapaga}
                          onChange={(e) => {
                            const quantiapaga = parseFloat(e.target.value) || 0;
                            setEditedQuantiapaga(quantiapaga);
                            const totalComTaxa = calculateTotal();
                            setEditedTroco(quantiapaga >= totalComTaxa ? quantiapaga - totalComTaxa : 0);
                          }}
                          placeholder="Quantia paga pelo cliente"
                          step="0.01"
                          min={calculateTotal()}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Troco (R$)</label>
                        <input
                          type="number"
                          value={editedTroco}
                          readOnly
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-100"
                        />
                      </div>
                    </>
                  )}

                  {/* Payment Status */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedPago}
                      onChange={(e) => setEditedPago(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">Pago</label>
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
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                    >
                      <Save size={18} />
                      Salvar
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {produtos.length > 0 ? (
                    produtos.map((produto: Produto, index: number) => (
                      <div key={index} className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>
                          {(produto.nome || 'Produto desconhecido')} (x{(produto.quantidade || 1)})
                        </span>
                        <span>R$ {((produto.valor || 0) * (produto.quantidade || 1)).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum produto registrado</p>
                  )}
                  <div className="mt-3 text-sm text-gray-600">
                    Subtotal: R$ {produtos.reduce((sum, p) => sum + (p.valor * p.quantidade), 0).toFixed(2)}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    Taxa de Entrega: R$ {(comanda.taxaentrega || 0).toFixed(2)}
                  </div>
                  <div className="mt-3 font-bold text-gray-800 text-lg">
                    Total: R$ {(comanda.total || 0).toFixed(2)}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Pagamento: {(comanda.forma_pagamento || 'Não especificado').charAt(0).toUpperCase() + (comanda.forma_pagamento || '').slice(1)}
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
                        Quantia Paga: R$ {(comanda.quantiapaga || 0).toFixed(2)}
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
                      } text-white transition-colors duration-200`}
                    >
                      {comanda.pago ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      {comanda.pago ? 'Desmarcar' : 'Confirmar'}
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200"
                    >
                      <Edit2 size={18} />
                      Editar
                    </button>
                    <button
                      onClick={() => onReprint(comanda)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                    >
                      <Printer size={18} />
                      Reimprimir
                    </button>
                    <button
                      onClick={() => onDelete(comanda.id!)}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200"
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

// Main OrdersByDay Component
export default function OrdersByDay() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [loading, setLoading] = useState(false);

  const fetchOrdersByDate = async (date: Date) => {
    setLoading(true);
    try {
      const start = startOfDay(date).toISOString();
      const end = endOfDay(date).toISOString();
      const { data, error } = await supabase
        .from('comandas')
        .select('id, created_at, user_id, produtos, total, forma_pagamento, pago, troco, quantiapaga, valor_cartao, valor_dinheiro, valor_pix, bairro, taxaentrega, endereco')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Erro ao carregar pedidos: ${error.message}`);

      console.log('Pedidos carregados:', data);
      setComandas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error(error.message || 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersByDate(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
    }
  };

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
    setSelectedDate(newDate);
  };

  const togglePayment = async (comanda: Comanda) => {
    try {
      const { error } = await supabase
        .from('comandas')
        .update({ pago: !comanda.pago })
        .eq('id', comanda.id);

      if (error) throw new Error(`Erro ao atualizar pagamento: ${error.message}`);

      fetchOrdersByDate(selectedDate);
      toast.success(`Pagamento ${!comanda.pago ? 'confirmado' : 'desmarcado'}!`);
    } catch (error: any) {
      console.error('Erro ao atualizar pagamento:', error);
      toast.error(error.message || 'Erro ao atualizar pagamento');
    }
  };

  const reprintOrder = async (comanda: Comanda) => {
    try {
      const totalComTaxa = comanda.total || 0;
      const quantiapaga = comanda.quantiapaga || 0;
      const troco = comanda.troco || 0;
      const valorEntrega = comanda.forma_pagamento === 'dinheiro' && troco > 0 && quantiapaga >= totalComTaxa
        ? quantiapaga
        : totalComTaxa;

      const formattedComanda: Comanda = {
        id: comanda.id,
        created_at: comanda.created_at,
        user_id: comanda.user_id,
        produtos: comanda.produtos.map(p => ({
          nome: p.nome || 'Produto desconhecido',
          quantidade: p.quantidade || 1,
          valor: p.valor || 0,
        })),
        total: totalComTaxa,
        forma_pagamento: comanda.forma_pagamento || 'Não especificado',
        pago: comanda.pago || false,
        troco: troco,
        quantiapaga: quantiapaga,
        valor_cartao: comanda.valor_cartao || 0,
        valor_dinheiro: comanda.valor_dinheiro || 0,
        valor_pix: comanda.valor_pix || 0,
        bairro: comanda.bairro || 'Não especificado',
        taxaentrega: comanda.taxaentrega || 0,
        endereco: comanda.endereco || 'Não especificado',
      };

      console.log('Comanda formatada para impressão:', formattedComanda);

      await imprimirComanda(formattedComanda);
      toast.success('Comanda enviada para impressão');
    } catch (error: any) {
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

      fetchOrdersByDate(selectedDate);
      toast.success('Pedido excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir pedido:', error);
      toast.error(error.message || 'Erro ao excluir pedido');
    }
  };

  const saveEdit = async (id: string, updatedComanda: Partial<Comanda>) => {
    try {
      const { error } = await supabase
        .from('comandas')
        .update(updatedComanda)
        .eq('id', id);

      if (error) throw new Error(`Erro ao salvar alterações: ${error.message}`);

      fetchOrdersByDate(selectedDate);
      toast.success('Comanda atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar alterações:', error);
      toast.error(error.message || 'Erro ao salvar alterações');
    }
  };

  const filteredComandas = useMemo(() => {
    return comandas.filter(comanda => {
      const matchesSearch = searchTerm
        ? getUltimos8Digitos(comanda.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
          (comanda.produtos || []).some((p: { nome: string }) =>
            (p.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
        : true;

      const matchesStatus =
        filterStatus === 'all' ? true : filterStatus === 'paid' ? comanda.pago : !comanda.pago;

      return matchesSearch && matchesStatus;
    });
  }, [comandas, searchTerm, filterStatus]);

  const totais = useMemo(() => {
    const result = {
      pix: 0,
      dinheiro: 0,
      cartao: 0,
      misto: 0,
      geral: 0,
      confirmados: 0,
      naoConfirmados: 0,
    };
    filteredComandas.forEach(comanda => {
      const valor = comanda.forma_pagamento === 'dinheiro' && comanda.troco && comanda.troco > 0 && comanda.quantiapaga
        ? comanda.quantiapaga
        : comanda.total || 0;
      if (comanda.pago) result.confirmados += valor;
      else result.naoConfirmados += valor;
      result.geral += valor;
      if (comanda.forma_pagamento === 'pix') result.pix += valor;
      else if (comanda.forma_pagamento === 'dinheiro') result.dinheiro += valor;
      else if (comanda.forma_pagamento === 'cartao') result.cartao += valor;
      else if (comanda.forma_pagamento === 'misto') result.misto += valor;
    });
    return result;
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
            Gerencie seus pedidos diários de forma simples e eficiente
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => changeDate('prev')}
                className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                aria-label="Dia anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={() => changeDate('next')}
                className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                aria-label="Próximo dia"
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
                className="w-full sm:w-64 pl-10 pr-10 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors duration-200`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'paid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors duration-200`}
            >
              Pagos
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors duration-200`}
            >
              Pendentes
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-sm font-medium">Pagos</p>
            <p className="text-2xl font-bold">R$ {totais.confirmados.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-sm font-medium">Pendentes</p>
            <p className="text-2xl font-bold">R$ {totais.naoConfirmados.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-sm font-medium">Total</p>
            <p className="text-2xl font-bold">R$ {totais.geral.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-sm font-medium">Pedidos</p>
            <p className="text-2xl font-bold">{filteredComandas.length}</p>
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
                Nenhum pedido encontrado para esta data.
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