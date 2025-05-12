
import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
<<<<<<< HEAD
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
=======
>>>>>>> 32ab48de34b911e4738785205b6198afc3450ca2

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
<<<<<<< HEAD
      className="bg-card text-card-foreground border border-border rounded-xl shadow-lg p-6 mb-8"
=======
      className="bg-card text-card-foreground border border-border rounded-2xl shadow-xl p-6 mb-8"
>>>>>>> 32ab48de34b911e4738785205b6198afc3450ca2
    >
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Adicionar Novo Bairro
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="new-nome"
<<<<<<< HEAD
              className="text-sm font-medium text-foreground"
=======
              className="block text-sm font-medium text-foreground mb-1"
>>>>>>> 32ab48de34b911e4738785205b6198afc3450ca2
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
<<<<<<< HEAD
              className="w-full px-4 py-2 bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
=======
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
>>>>>>> 32ab48de34b911e4738785205b6198afc3450ca2
              placeholder="Ex: Centro"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="new-taxa"
<<<<<<< HEAD
              className="text-sm font-medium text-foreground"
=======
              className="block text-sm font-medium text-foreground mb-1"
>>>>>>> 32ab48de34b911e4738785205b6198afc3450ca2
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
<<<<<<< HEAD
              className="w-full px-4 py-2 bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
=======
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
>>>>>>> 32ab48de34b911e4738785205b6198afc3450ca2
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
<<<<<<< HEAD
            className="px-4 py-2"
=======
            className="px-4 py-2 rounded-lg border border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
>>>>>>> 32ab48de34b911e4738785205b6198afc3450ca2
          >
            <X className="h-4 w-4 mr-2 inline-block" />
            Cancelar
          </Button>
          <Button
            type="submit"
<<<<<<< HEAD
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
=======
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
>>>>>>> 32ab48de34b911e4738785205b6198afc3450ca2
          >
            <Save className="h-4 w-4 mr-2 inline-block" />
            Salvar
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
