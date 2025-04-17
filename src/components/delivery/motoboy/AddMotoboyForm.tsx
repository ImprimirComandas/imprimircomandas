import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { X, Save } from 'lucide-react';

interface AddMotoboyFormProps {
  onMotoboyAdded: () => void;
  onCancel: () => void;
}

export default function AddMotoboyForm({ onMotoboyAdded, onCancel }: AddMotoboyFormProps) {
  const [newMotoboy, setNewMotoboy] = useState({ nome: '', telefone: '' });

  const handleAddMotoboy = async () => {
    try {
      if (newMotoboy.nome.trim() === '') {
        toast.error('O nome do motoboy não pode estar vazio');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      const { error } = await supabase
        .from('motoboys')
        .insert([
          {
            nome: newMotoboy.nome,
            telefone: newMotoboy.telefone,
            user_id: session.user.id,
          },
        ]);

      if (error) throw error;

      toast.success('Motoboy adicionado com sucesso');
      setNewMotoboy({ nome: '', telefone: '' });
      onMotoboyAdded();
    } catch (error: unknown) {
      console.error('Erro ao adicionar motoboy:', error);
      const err = error as Error;
      toast.error(`Erro ao adicionar motoboy: ${err.message}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-50 rounded-xl p-4 mb-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Adicionar Novo Motoboy
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="new-nome"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome
          </label>
          <input
            id="new-nome"
            type="text"
            value={newMotoboy.nome}
            onChange={(e) =>
              setNewMotoboy({ ...newMotoboy, nome: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Nome do motoboy"
          />
        </div>
        <div>
          <label
            htmlFor="new-telefone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Telefone
          </label>
          <input
            id="new-telefone"
            type="tel"
            value={newMotoboy.telefone}
            onChange={(e) =>
              setNewMotoboy({
                ...newMotoboy,
                telefone: e.target.value,
              })
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onCancel}
          className="flex items-center px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </button>
        <button
          onClick={handleAddMotoboy}
          className="flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </button>
      </div>
    </motion.div>
  );
}