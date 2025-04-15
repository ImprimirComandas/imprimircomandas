
import { useState } from 'react';
import DeliveryForm from './DeliveryForm';
import DeliveryStats from './DeliveryStats';

export default function DeliveryManagement() {
  const [activeTab, setActiveTab] = useState<'form' | 'stats'>('form');

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Entregas</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <div className="flex -mb-px">
          <button
            onClick={() => setActiveTab('form')}
            className={`mr-8 py-2 px-1 font-medium text-sm ${
              activeTab === 'form'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cadastrar Entrega
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-1 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Estatísticas
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="mt-4">
        {activeTab === 'form' ? (
          <DeliveryForm />
        ) : (
          <DeliveryStats />
        )}
      </div>
    </div>
  );
}
