
interface TrocoModalProps {
  show: boolean;
  needsTroco: boolean | null;
  quantiapagaInput: string;
  totalComTaxa: number;
  onClose: () => void;
  onConfirm: () => void;
  onChange: (field: string, value: any) => void;
  onSaveAndPrint: () => void;
}

export default function TrocoModal({
  show,
  needsTroco,
  quantiapagaInput,
  totalComTaxa,
  onClose,
  onConfirm,
  onChange,
  onSaveAndPrint,
}: TrocoModalProps) {
  if (!show) return null;

  const handleConfirmAndSave = () => {
    onConfirm();
    onSaveAndPrint();
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
          Precisa de Troco?
        </h2>
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => onChange('needsTroco', true)}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              needsTroco === true
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-pressed={needsTroco === true}
          >
            Sim
          </button>
          <button
            onClick={() => {
              onChange('needsTroco', false);
              onChange('quantiapagaInput', '');
            }}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              needsTroco === false
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-pressed={needsTroco === false}
          >
            Não
          </button>
        </div>
        {needsTroco && (
          <div className="mb-5">
            <label
              htmlFor="quantiapaga"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Quantia Paga (R$)
            </label>
            <input
              id="quantiapaga"
              type="number"
              value={quantiapagaInput}
              onChange={(e) => onChange('quantiapagaInput', e.target.value)}
              placeholder="Digite a quantia paga"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
              step="0.01"
              min={totalComTaxa}
              aria-describedby="troco-info"
            />
            {quantiapagaInput && parseFloat(quantiapagaInput) > totalComTaxa && (
              <p id="troco-info" className="mt-2 text-sm text-gray-500">
                Troco: R$ {(parseFloat(quantiapagaInput) - totalComTaxa).toFixed(2)}
              </p>
            )}
          </div>
        )}
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
              needsTroco === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
            disabled={needsTroco === null}
            aria-label="Confirmar"
          >
            Confirmar e Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
