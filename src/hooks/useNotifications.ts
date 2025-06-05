
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Comanda } from '@/types';

export function useNotifications() {
  const [loading, setLoading] = useState(false);

  const createNotification = useCallback(async (
    comanda: Comanda,
    tipo: 'nova_comanda' | 'pagamento_confirmado' | 'comanda_cancelada'
  ) => {
    try {
      setLoading(true);
      
      let titulo = '';
      let mensagem = '';
      
      switch (tipo) {
        case 'nova_comanda':
          titulo = 'Nova Comanda';
          mensagem = `Nova comanda #${comanda.id?.slice(-8)} - ${comanda.bairro} - R$ ${comanda.total.toFixed(2)}`;
          break;
        case 'pagamento_confirmado':
          titulo = 'Pagamento Confirmado';
          mensagem = `Pagamento confirmado para comanda #${comanda.id?.slice(-8)} - R$ ${comanda.total.toFixed(2)}`;
          break;
        case 'comanda_cancelada':
          titulo = 'Comanda Cancelada';
          mensagem = `Comanda #${comanda.id?.slice(-8)} foi cancelada`;
          break;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return false;
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          criada_por: user.id,
          tipo,
          titulo,
          mensagem,
          dados_extras: {
            comanda_id: comanda.id,
            taxa_entrega: comanda.taxaentrega,
            bairro: comanda.bairro,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        });

      if (error) throw error;

      // Send notification to external app
      await supabase.functions.invoke('send-notification', {
        body: {
          notification_id: comanda.id,
          titulo,
          mensagem,
          taxa_entrega: comanda.taxaentrega,
          bairro: comanda.bairro,
          tipo
        }
      });

      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const markNotificationAsSeen = useCallback(async (
    notificationId: string,
    deviceToken: string
  ) => {
    try {
      const { error } = await supabase
        .from('notification_tracking')
        .update({
          visualizada_em: new Date().toISOString(),
          status: 'visualizada'
        })
        .eq('notification_id', notificationId)
        .eq('device_token_id', deviceToken);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as seen:', error);
      return false;
    }
  }, []);

  return {
    loading,
    createNotification,
    markNotificationAsSeen
  };
}
