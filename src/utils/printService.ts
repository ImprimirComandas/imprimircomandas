import type { Comanda } from '../types/database';
import { supabase } from '../lib/supabase';

/**
 * Gets the last 8 digits of an ID for display purposes
 */
export const getUltimos8Digitos = (id: string | undefined): string => {
  if (!id) return 'N/A';
  return id.slice(-8);
};

/**
 * Fetches store information from Supabase
 */
const fetchStoreInfo = async (): Promise<{ storeName: string; avatarUrl: string | null }> => {
  let storeName = 'Dom Luiz Bebidas';
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
    console.error('Error fetching store data for print:', error);
  }

  return { storeName, avatarUrl };
};

/**
 * Truncates product name to prevent line breaks
 */
const truncateProductName = (name: string, maxLength: number = 20): string => {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 3) + '...';
};

/**
 * Generates CSS styles for a professional fiscal receipt with original font sizes
 */
const generatePrintStyles = (): string => `
  @page {
    size: 80mm auto;
    margin: 0;
  }
  body {
    margin: 0;
    padding: 2mm;
    font-family: Arial, sans-serif;
    font-size: 16px; /* Original */
    width: 75mm;
    color: #000;
    line-height: 1.2;
  }
  .store-logo {
    width: 40mm; /* Fixed size */
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
    font-size: 16px; /* Original */
    margin-bottom: 1mm;
  }
  .header-info {
    font-size: 14px; /* Original */
  }
  .divider {
    border-top: 1px dashed #000;
    margin: 2mm 0;
  }
  .section-title {
    font-weight: bold;
    font-size: 16px; /* Original body size */
    margin-bottom: 2mm;
    text-transform: uppercase;
  }
  .customer-info div {
    margin-bottom: 1mm;
    font-size: 16px; /* Original */
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
    max-width: 45mm; /* Limits width to prevent wrapping */
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
    font-size: 16px; /* Original */
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
    font-size: 16px; /* Original */
  }
  .payment-status {
    text-align: center;
    font-weight: bold;
    font-size: 26px; /* Original */
    margin: 2mm 0;
  }
  .footer {
    text-align: center;
    font-size: 14px; /* Original footer size */
    margin-top: 2mm;
  }
  .cut-line {
    border-top: 1px dashed #000;
    margin: 2mm 0;
  }
  .cut-text {
    text-align: center;
    font-size: 10px; /* Original */
  }
`;

/**
 * Creates the logo section
 */
const createLogoSection = (avatarUrl: string | null, storeName: string): string =>
  avatarUrl ? `<img src="${avatarUrl}" alt="${storeName}" class="store-logo" />` : '';

/**
 * Creates the header section with store and order details
 */
const createHeaderSection = (storeName: string, comanda: Comanda): string => `
  <div class="header">
    <div class="header-title">${storeName}</div>
    <div class="header-info">Pedido #${getUltimos8Digitos(comanda.id)}</div>
    <div class="header-info">Data: ${new Date(comanda.data).toLocaleString('pt-BR')}</div>
  </div>
`;

/**
 * Creates the customer information section
 */
const createCustomerSection = (comanda: Comanda): string => `
  <div class="customer-info">
    <div class="section-title">Dados do Cliente</div>
    <div>Endereço: ${comanda.endereco}</div>
    <div>Bairro: ${comanda.bairro}</div>
  </div>
`;

/**
 * Creates the product list section as a table
 */
const createProductsSection = (comanda: Comanda): string => {
  const productsHtml = comanda.produtos
    .map(
      (produto) => `
        <div class="product-row">
          <div class="col-item">${truncateProductName(produto.nome)}</div>
          <div class="col-qtd">${produto.quantidade}x</div>
          <div class="col-valor">R$ ${(produto.valor * produto.quantidade).toFixed(2)}</div>
        </div>
      `
    )
    .join('');

  return `
    <div class="product-table">
      <div class="section-title">Itens</div>
      <div class="product-header">
        <div class="col-item">Item</div>
        <div class="col-qtd">Qtd</div>
        <div class="col-valor">Valor</div>
      </div>
      ${productsHtml}
    </div>
  `;
};

/**
 * Creates the totals section
 */
const createTotalsSection = (comanda: Comanda): string => `
  <div class="totals-section">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>R$ ${(comanda.total - comanda.taxaentrega).toFixed(2)}</span>
    </div>
    <div class="total-row">
      <span>Taxa de Entrega:</span>
      <span>R$ ${comanda.taxaentrega.toFixed(2)}</span>
    </div>
    <div class="total-row total">
      <span>Total:</span>
      <span>R$ ${comanda.total.toFixed(2)}</span>
    </div>
  </div>
`;

/**
 * Creates the payment details section, including troco and mixed payments
 */
const createPaymentSection = (comanda: Comanda): string => {
  let paymentDetails = `<div>Forma de Pagamento: ${comanda.forma_pagamento.toUpperCase()}</div>`;

  if (comanda.forma_pagamento === 'misto') {
    paymentDetails += `
      ${comanda.valor_cartao ? `<div>Cartão: R$ ${comanda.valor_cartao.toFixed(2)}</div>` : ''}
      ${comanda.valor_dinheiro ? `<div>Dinheiro: R$ ${comanda.valor_dinheiro.toFixed(2)}</div>` : ''}
      ${comanda.valor_pix ? `<div>PIX: R$ ${comanda.valor_pix.toFixed(2)}</div>` : ''}
    `;
  }

  if (comanda.quantiapaga && comanda.troco && comanda.quantiapaga > 0) {
    paymentDetails += `
      <div>Troco para: R$ ${comanda.quantiapaga.toFixed(2)}</div>
      <div>Valor do troco: R$ ${comanda.troco.toFixed(2)}</div>
    `;
  }

  return `
    <div class="payment-section">
      <div class="section-title">Pagamento</div>
      ${paymentDetails}
    </div>
    <div class="divider"></div>
    <div class="payment-status">${comanda.pago ? 'PAGO' : 'NÃO PAGO'}</div>
  `;
};

/**
 * Creates the footer section
 */
const createFooterSection = (): string => `
  <div class="footer">
    <div>Deus é fiel.</div>
  </div>
`;

/**
 * Creates the auto-print script
 */
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

/**
 * Assembles the complete HTML content for the fiscal receipt
 */
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
      <title>Cupom Fiscal</title>
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

/**
 * Opens the print window and writes content
 */
const openPrintWindow = (printContent: string): Window | null => {
  const printWindow = window.open('', '_blank', 'width=300,height=auto');
  if (!printWindow) {
    alert('Não foi possível abrir a janela de impressão. Verifique as configurações do navegador.');
    return null;
  }
  printWindow.document.write(printContent);
  printWindow.document.close();
  return printWindow;
};

/**
 * Main function to print a professional fiscal receipt
 */
export const imprimirComanda = async (comanda: Comanda): Promise<void> => {
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
};