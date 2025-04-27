
import React from 'react';
import { motion } from 'framer-motion';

interface DeliveryStatsHeaderProps {
  title: string;
}

export default function DeliveryStatsHeader({ title }: DeliveryStatsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {title}
      </h2>
    </motion.div>
  );
}
