
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminNotification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  dados_extras?: any;
  created_at: string;
  criada_por: string;
  status: string;
  agendada_para?: string;
  enviada_em?: string;
  total_enviadas: number;
  total_visualizadas: number;
  total_falhadas: number;
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar notificações enviadas pelo admin
  const fetchAdminNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar nova notificação administrativa
  const createAdminNotification = useCallback(async (
    titulo: string,
    mensagem: string,
    tipo: 'sistema' | 'promocao' | 'alerta' | 'info' = 'info',
    agendadaPara?: string
  ) => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          criada_por: user.id,
          titulo,
          mensagem,
          tipo,
          status: agendadaPara ? 'agendada' : 'enviada',
          agendada_para: agendadaPara ? new Date(agendadaPara).toISOString() : null,
          enviada_em: agendadaPara ? null : new Date().toISOString(),
          dados_extras: {
            origem: 'admin_panel',
            created_by_admin: true
          }
        });

      if (error) throw error;

      // Atualizar lista local
      await fetchAdminNotifications();

      // Invocar edge function para enviar notificação
      if (!agendadaPara) {
        await supabase.functions.invoke('send-notification', {
          body: {
            titulo,
            mensagem,
            tipo,
            admin_notification: true
          }
        });
      }

      toast.success(agendadaPara ? 'Notificação agendada com sucesso!' : 'Notificação enviada com sucesso!');
      return true;
    } catch (error) {
      console.error('Error creating admin notification:', error);
      toast.error('Erro ao enviar notificação');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAdminNotifications]);

  // Deletar notificação
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notificação deletada com sucesso!');
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Erro ao deletar notificação');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchAdminNotifications();
  }, [fetchAdminNotifications]);

  return {
    notifications,
    loading,
    createAdminNotification,
    deleteNotification,
    refreshNotifications: fetchAdminNotifications
  };
}
