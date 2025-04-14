
interface TotaisPorFormaPagamentoProps {
  totais: {
    pix: number;
    dinheiro: number;
    cartao: number;
    geral: number;
    confirmados?: number;
    naoConfirmados?: number;
  };
}

export default function TotaisPorFormaPagamento({ totais }: TotaisPorFormaPagamentoProps) {
  // Ensure all values have defaults if undefined
  const pix = totais.pix || 0;
  const dinheiro = totais.dinheiro || 0;
  const cartao = totais.cartao || 0;
  const geral = totais.geral || 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
      <h2 className="text-lg md:text-xl font-bold mb-4">Totais por Forma de Pagamento</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-medium text-gray-600">PIX</p>
          <p className="text-lg font-bold text-gray-900">R$ {pix.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-medium text-gray-600">Dinheiro</p>
          <p className="text-lg font-bold text-gray-900">R$ {dinheiro.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-medium text-gray-600">Cartão</p>
          <p className="text-lg font-bold text-gray-900">R$ {cartao.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-medium text-gray-600">Total Geral</p>
          <p className="text-lg font-bold text-gray-900">R$ {geral.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
