
interface PagamentoMistoModalProps {
  show: boolean;
  totalComTaxa: number;
  valorCartaoInput: number | null;
  valorDinheiroInput: number | null;
  valorPixInput: number | null;
  onClose: () => void;
  onConfirm: () => void;
  onChange: (field: string, value: any) => void;
  onSaveAndPrint?: () => void;
}

export default function PagamentoMistoModal({
  show,
  totalComTaxa,
  valorCartaoInput,
  valorDinheiroInput,
  valorPixInput,
  onClose,
  onConfirm,
  onChange,
  onSaveAndPrint,
}: PagamentoMistoModalProps) {
  if (!show) return null;

  const cartao = valorCartaoInput || 0;
  const dinheiro = valorDinheiroInput || 0;
  const pix = valorPixInput || 0;
  const total = cartao + dinheiro + pix;
  const diferenca = totalComTaxa - total;

  const handleConfirmAndSave = () => {
    onConfirm();
    if (onSaveAndPrint) onSaveAndPrint();
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`bg-white rounded-xl p-6 w-full max-w-sm sm:max-w-md shadow-lg transform transition-all duration-300 ${
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-5">
          Pagamento Misto
        </h2>
        <p className="text-gray-600 mb-5">
          Total a pagar: <span className="font-semibold">R$ {totalComTaxa.toFixed(2)}</span>
        </p>
        
        <div className="space-y-4 mb-5">
          <div>
            <label
              htmlFor="valorCartao"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Valor no Cartão (R$)
            </label>
            <input
              id="valorCartao"
              type="number"
              value={valorCartaoInput === null ? '' : valorCartaoInput}
              onChange={(e) => onChange('valorCartaoInput', e.target.value)}
              placeholder="0.00"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
              step="0.01"
              min="0"
            />
          </div>
          
          <div>
            <label
              htmlFor="valorDinheiro"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Valor em Dinheiro (R$)
            </label>
            <input
              id="valorDinheiro"
              type="number"
              value={valorDinheiroInput === null ? '' : valorDinheiroInput}
              onChange={(e) => onChange('valorDinheiroInput', e.target.value)}
              placeholder="0.00"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
              step="0.01"
              min="0"
            />
          </div>
          
          <div>
            <label
              htmlFor="valorPix"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Valor no PIX (R$)
            </label>
            <input
              id="valorPix"
              type="number"
              value={valorPixInput === null ? '' : valorPixInput}
              onChange={(e) => onChange('valorPixInput', e.target.value)}
              placeholder="0.00"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
              step="0.01"
              min="0"
            />
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg mb-5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total:</span>
            <span className="font-semibold">R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm font-medium text-gray-700">Diferença:</span>
            <span className={`font-semibold ${Math.abs(diferenca) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {diferenca.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
            aria-label="Cancelar"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmAndSave}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              Math.abs(diferenca) < 0.01
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={Math.abs(diferenca) >= 0.01}
            aria-label="Confirmar"
          >
            Confirmar e Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
