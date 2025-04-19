import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Edit, Trash, Save, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BairroTaxa {
  id: string;
  nome: string;
  taxa: number;
  user_id: string;
}

export default function DeliveryRates() {
  const [bairros, setBairros] = useState<BairroTaxa[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBairro, setEditingBairro] = useState<BairroTaxa | null>(null);
  const [newBairro, setNewBairro] = useState({ nome: '', taxa: 0 });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchBairros();
  }, []);

  const fetchBairros = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('bairros_taxas')
        .select('*')
        .eq('user_id', session.user.id)
        .order('nome');

      if (error) throw error;
      setBairros(data || []);
    } catch (error: unknown) {
      console.error('Erro ao carregar bairros:', error);
      const err = error as Error;
      toast.error(`Erro ao carregar bairros: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (bairro: BairroTaxa) => {
    try {
      if (bairro.nome.trim() === '') {
        toast.error('O nome do bairro não pode estar vazio');
        return;
      }

      if (isNaN(bairro.taxa) || bairro.taxa < 0) {
        toast.error('A taxa deve ser um número positivo');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      const { error } = await supabase
        .from('bairros_taxas')
        .update({
          nome: bairro.nome,
          taxa: bairro.taxa,
        })
        .eq('id', bairro.id);

      if (error) throw error;

      toast.success('Bairro atualizado com sucesso');
      setEditingBairro(null);
      fetchBairros();
    } catch (error: unknown) {
      console.error('Erro ao atualizar bairro:', error);
      const err = error as Error;
      toast.error(`Erro ao atualizar bairro: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este bairro?')) return;

    try {
      const { error } = await supabase
        .from('bairros_taxas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Bairro excluído com sucesso');
      fetchBairros();
    } catch (error: unknown) {
      console.error('Erro ao excluir bairro:', error);
      const err = error as Error;
      toast.error(`Erro ao excluir bairro: ${err.message}`);
    }
  };

  const handleAddBairro = async () => {
    try {
      if (newBairro.nome.trim() === '') {
        toast.error('O nome do bairro não pode estar vazio');
        return;
      }

      if (isNaN(newBairro.taxa) || newBairro.taxa < 0) {
        toast.error('A taxa deve ser um número positivo');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      const { error } = await supabase
        .from('bairros_taxas')
        .insert([
          {
            nome: newBairro.nome,
            taxa: newBairro.taxa,
            user_id: session.user.id,
          },
        ]);

      if (error) throw error;

      toast.success('Bairro adicionado com sucesso');
      setNewBairro({ nome: '', taxa: 0 });
      setShowAddForm(false);
      fetchBairros();
    } catch (error: unknown) {
      console.error('Erro ao adicionar bairro:', error);
      const err = error as Error;
      toast.error(`Erro ao adicionar bairro: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
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

        {/* Formulário de Adição */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Adicionar Novo Bairro
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="new-nome"
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ex: Centro"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-taxa"
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                    min="0"
                    step="0.50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  title="Editar Bairro"
                  onClick={() => setShowAddForm(false)}
                  className="flex items-center px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
                <button
                  onClick={handleAddBairro}
                  className="flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabela de Bairros */}
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
          ) : bairros.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 p-8 rounded-lg text-center"
            >
              <p className="text-gray-600 text-lg font-medium">
                Nenhum bairro cadastrado. Adicione um bairro para começar.
              </p>
            </motion.div>
          ) : (
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
                                onClick={() => handleSave(editingBairro)}
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
                                onClick={() => handleDelete(bairro.id)}
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
          )}
        </motion.div>

        {/* Botão Adicionar (fora do formulário, sempre visível) */}
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