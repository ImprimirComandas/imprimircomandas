import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface TotaisPorStatusPagamentoProps {
  confirmados: number;
  naoConfirmados: number;
  total: number;
  showValues: boolean;
  toggleShowValues: () => void;
}

export default function TotaisPorStatusPagamento({
  confirmados = 0,
  naoConfirmados = 0,
  total = 0,
  showValues,
  toggleShowValues,
}: TotaisPorStatusPagamentoProps) {
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Status de Pagamentos</h2>
        <button
          onClick={toggleShowValues}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          title={showValues ? 'Ocultar valores' : 'Exibir valores'}
        >
          {showValues ? (
            <Eye className="h-5 w-5 text-gray-600" />
          ) : (
            <EyeOff className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-800">Confirmados</p>
          <p className="text-lg font-bold text-green-900">
            {showValues ? `R$ ${confirmados.toFixed(2)}` : '****'}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm font-medium text-red-800">Não Confirmados</p>
          <p className="text-lg font-bold text-red-900">
            {showValues ? `R$ ${naoConfirmados.toFixed(2)}` : '****'}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total</p>
          <p className="text-lg font-bold text-gray-900">
            {showValues ? `R$ ${total.toFixed(2)}` : '****'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}