
interface TotaisPorStatusPagamentoProps {
  confirmados: number;
  naoConfirmados: number;
  total: number;
}

export default function TotaisPorStatusPagamento({ 
  confirmados, 
  naoConfirmados, 
  total 
}: TotaisPorStatusPagamentoProps) {
  // Ensure all values are numbers and default to 0 if undefined
  const confirmedValue = confirmados || 0;
  const unconfirmedValue = naoConfirmados || 0;
  const totalValue = total || 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
      <h2 className="text-lg md:text-xl font-bold mb-4">Status de Pagamentos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-3 rounded border border-green-200">
          <p className="text-sm font-medium text-green-800">Confirmados</p>
          <p className="text-lg font-bold text-green-900">R$ {confirmedValue.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-3 rounded border border-red-200">
          <p className="text-sm font-medium text-red-800">Não Confirmados</p>
          <p className="text-lg font-bold text-red-900">R$ {unconfirmedValue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-medium text-gray-600">Total</p>
          <p className="text-lg font-bold text-gray-900">R$ {totalValue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
