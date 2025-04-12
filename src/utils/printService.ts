
import type { Comanda } from '../types/database';

export const getUltimos8Digitos = (id: string | undefined): string => {
  if (!id) return 'N/A';
  return id.slice(-8);
};

export const imprimirComanda = (comandaParaImprimir: Comanda): void => {
  const printWindow = window.open('', '_blank', 'width=80mm,height=auto');
  if (!printWindow) {
    alert('Não foi possível abrir a janela de impressão. Verifique as configurações do navegador.');
    return;
  }

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
