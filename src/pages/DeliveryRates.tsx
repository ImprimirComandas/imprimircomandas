
import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { NeighborhoodTable } from '../components/delivery-rates/NeighborhoodTable';
import { AddNeighborhoodForm } from '../components/delivery-rates/AddNeighborhoodForm';
import { useNeighborhoods } from '../hooks/useNeighborhoods';
import { PageContainer } from '../components/layouts/PageContainer';
import { Section } from '../components/layouts/Section';
import { useTheme } from '@/hooks/useTheme';
import { ThemedSection } from '@/components/ui/theme-provider';

export default function DeliveryRates() {
  const { bairros, loading, addBairro, updateBairro, deleteBairro, refreshBairros } = useNeighborhoods();
  const [showAddForm, setShowAddForm] = useState(false);
  const { theme, isDark } = useTheme();

  const handleAddBairro = async (nome: string, taxa: number) => {
    await addBairro(nome, taxa);
    setShowAddForm(false);
  };

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-foreground">
            Taxas de Entrega por Bairro
          </h1>
          <button
            onClick={() => refreshBairros()}
            className="flex items-center px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors duration-200"
            title="Atualizar lista de bairros"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-muted-foreground">
          Gerencie as taxas de entrega para diferentes bairros
        </p>
      </motion.div>

      {showAddForm && (
        <AddNeighborhoodForm
          onAdd={handleAddBairro}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <ThemedSection>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-primary"></div>
          </div>
        ) : (
          <NeighborhoodTable
            bairros={bairros}
            onSave={updateBairro}
            onDelete={deleteBairro}
          />
        )}
      </ThemedSection>

      {!showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-right"
        >
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Bairro
          </button>
        </motion.div>
      )}
    </PageContainer>
  );
}
