
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { NeighborhoodTable } from '../components/delivery-rates/NeighborhoodTable';
import { AddNeighborhoodForm } from '../components/delivery-rates/AddNeighborhoodForm';
import { useNeighborhoods } from '../hooks/useNeighborhoods';

export default function DeliveryRates() {
  const { bairros, loading, addBairro, updateBairro, deleteBairro } = useNeighborhoods();
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold text-gray-900">
            Taxas de Entrega por Bairro
          </h1>
          <p className="mt-2 text-gray-600">
            Gerencie as taxas de entrega para diferentes bairros
          </p>
        </motion.div>

        {showAddForm && (
          <AddNeighborhoodForm
            onAdd={addBairro}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-600"></div>
            </div>
          ) : (
            <NeighborhoodTable
              bairros={bairros}
              onSave={updateBairro}
              onDelete={deleteBairro}
            />
          )}
        </motion.div>

        {!showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 text-right"
          >
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Bairro
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
