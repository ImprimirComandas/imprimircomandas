
import React from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

interface DeliveryStatsSummaryProps {
  total: number;
}

export default function DeliveryStatsSummary({ total }: DeliveryStatsSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-8 bg-gray-50 p-6 rounded-lg"
    >
      <div className="flex items-center justify-center text-2xl font-bold text-gray-800">
        <Layers className="h-6 w-6 mr-2 text-blue-600" />
        Total de Entregas: {total}
      </div>
    </motion.div>
  );
}
