
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AddMotoboyForm } from './motoboy/AddMotoboyForm';
import { MotoboyList } from './motoboy/MotoboyList';
import type { Motoboy, ExtendedMotoboySession } from '@/types';
import { motion } from 'framer-motion';

export default function DeliveryMotoboyManagement() {
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [activeSessions, setActiveSessions] = useState<ExtendedMotoboySession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMotoboys();
    fetchActiveSessions();
  }, []);

  const fetchMotoboys = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('motoboys')
        .select('*')
        .eq('user_id', session.user.id)
        .order('nome');

      if (error) throw error;
      setMotoboys(data || []);
    } catch (error) {
      console.error('Erro ao carregar motoboys:', error);
      toast.error('Erro ao carregar motoboys');
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('motoboy_sessions')
        .select(`
          *,
          motoboys!inner(nome)
        `)
        .eq('user_id', session.user.id)
        .is('end_time', null);

      if (error) throw error;
      
      const sessionsWithNames = (data || []).map(session => ({
        ...session,
        motoboy_nome: session.motoboys?.nome
      }));
      
      setActiveSessions(sessionsWithNames);
    } catch (error) {
      console.error('Erro ao carregar sessões ativas:', error);
      toast.error('Erro ao carregar sessões ativas');
    }
  };

  const addMotoboy = async (motoboyData: {
    nome: string;
    telefone: string;
    valor_fixo_sessao?: number;
    entregas_para_desconto?: number;
    valor_desconto_entrega?: number;
    taxa_comissao?: number;
    tipo_pagamento?: 'fixo' | 'comissao' | 'fixo_comissao';
  }) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('motoboys')
        .insert([{ ...motoboyData, user_id: session.user.id }]);

      if (error) throw error;

      toast.success('Motoboy adicionado com sucesso!');
      fetchMotoboys();
    } catch (error) {
      console.error('Erro ao adicionar motoboy:', error);
      toast.error('Erro ao adicionar motoboy');
    } finally {
      setLoading(false);
    }
  };

  const editMotoboy = async (updatedMotoboy: Motoboy) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('motoboys')
        .update({
          nome: updatedMotoboy.nome,
          telefone: updatedMotoboy.telefone,
          valor_fixo_sessao: updatedMotoboy.valor_fixo_sessao,
          entregas_para_desconto: updatedMotoboy.entregas_para_desconto,
          valor_desconto_entrega: updatedMotoboy.valor_desconto_entrega,
          taxa_comissao: updatedMotoboy.taxa_comissao,
          tipo_pagamento: updatedMotoboy.tipo_pagamento,
        })
        .eq('id', updatedMotoboy.id);

      if (error) throw error;

      toast.success('Motoboy atualizado com sucesso!');
      fetchMotoboys();
    } catch (error) {
      console.error('Erro ao atualizar motoboy:', error);
      toast.error('Erro ao atualizar motoboy');
    } finally {
      setLoading(false);
    }
  };

  const deleteMotoboy = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este motoboy?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('motoboys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Motoboy excluído com sucesso!');
      setMotoboys(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Erro ao excluir motoboy:', error);
      toast.error('Erro ao excluir motoboy');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (motoboyId: string) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('motoboy_sessions')
        .insert([{
          motoboy_id: motoboyId,
          user_id: session.user.id,
          start_time: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('Sessão iniciada com sucesso!');
      fetchActiveSessions();
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      toast.error('Erro ao iniciar sessão');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (motoboyId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('motoboy_sessions')
        .update({ end_time: new Date().toISOString() })
        .eq('motoboy_id', motoboyId)
        .is('end_time', null);

      if (error) throw error;

      toast.success('Sessão encerrada com sucesso!');
      fetchActiveSessions();
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
      toast.error('Erro ao encerrar sessão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AddMotoboyForm onAdd={addMotoboy} loading={loading} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Motoboys Cadastrados ({motoboys.length})
        </h3>
        <MotoboyList
          motoboys={motoboys}
          activeSessions={activeSessions}
          onStartSession={startSession}
          onEndSession={endSession}
          onEdit={editMotoboy}
          onDelete={deleteMotoboy}
          loading={loading}
        />
      </motion.div>
    </div>
  );
}
