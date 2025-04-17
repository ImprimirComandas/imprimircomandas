import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, User, Clock } from 'lucide-react';
import { MotoboyList, AddMotoboyForm, SessionHistory } from './motoboy';

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

export default function DeliveryMotoboyManagement() {
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [sessions, setSessions] = useState<MotoboySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      console.log('Motoboys:', data);
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
      console.log('Sessions:', data);
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

  const handleMotoboyAdded = () => {
    setShowAddForm(false);
    fetchMotoboys();
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
      {/* Motoboys Cadastrados */}
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
            onMotoboyAdded={handleMotoboyAdded} 
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
            onSessionStatusChanged={fetchSessions}
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
        <SessionHistory sessions={sessions} motoboys={motoboys} />
      )}
    </div>
  );
}