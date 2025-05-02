
import { useState } from 'react';
import { Edit, Save, Trash, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BairroTaxa } from '../../types/database';

interface NeighborhoodTableProps {
  bairros: BairroTaxa[];
  onSave: (bairro: BairroTaxa) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function NeighborhoodTable({ bairros, onSave, onDelete }: NeighborhoodTableProps) {
  const [editingBairro, setEditingBairro] = useState<BairroTaxa | null>(null);

  if (bairros.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-50 p-8 rounded-lg text-center"
      >
        <p className="text-gray-600 text-lg font-medium">
          Nenhum bairro cadastrado. Adicione um bairro para começar.
        </p>
      </motion.div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Bairro
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Taxa de Entrega
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Ações
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
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
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      min="0"
                      step="0.50"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onSave(editingBairro)}
                        className="p-2 rounded-full text-green-600 hover:bg-green-100 transition-colors duration-200"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditingBairro(null)}
                        className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bairro.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    R$ {bairro.taxa.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingBairro(bairro)}
                        className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                        title="Editar Bairro"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(bairro.id)}
                        className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors duration-200"
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
