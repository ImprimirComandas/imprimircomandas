interface TrocoModalProps {
  show: boolean;
  needsTroco: boolean | null;
  quantiapagaInput: string;
  totalComTaxa: number;
  onClose: () => void;
  onConfirm: () => void;
  onChange: (field: string, value: any) => void;
}

export default function TrocoModal({
  show,
  needsTroco,
  quantiapagaInput,
  totalComTaxa,
  onClose,
  onConfirm,
  onChange,
}: TrocoModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Precisa de Troco?</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => onChange('needsTroco', true)}
            className={`px-4 py-2 rounded ${
              needsTroco === true ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Sim
          </button>
          <button
            onClick={() => {
              onChange('needsTroco', false);
              onChange('quantiapagaInput', '');
            }}
            className={`px-4 py-2 rounded ${
              needsTroco === false ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Não
          </button>
        </div>
        {needsTroco && (
          <div className="mb-4">
            <label htmlFor="quantiapaga" className="block text-sm font-medium text-gray-700">
              Quantia Paga (R$)
            </label>
            <input
              id="quantiapaga"
              type="number"
              value={quantiapagaInput}
              onChange={(e) => onChange('quantiapagaInput', e.target.value)}
              placeholder="Digite a quantia paga"
              className="w-full p-2 border rounded text-sm md:text-base"
              step="0.01"
              min={totalComTaxa}
            />
            {quantiapagaInput && parseFloat(quantiapagaInput) > totalComTaxa && (
              <p className="mt-2 text-sm text-gray-600">
                Troco: R$ {(parseFloat(quantiapagaInput) - totalComTaxa).toFixed(2)}
              </p>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={needsTroco === null}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
