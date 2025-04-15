import { useState } from 'react';
import DeliveryForm from './DeliveryForm';
import DeliveryStats from './DeliveryStats';
import { motion } from 'framer-motion';

export default function DeliveryManagement() {
  const [activeTab, setActiveTab] = useState<'form' | 'stats'>('form');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold text-gray-900">
            Gerenciamento de Entregas
          </h1>
          <p className="mt-2 text-gray-600">
            Cadastre novas entregas ou acompanhe suas estatísticas
          </p>
        </motion.div>

        {/* Abas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border-b border-gray-200 mb-8"
        >
          <div className="flex space-x-8 -mb-px">
            <button
              onClick={() => setActiveTab('form')}
              className={`py-3 px-4 font-semibold text-sm transition-all duration-200 ${
                activeTab === 'form'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              Cadastrar Entrega
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-3 px-4 font-semibold text-sm transition-all duration-200 ${
                activeTab === 'stats'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              Estatísticas
            </button>
          </div>
        </motion.div>

        {/* Conteúdo das Abas */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'form' ? <DeliveryForm /> : <DeliveryStats />}
        </motion.div>
      </div>
    </div>
  );
}