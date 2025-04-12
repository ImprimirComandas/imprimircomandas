
import type { Comanda } from '../types/database';

export const getUltimos8Digitos = (id: string | undefined): string => {
  if (!id) return 'N/A';
  return id.slice(-8);
};

// Helper functions for creating the print content
const createStyles = (): string => {
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

const createHeaderSection = (comanda: Comanda): string => {
  return `
    <div class="header">Delivery</div>
    <div class="order-id">Pedido #${getUltimos8Digitos(comanda.id)}</div>
  `;
};

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

const createTrocoSection = (comanda: Comanda): string => {
  if (!comanda.quantiapaga || !comanda.troco || comanda.quantiapaga <= 0) return '';
  
  return `
    <div>Troco para: R$ ${comanda.quantiapaga.toFixed(2)}</div>
    <div>Valor do troco: R$ ${comanda.troco.toFixed(2)}</div>
  </div>
  `;
};

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
    </div>  
    <div class="divider"></div>
    <div class="troco-section">
      <div class="taxa">Taxa de entrega: R$ ${comanda.taxaentrega.toFixed(2)}</div>
  `;
};

const createTotalsSection = (comanda: Comanda): string => {
  return `
    <div class="totals-section">
        <div class="total">Total: R$ ${comanda.total.toFixed(2)}</div>
    </div>
  `;
};

const createFooterSection = (comanda: Comanda): string => {
  return `
    <div class="footer">
      <div class="status-pago">${comanda.pago ? 'PAGO' : 'NÃO PAGO'}</div>
    </div>
  `;
};

const createPrintContent = (comanda: Comanda): string => {
  const styles = createStyles();
  const headerSection = createHeaderSection(comanda);
  const infoSection = createInfoSection(comanda);
  const pagamentoMistoSection = createPagamentoMistoSection(comanda);
  const produtosSection = createProdutosSection(comanda);
  const totalsSection = createTotalsSection(comanda);
  const trocoSection = createTrocoSection(comanda);
  const footerSection = createFooterSection(comanda);

  return `
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

        <!-- Informações de Pagamento Misto (se aplicável) -->
        ${pagamentoMistoSection}

        <!-- Divisor -->
        <div class="divider"></div>

        <!-- Lista de Produtos -->
        ${produtosSection}

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
};

// Opens the print window and handles printing
const openPrintWindow = (content: string): void => {
  const printWindow = window.open('', '_blank', 'width=80mm,height=auto');
  if (!printWindow) {
    alert('Não foi possível abrir a janela de impressão. Verifique as configurações do navegador.');
    return;
  }

  printWindow.document.write(content);
  printWindow.document.close();
};

export const imprimirComanda = (comandaParaImprimir: Comanda): void => {
  // Generate the print content
  const printContent = createPrintContent(comandaParaImprimir);
  
  // Open the print window and handle printing
  openPrintWindow(printContent);
};
