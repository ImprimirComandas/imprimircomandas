
import React from 'react';
import { motion } from 'framer-motion';

interface NeighborhoodDetailsProps {
  items: Array<{ bairro: string; count: number }>;
}

export default function NeighborhoodDetails({ items }: NeighborhoodDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-2 pl-2 border-l-2 border-green-200 space-y-1"
    >
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between text-xs">
          <span className="text-gray-600">{item.bairro}:</span>
          <span className="font-medium">{item.count}</span>
        </div>
      ))}
    </motion.div>
  );
}
