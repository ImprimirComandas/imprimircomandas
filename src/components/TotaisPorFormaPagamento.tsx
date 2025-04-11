
interface TotaisPorFormaPagamentoProps {
  totais: {
    pix: number;
    dinheiro: number;
    cartao: number;
    geral: number;
  };
}

export default function TotaisPorFormaPagamento({ totais }: TotaisPorFormaPagamentoProps) {
  return (
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
  );
}
