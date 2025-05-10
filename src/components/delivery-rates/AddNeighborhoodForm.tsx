
import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

interface AddNeighborhoodFormProps {
  onAdd: (nome: string, taxa: number) => Promise<void>;
  onCancel: () => void;
}

export function AddNeighborhoodForm({ onAdd, onCancel }: AddNeighborhoodFormProps) {
  const [newBairro, setNewBairro] = useState({ nome: '', taxa: 0 });
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd(newBairro.nome, newBairro.taxa);
    setNewBairro({ nome: '', taxa: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-card text-card-foreground border border-border rounded-2xl shadow-xl p-6 mb-8"
    >
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Adicionar Novo Bairro
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="new-nome"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Nome do Bairro
            </label>
            <input
              id="new-nome"
              type="text"
              value={newBairro.nome}
              onChange={(e) =>
                setNewBairro({ ...newBairro, nome: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Ex: Centro"
            />
          </div>
          <div>
            <label
              htmlFor="new-taxa"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Taxa de Entrega (R$)
            </label>
            <input
              id="new-taxa"
              type="number"
              value={newBairro.taxa}
              onChange={(e) =>
                setNewBairro({
                  ...newBairro,
                  taxa: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="0.00"
              min="0"
              step="0.50"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <X className="h-4 w-4 mr-2 inline-block" />
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Save className="h-4 w-4 mr-2 inline-block" />
            Salvar
          </button>
        </div>
      </form>
    </motion.div>
  );
}
