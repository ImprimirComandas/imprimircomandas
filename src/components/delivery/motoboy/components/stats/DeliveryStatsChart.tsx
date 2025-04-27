
import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DeliveryStatsChartProps {
  chartData: { name: string; Entregas: number }[];
}

export default function DeliveryStatsChart({ chartData }: DeliveryStatsChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Crescimento das Entregas
      </h3>
      {chartData.length > 0 && chartData.some(d => d.Entregas > 0) ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#374151" />
              <YAxis stroke="#374151" label={{ value: 'Entregas', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value: number) => `${value} entregas`}
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                }}
              />
              <Line
                type="monotone"
                dataKey="Entregas"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-gray-600 text-center">Nenhum dado disponível para o período selecionado.</p>
      )}
    </motion.div>
  );
}
