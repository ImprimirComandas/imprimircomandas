
import React, { useState, useEffect } from 'react';
import DeliveryStatsHeader from './delivery/motoboy/components/stats/DeliveryStatsHeader';
import DeliveryStatsChart from './delivery/motoboy/components/stats/DeliveryStatsChart';
import DeliveryStatsSummary from './delivery/motoboy/components/stats/DeliveryStatsSummary';
import DeliveryStatsWorkSessions from './delivery/motoboy/components/stats/DeliveryStatsWorkSessions';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useDeliveryStats } from '@/hooks/useDeliveryStats';
import { useWorkSessions } from '@/hooks/useWorkSessions';

export default function DeliveryStats() {
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const { stats, chartData, loading, loadStats } = useDeliveryStats();
  const { workSessions, motoboys, loadWorkSessions } = useWorkSessions();

  useEffect(() => {
    const fetchData = async () => {
      await loadStats(startDate, endDate);
      if (stats.deliveriesByMotoboy.length > 0) {
        await loadWorkSessions(
          new Date(`${startDate}T00:00:00`),
          new Date(`${endDate}T23:59:59`),
          stats.deliveriesByMotoboy
        );
      }
    };
    fetchData();
  }, [startDate, endDate]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <DeliveryStatsHeader title="Estatísticas de Entregas" />

      <div className="flex flex-wrap gap-4 mb-8">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data Inicial
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data Final
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => loadStats(startDate, endDate)}
            disabled={loading}
            className={`flex items-center px-4 py-2 rounded-lg text-white transition-colors duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Carregando...
              </>
            ) : (
              'Filtrar'
            )}
          </button>
        </div>
      </div>

      <DeliveryStatsChart chartData={chartData} />
      <DeliveryStatsSummary total={stats.totalDeliveries} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Deliveries by Motoboy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Entregas por Motoboy
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {stats.deliveriesByMotoboy.length > 0 ? (
              <ul className="space-y-2">
                <AnimatePresence>
                  {stats.deliveriesByMotoboy.map((item) => (
                    <motion.li
                      key={item.motoboy_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm"
                    >
                      <span className="text-gray-700">{item.motoboy_nome}</span>
                      <span className="font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {item.count} entregas
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <p className="text-gray-600 text-center">Nenhuma entrega encontrada</p>
            )}
          </div>
        </motion.div>

        {/* Deliveries by Neighborhood */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Entregas por Bairro
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {stats.deliveriesByBairro.length > 0 ? (
              <ul className="space-y-2">
                <AnimatePresence>
                  {stats.deliveriesByBairro.map((item) => (
                    <motion.li
                      key={item.bairro}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="p-2 bg-white rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">{item.bairro}</span>
                        <span className="font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {item.count} entregas
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <p className="text-gray-600 text-center">Nenhuma entrega encontrada</p>
            )}
          </div>
        </motion.div>
      </div>

      <DeliveryStatsWorkSessions 
        workSessions={workSessions} 
        motoboys={motoboys} 
      />

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-600"></div>
        </motion.div>
      )}
    </div>
  );
}
