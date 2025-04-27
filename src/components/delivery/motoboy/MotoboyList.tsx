
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import MotoboyCard from './components/MotoboyCard';
import { Motoboy, MotoboySession } from '../../../types';
import { User } from 'lucide-react';

interface MotoboyListProps {
  motoboys: Motoboy[];
  sessions: MotoboySession[];
  loading: boolean;
  sessionLoading: boolean;
  onMotoboyDeleted: () => Promise<void>;
  onSessionStatusChanged: () => Promise<void>;
  onSessionAdded?: () => void;
  onSessionEnded?: () => void;
}

export default function MotoboyList({
  motoboys,
  sessions,
  loading,
  sessionLoading,
  onMotoboyDeleted,
  onSessionStatusChanged,
  onSessionAdded,
  onSessionEnded,
}: MotoboyListProps) {
  const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({});
  const [deliveryStats, setDeliveryStats] = useState<Record<string, { total: number, byNeighborhood: Array<{ bairro: string; count: number }> }>>({});

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
      onMotoboyDeleted();
    } catch (error: unknown) {
      console.error('Erro ao atualizar motoboy:', error);
      const err = error as Error;
      toast.error(`Erro ao atualizar motoboy: ${err.message}`);
    }
  };

  const handleDeleteMotoboy = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este motoboy?')) return;

    try {
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
      onSessionAdded?.();
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
      onSessionEnded?.();
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

  if (!motoboys || motoboys.length === 0) {
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
      {motoboys.map((motoboy) => (
        <MotoboyCard
          key={motoboy.id}
          motoboy={motoboy}
          activeSessions={getActiveSessions(motoboy.id)}
          onDelete={handleDeleteMotoboy}
          onSave={handleSaveMotoboy}
          onStartSession={() => startMotoboySession(motoboy.id)}
          onEndSession={endMotoboySession}
          sessionLoading={sessionLoading}
          deliveryStats={deliveryStats[motoboy.id] || { total: 0, byNeighborhood: [] }}
          loadingStats={loadingStats[motoboy.id] || false}
        />
      ))}
    </div>
  );
}
