
import { useState } from 'react';
import { Edit, Save, Trash, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BairroTaxa } from '../../types/database';
import { useTheme } from '@/hooks/useTheme';

interface NeighborhoodTableProps {
  bairros: BairroTaxa[];
  onSave: (bairro: BairroTaxa) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function NeighborhoodTable({ bairros, onSave, onDelete }: NeighborhoodTableProps) {
  const [editingBairro, setEditingBairro] = useState<BairroTaxa | null>(null);
  const { isDark } = useTheme();

  if (bairros.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-muted/20 p-8 rounded-lg text-center"
      >
        <p className="text-muted-foreground text-lg font-medium">
          Nenhum bairro cadastrado. Adicione um bairro para começar.
        </p>
      </motion.div>
    );
  }

  const handleSave = async (bairro: BairroTaxa) => {
    await onSave(bairro);
    setEditingBairro(null);
  };

  return (
    <table className="min-w-full divide-y divide-border">
      <thead className="bg-muted/30">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Bairro
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Taxa de Entrega
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Ações
          </th>
        </tr>
      </thead>
      <tbody className="bg-card divide-y divide-border">
        <AnimatePresence>
          {bairros.map((bairro) => (
            <motion.tr
              key={bairro.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {editingBairro?.id === bairro.id ? (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={editingBairro.nome}
                      onChange={(e) =>
                        setEditingBairro({
                          ...editingBairro,
                          nome: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Nome do bairro"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={editingBairro.taxa}
                      onChange={(e) =>
                        setEditingBairro({
                          ...editingBairro,
                          taxa: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      min="0"
                      step="0.50"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSave(editingBairro)}
                        className="p-2 rounded-full text-green-600 hover:bg-accent transition-colors duration-200"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditingBairro(null)}
                        className="p-2 rounded-full text-muted-foreground hover:bg-accent transition-colors duration-200"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {bairro.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    R$ {bairro.taxa.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingBairro(bairro)}
                        className="p-2 rounded-full text-primary hover:bg-accent transition-colors duration-200"
                        title="Editar Bairro"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(bairro.id)}
                        className="p-2 rounded-full text-destructive hover:bg-destructive/10 transition-colors duration-200"
                        title="Excluir Bairro"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </>
              )}
            </motion.tr>
          ))}
        </AnimatePresence>
      </tbody>
    </table>
  );
}
