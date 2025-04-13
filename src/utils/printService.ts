
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
      
      if (data?.store_name) {
        storeName = data.store_name;
      }
      
      if (data?.avatar_url) {
        avatarUrl = data.avatar_url;
      }
    }
  } catch (error) {
    console.error('Error fetching store data for print:', error);
  }
  
  return { storeName, avatarUrl };
};

/**
 * Generates CSS styles for the print window
 */
const generatePrintStyles = (): string => {
  return `
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
    .store-logo {
      max-width: 60mm;
      max-height: 20mm;
      margin: 0 auto 2mm;
      display: block;
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
      font-weight: bold;
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
    .pagamento-misto {
      margin: 2mm 0;
    }
    .pagamento-misto div {
      margin-bottom: 1mm;
    }
  `;
};

/**
 * Generates the logo section of the receipt
 */
const createLogoSection = (avatarUrl: string | null, storeName: string): string => {
  return avatarUrl ? `
    <img src="${avatarUrl}" alt="${storeName}" class="store-logo" />
  ` : '';
};

/**
 * Generates the header section of the receipt
 */
const createHeaderSection = (storeName: string, comandaId: string | undefined): string => {
  return `
    <div class="header">${storeName}</div>
    <div class="order-id">Pedido #${getUltimos8Digitos(comandaId)}</div>
  `;
};

/**
 * Generates the order information section
 */
const createInfoSection = (comanda: Comanda): string => {
  return `
    <div class="info-section">
      <div><strong>Forma de pagamento:</strong> ${comanda.forma_pagamento.toUpperCase()}</div>
      <div><strong>Endereço:</strong> ${comanda.endereco}</div>
      <div><strong>Bairro:</strong> ${comanda.bairro}</div>
      <div><strong>Data:</strong> ${new Date(comanda.data).toLocaleString('pt-BR')}</div>
    </div>
  `;
};

/**
 * Generates the mixed payment section if applicable
 */
const createPagamentoMistoSection = (comanda: Comanda): string => {
  if (comanda.forma_pagamento !== 'misto') return '';
  
  return `
    <div class="pagamento-misto">
      ${comanda.valor_cartao ? `<div>Valor no Cartão: R$ ${comanda.valor_cartao.toFixed(2)}</div>` : ''}
      ${comanda.valor_dinheiro ? `<div>Valor em Dinheiro: R$ ${comanda.valor_dinheiro.toFixed(2)}</div>` : ''}
      ${comanda.valor_pix ? `<div>Valor no PIX: R$ ${comanda.valor_pix.toFixed(2)}</div>` : ''}
    </div>
  `;
};

/**
 * Generates the change information section if applicable
 */
const createTrocoSection = (comanda: Comanda): string => {
  if (!comanda.quantiapaga || !comanda.troco || comanda.quantiapaga <= 0) return '';
  
  return `
    <div>Troco para: R$ ${comanda.quantiapaga.toFixed(2)}</div>
    <div>Valor do troco: R$ ${comanda.troco.toFixed(2)}</div>
  </div>
  `;
};

/**
 * Generates the product list section
 */
const createProdutosSection = (comanda: Comanda): string => {
  const produtosHtml = comanda.produtos
    .map(
      (produto) => `
        <div class="produto-row">
          <div class="produto-nome">${produto.nome}</div>
          <div class="produto-qtd">${produto.quantidade}x</div>
          <div class="produto-valor">R$ ${(produto.valor * produto.quantidade).toFixed(2)}</div>
        </div>
      `
    )
    .join('');

  return `
    <div style="margin-bottom: 3mm;">
      ${produtosHtml}
    </div>  <div class="divider"></div><div class="troco-section"><div class="taxa">Taxa de entrega: R$ ${comanda.taxaentrega.toFixed(2)}</div>
  `;
};

/**
 * Generates the totals section
 */
const createTotalsSection = (comanda: Comanda): string => {
  return `
    <div class="totals-section">
        <div class="total">Total: R$ ${comanda.total.toFixed(2)}</div>
    </div>
  `;
};

/**
 * Generates the footer section
 */
const createFooterSection = (comanda: Comanda): string => {
  return `
    <div class="footer">
      <div class="status-pago">${comanda.pago ? 'PAGO' : 'NÃO PAGO'}</div>
    </div>
  `;
};

/**
 * Creates automatic print functionality script
 */
const createPrintScript = (): string => {
  return `
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
};

/**
 * Assembles the complete HTML content for printing
 */
const assembleHtmlContent = (
  styles: string,
  logoSection: string,
  headerSection: string,
  infoSection: string,
  pagamentoMistoSection: string,
  produtosSection: string,
  totalsSection: string,
  trocoSection: string,
  footerSection: string,
  printScript: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Delivery</title>
        <style>${styles}</style>
      </head>
      <body>
        <!-- Logo (se disponível) -->
        ${logoSection}
        
        <!-- Cabeçalho -->
        ${headerSection}
        <div class="cut-line"></div>

        <!-- Informações do Pedido -->
        ${infoSection}

        <!-- Informações de Pagamento Misto (se aplicável) -->
        ${pagamentoMistoSection}

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
        ${printScript}
      </body>
    </html>
  `;
};

/**
 * Opens the print window and writes the content
 */
const openPrintWindow = (printContent: string): Window | null => {
  const printWindow = window.open('', '_blank', 'width=80mm,height=auto');
  if (!printWindow) {
    alert('Não foi possível abrir a janela de impressão. Verifique as configurações do navegador.');
    return null;
  }
  
  printWindow.document.write(printContent);
  printWindow.document.close();
  return printWindow;
};

/**
 * Main function to print a comanda
 */
export const imprimirComanda = async (comandaParaImprimir: Comanda): Promise<void> => {
  // Fetch store information
  const { storeName, avatarUrl } = await fetchStoreInfo();
  
  // Generate all sections
  const styles = generatePrintStyles();
  const logoSection = createLogoSection(avatarUrl, storeName);
  const headerSection = createHeaderSection(storeName, comandaParaImprimir.id);
  const infoSection = createInfoSection(comandaParaImprimir);
  const pagamentoMistoSection = createPagamentoMistoSection(comandaParaImprimir);
  const produtosSection = createProdutosSection(comandaParaImprimir);
  const totalsSection = createTotalsSection(comandaParaImprimir);
  const trocoSection = createTrocoSection(comandaParaImprimir);
  const footerSection = createFooterSection(comandaParaImprimir);
  const printScript = createPrintScript();
  
  // Assemble the HTML content
  const printContent = assembleHtmlContent(
    styles,
    logoSection,
    headerSection,
    infoSection,
    pagamentoMistoSection,
    produtosSection,
    totalsSection,
    trocoSection,
    footerSection,
    printScript
  );
  
  // Open the print window and write the content
  openPrintWindow(printContent);
};
