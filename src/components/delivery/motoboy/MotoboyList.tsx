
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Play, Square, Trash, User, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { calculateSessionDuration } from './utils';

interface Motoboy {
  id: string;
  nome: string;
  telefone: string;
  user_id: string;
  created_at: string;
}

interface MotoboySession {
  id: string;
  motoboy_id: string;
  start_time: string;
  end_time: string | null;
  user_id: string;
}

interface MotoboyListProps {
  motoboys: Motoboy[];
  sessions: MotoboySession[];
  loading: boolean;
  sessionLoading: boolean;
  onMotoboyDeleted: () => void;
  onSessionStatusChanged: () => void;
}

export default function MotoboyList({
  motoboys,
  sessions,
  loading,
  sessionLoading,
  onMotoboyDeleted,
  onSessionStatusChanged,
}: MotoboyListProps) {
  const [editingMotoboy, setEditingMotoboy] = useState<Motoboy | null>(null);

  const handleSaveMotoboy = async (motoboy: Motoboy) => {
    try {
      if (motoboy.nome.trim() === '') {
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
        .update({
          nome: motoboy.nome,
          telefone: motoboy.telefone,
        })
        .eq('id', motoboy.id);

      if (error) throw error;

      toast.success('Motoboy atualizado com sucesso');
      setEditingMotoboy(null);
      onMotoboyDeleted(); // Refresh list
    } catch (error: unknown) {
      console.error('Erro ao atualizar motoboy:', error);
      const err = error as Error;
      toast.error(`Erro ao atualizar motoboy: ${err.message}`);
    }
  };

  const handleDeleteMotoboy = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este motoboy?')) return;

    try {
      // Verificar se o motoboy tem sessão aberta
      const activeSessions = sessions.filter(
        (s) => s.motoboy_id === id && s.end_time === null
      );
      
      if (activeSessions.length > 0) {
        toast.error('Finalize a sessão do motoboy antes de excluí-lo');
        return;
      }

      const { error } = await supabase
        .from('motoboys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Motoboy excluído com sucesso');
      onMotoboyDeleted();
    } catch (error: unknown) {
      console.error('Erro ao excluir motoboy:', error);
      const err = error as Error;
      toast.error(`Erro ao excluir motoboy: ${err.message}`);
    }
  };

  const startMotoboySession = async (motoboyId: string) => {
    try {
      // Verificar se a loja está aberta
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }
      
      const { data: shopSessions, error: shopSessionsError } = await supabase
        .from('shop_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .is('end_time', null)
        .limit(1);
        
      if (shopSessionsError) throw shopSessionsError;
      
      if (!shopSessions || shopSessions.length === 0) {
        toast.error('A loja precisa estar aberta para iniciar uma sessão de motoboy');
        return;
      }
      
      // Verificar se já existe uma sessão aberta para este motoboy
      const { data: existingSessions, error: existingSessionsError } = await supabase
        .from('motoboy_sessions')
        .select('*')
        .eq('motoboy_id', motoboyId)
        .is('end_time', null)
        .limit(1);
        
      if (existingSessionsError) throw existingSessionsError;
      
      if (existingSessions && existingSessions.length > 0) {
        toast.error('Este motoboy já possui uma sessão em andamento');
        return;
      }

      const { error } = await supabase
        .from('motoboy_sessions')
        .insert([
          {
            motoboy_id: motoboyId,
            start_time: new Date().toISOString(),
            end_time: null,
            user_id: session.user.id,
          },
        ]);

      if (error) throw error;

      toast.success('Sessão iniciada com sucesso');
      onSessionStatusChanged();
    } catch (error: unknown) {
      console.error('Erro ao iniciar sessão:', error);
      const err = error as Error;
      toast.error(`Erro ao iniciar sessão: ${err.message}`);
    }
  };

  const endMotoboySession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('motoboy_sessions')
        .update({ end_time: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Sessão finalizada com sucesso');
      onSessionStatusChanged();
    } catch (error: unknown) {
      console.error('Erro ao finalizar sessão:', error);
      const err = error as Error;
      toast.error(`Erro ao finalizar sessão: ${err.message}`);
    }
  };

  const getActiveSessions = (motoboyId: string) => {
    return sessions.filter(
      (session) => session.motoboy_id === motoboyId && session.end_time === null
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-600"></div>
      </div>
    );
  }

  if (motoboys.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg font-medium">
          Nenhum motoboy cadastrado. Adicione um motoboy para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {motoboys.map((motoboy) => {
        const activeSessions = getActiveSessions(motoboy.id);
        const isActive = activeSessions.length > 0;
        
        return (
          <motion.div
            key={motoboy.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-xl border ${
              isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}
          >
            {editingMotoboy?.id === motoboy.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={editingMotoboy.nome}
                    onChange={(e) =>
                      setEditingMotoboy({
                        ...editingMotoboy,
                        nome: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={editingMotoboy.telefone}
                    onChange={(e) =>
                      setEditingMotoboy({
                        ...editingMotoboy,
                        telefone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setEditingMotoboy(null)}
                    className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleSaveMotoboy(editingMotoboy)}
                    className="p-2 rounded-full text-green-600 hover:bg-green-100"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <h3 className="font-semibold text-gray-800">
                    {motoboy.nome}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingMotoboy(motoboy)}
                      className="p-1 rounded-full text-blue-600 hover:bg-blue-100"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMotoboy(motoboy.id)}
                      className="p-1 rounded-full text-red-600 hover:bg-red-100"
                      disabled={isActive}
                      title={isActive ? "Finalize a sessão para excluir" : "Excluir"}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {motoboy.telefone && (
                  <p className="text-sm text-gray-500 mt-1">
                    {motoboy.telefone}
                  </p>
                )}
                
                {isActive ? (
                  <div className="mt-3">
                    <div className="flex items-center text-green-600 text-sm font-medium mb-2">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        Em atividade: 
                        {calculateSessionDuration(
                          activeSessions[0].start_time,
                          null
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => endMotoboySession(activeSessions[0].id)}
                      disabled={sessionLoading}
                      className="w-full mt-2 py-1.5 px-3 text-sm rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200 flex items-center justify-center"
                    >
                      <Square className="h-3.5 w-3.5 mr-1.5" />
                      Finalizar Sessão
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startMotoboySession(motoboy.id)}
                    disabled={sessionLoading}
                    className="w-full mt-3 py-1.5 px-3 text-sm rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    Iniciar Sessão
                  </button>
                )}
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
