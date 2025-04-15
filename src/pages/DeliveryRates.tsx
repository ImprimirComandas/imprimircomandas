
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Edit, Trash, Save, Plus, X } from 'lucide-react';

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
    } catch (error: any) {
      console.error('Erro ao carregar bairros:', error);
      toast.error(`Erro ao carregar bairros: ${error.message}`);
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
          taxa: bairro.taxa
        })
        .eq('id', bairro.id);

      if (error) throw error;
      
      toast.success('Bairro atualizado com sucesso');
      setEditingBairro(null);
      fetchBairros();
    } catch (error: any) {
      console.error('Erro ao atualizar bairro:', error);
      toast.error(`Erro ao atualizar bairro: ${error.message}`);
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
    } catch (error: any) {
      console.error('Erro ao excluir bairro:', error);
      toast.error(`Erro ao excluir bairro: ${error.message}`);
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
        .insert([{
          nome: newBairro.nome,
          taxa: newBairro.taxa,
          user_id: session.user.id
        }]);

      if (error) throw error;
      
      toast.success('Bairro adicionado com sucesso');
      setNewBairro({ nome: '', taxa: 0 });
      setShowAddForm(false);
      fetchBairros();
    } catch (error: any) {
      console.error('Erro ao adicionar bairro:', error);
      toast.error(`Erro ao adicionar bairro: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Taxas por Bairro</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          {showAddForm ? <X className="mr-2" size={18} /> : <Plus className="mr-2" size={18} />}
          {showAddForm ? 'Cancelar' : 'Adicionar Bairro'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Adicionar Novo Bairro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Bairro</label>
              <input
                type="text"
                value={newBairro.nome}
                onChange={(e) => setNewBairro({ ...newBairro, nome: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Nome do bairro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Taxa de Entrega (R$)</label>
              <input
                type="number"
                value={newBairro.taxa}
                onChange={(e) => setNewBairro({ ...newBairro, taxa: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded"
                placeholder="0.00"
                min="0"
                step="0.50"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleAddBairro}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <Save className="inline mr-2" size={18} />
              Salvar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
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
            {bairros.length > 0 ? (
              bairros.map((bairro) => (
                <tr key={bairro.id}>
                  {editingBairro?.id === bairro.id ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={editingBairro.nome}
                          onChange={(e) => setEditingBairro({ ...editingBairro, nome: e.target.value })}
                          className="w-full p-2 border rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={editingBairro.taxa}
                          onChange={(e) => setEditingBairro({ ...editingBairro, taxa: parseFloat(e.target.value) })}
                          className="w-full p-2 border rounded"
                          min="0"
                          step="0.50"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleSave(editingBairro)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={() => setEditingBairro(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <X size={18} />
                        </button>
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
                        <button
                          onClick={() => setEditingBairro(bairro)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(bairro.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  Nenhum bairro cadastrado. Adicione um bairro para começar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
