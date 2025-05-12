
import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      className="bg-card text-card-foreground border border-border rounded-xl shadow-lg p-6 mb-8"
    >
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Adicionar Novo Bairro
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="new-nome"
              className="text-sm font-medium text-foreground"
            >
              Nome do Bairro
            </Label>
            <Input
              id="new-nome"
              type="text"
              value={newBairro.nome}
              onChange={(e) =>
                setNewBairro({ ...newBairro, nome: e.target.value })
              }
              className="w-full px-4 py-2 bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
              placeholder="Ex: Centro"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="new-taxa"
              className="text-sm font-medium text-foreground"
            >
              Taxa de Entrega (R$)
            </Label>
            <Input
              id="new-taxa"
              type="number"
              value={newBairro.taxa}
              onChange={(e) =>
                setNewBairro({
                  ...newBairro,
                  taxa: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
              placeholder="0.00"
              min="0"
              step="0.50"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-4 py-2"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
