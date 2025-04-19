
import { useState } from 'react';
import DeliveryForm from './DeliveryForm';
import DeliveryStats from './DeliveryStats';
import DeliveryMotoboyManagement from './delivery/DeliveryMotoboyManagement';
import DeliveryHeader from './delivery/DeliveryHeader';
import { motion } from 'framer-motion';
import { Truck, BarChart3, MapPin, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DeliveryManagement() {
  const [activeTab, setActiveTab] = useState<'form' | 'stats' | 'motoboys'>('form');
  const navigate = useNavigate();

  const goToDeliveryRates = () => {
    navigate('/delivery-rates');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <DeliveryHeader />

        {/* Abas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border-b border-gray-200 mb-8"
        >
          <div className="flex flex-wrap space-x-0 sm:space-x-8 -mb-px">
            <button
              onClick={() => setActiveTab('form')}
              className={`py-3 px-4 flex items-center font-semibold text-sm transition-all duration-200 ${
                activeTab === 'form'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              <Truck className="h-4 w-4 mr-2" />
              Cadastrar Entrega
            </button>
        
            <button
              onClick={() => setActiveTab('motoboys')}
              className={`py-3 px-4 flex items-center font-semibold text-sm transition-all duration-200 ${
                activeTab === 'motoboys'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              Motoboys
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-3 px-4 flex items-center font-semibold text-sm transition-all duration-200 ${
                activeTab === 'stats'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Estatísticas
            </button>
            
            <button
              onClick={goToDeliveryRates}
              className="py-3 px-4 flex items-center font-semibold text-sm text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300 transition-all duration-200"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Taxas por Bairro
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
          {activeTab === 'form' ? (
            <DeliveryForm />
          ) : activeTab === 'stats' ? (
            <DeliveryStats />
          ) : (
            <DeliveryMotoboyManagement />
          )}
        </motion.div>
      </div>
    </div>
  );
}
