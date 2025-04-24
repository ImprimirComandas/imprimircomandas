
import React from 'react';
import { motion } from 'framer-motion';

interface OrderStatsProps {
  totais: {
    confirmados: number;
    naoConfirmados: number;
    total: number;
  };
}

export function OrderStats({ totais }: OrderStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm font-medium text-green-800">Confirmados</p>
        <p className="text-lg font-bold text-green-900">R$ {totais.confirmados.toFixed(2)}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-sm font-medium text-red-800">Não Confirmados</p>
        <p className="text-lg font-bold text-red-900">R$ {totais.naoConfirmados.toFixed(2)}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-600">Total</p>
        <p className="text-lg font-bold text-gray-900">R$ {totais.total.toFixed(2)}</p>
      </div>
    </motion.div>
  );
}
