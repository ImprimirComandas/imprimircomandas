import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, User, Clock } from 'lucide-react';
import { MotoboyList, AddMotoboyForm, SessionHistory } from './motoboy';
import type { Motoboy, MotoboySession } from '../../types'; // Import from global types instead of local types

export default function DeliveryMotoboyManagement() {
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [sessions, setSessions] = useState<MotoboySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchMotoboys();
    fetchSessions();
  }, []);

  const fetchMotoboys = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        setError('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('motoboys')
        .select('*')
        .eq('user_id', session.user.id)
        .order('nome');

      if (error) throw error;
      setMotoboys(data || []);
    } catch (error: unknown) {
      console.error('Erro ao carregar motoboys:', error);
      const err = error as Error;
      toast.error(`Erro ao carregar motoboys: ${err.message}`);
      setError(`Erro ao carregar motoboys: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setSessionLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        setError('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('motoboy_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: unknown) {
      console.error('Erro ao carregar sessões:', error);
      const err = error as Error;
      toast.error(`Erro ao carregar sessões: ${err.message}`);
      setError(`Erro ao carregar sessões: ${err.message}`);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleAddMotoboy = async (nome: string, telefone: string) => {
    try {
      setFormLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      const { error } = await supabase.from('motoboys').insert([
        {
          nome,
          telefone,
          user_id: session.user.id,
          status: 'inactive'
        }
      ]);

      if (error) throw error;

      toast.success('Motoboy adicionado com sucesso');
      setShowAddForm(false);
      fetchMotoboys();
    } catch (error: unknown) {
      console.error('Erro ao adicionar motoboy:', error);
      const err = error as Error;
      toast.error(`Erro ao adicionar motoboy: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('motoboys')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Status atualizado com sucesso');
      fetchMotoboys();
    } catch (error: unknown) {
      console.error('Erro ao atualizar status:', error);
      const err = error as Error;
      toast.error(`Erro ao atualizar status: ${err.message}`);
    }
  };

  if (error && !loading && !sessionLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Erro</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchMotoboys();
            fetchSessions();
          }}
          className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Motoboys</h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Motoboy
            </button>
          )}
        </div>

        {showAddForm && (
          <AddMotoboyForm 
            onSubmit={handleAddMotoboy}
            loading={formLoading}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {loading ? (
          <div className="text-center text-gray-600">Carregando motoboys...</div>
        ) : motoboys.length === 0 ? (
          <div className="text-center text-gray-600">Nenhum motoboy cadastrado.</div>
        ) : (
          <MotoboyList 
            motoboys={motoboys}
            sessions={sessions}
            loading={loading}
            sessionLoading={sessionLoading}
            onMotoboyDeleted={fetchMotoboys}
            onSessionAdded={fetchSessions}
            onSessionEnded={fetchSessions}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </motion.div>

      {sessionLoading ? (
        <div className="text-center text-gray-600">Carregando histórico de sessões...</div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center text-gray-600">
          Nenhuma sessão registrada.
        </div>
      ) : (
        <SessionHistory 
          sessions={sessions} 
          motoboys={motoboys}
          onRefresh={fetchSessions}
        />
      )}
    </div>
  );
}
