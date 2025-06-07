import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  created_at: string;
  dados_extras?: any;
  status?: string;
  user_id: string;
  read?: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Função para tocar o sino bem alto
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Criar o som do sino com múltiplas frequências harmônicas
      const playBellTone = (frequency: number, duration: number, startTime: number, volume: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // Envelope de volume para simular o sino
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
        gainNode.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + startTime + duration);
        
        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
      };

      // Tocar sino com frequências harmônicas (como um sino real)
      // Fundamental e harmônicos
      playBellTone(523, 1.5, 0, 0.6);    // Dó (fundamental) - bem alto
      playBellTone(659, 1.2, 0.05, 0.4); // Mi (terça maior)
      playBellTone(784, 1.0, 0.1, 0.3);  // Sol (quinta)
      playBellTone(1047, 0.8, 0.15, 0.2); // Dó oitava
      
      // Segunda batida do sino (eco)
      playBellTone(523, 1.2, 0.8, 0.4);
      playBellTone(659, 1.0, 0.85, 0.25);
      playBellTone(784, 0.8, 0.9, 0.2);
      
    } catch (error) {
      console.log('Erro ao tocar som da notificação:', error);
      
      // Fallback: tentar usar um beep simples mais alto
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 1000; // Frequência mais alta
        oscillator.type = 'square'; // Onda quadrada para som mais penetrante
        
        gainNode.gain.setValueAtTime(0.8, audioContext.currentTime); // Volume bem alto
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (fallbackError) {
        console.log('Erro no fallback do som:', fallbackError);
      }
    }
  }, []);

  // Função para mostrar notificação do navegador
  const showBrowserNotification = useCallback((notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.titulo, {
        body: notification.mensagem,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }, []);

  // Solicitar permissão para notificações do navegador
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Criar registro na tabela user_notification_reads
      const { error } = await supabase
        .from('user_notification_reads')
        .insert({
          user_id: session.user.id,
          notification_id: notificationId
        });

      if (error && error.code !== '23505') { // Ignora erro de duplicata
        console.error('Erro ao marcar notificação como lida:', error);
        return;
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  }, []);

  // Verificar se notificação foi lida
  const checkIfRead = useCallback(async (notifications: Notification[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || notifications.length === 0) return notifications;

      const notificationIds = notifications.map(n => n.id);
      
      const { data: reads } = await supabase
        .from('user_notification_reads')
        .select('notification_id')
        .eq('user_id', session.user.id)
        .in('notification_id', notificationIds);

      const readIds = new Set(reads?.map(r => r.notification_id) || []);
      
      return notifications.map(n => ({
        ...n,
        read: readIds.has(n.id)
      }));
    } catch (error) {
      console.error('Erro ao verificar notificações lidas:', error);
      return notifications;
    }
  }, []);

  // Carregar notificações iniciais
  const loadNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', 'enviada')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notificationsWithReads = await checkIfRead(data || []);
      setNotifications(notificationsWithReads);
      
      // Contar não lidas
      const unread = notificationsWithReads.filter(n => !n.read);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [checkIfRead]);

  // Escutar notificações em tempo real
  useEffect(() => {
    requestNotificationPermission();
    loadNotifications();

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        async (payload) => {
          const newNotification = payload.new as Notification;
          
          // Verificar se já foi lida
          const [notificationWithRead] = await checkIfRead([newNotification]);
          
          // Adicionar à lista
          setNotifications(prev => [notificationWithRead, ...prev]);
          
          if (!notificationWithRead.read) {
            setUnreadCount(prev => prev + 1);
            
            // Tocar som do sino bem alto
            playNotificationSound();
            
            // Mostrar toast
            toast.success(newNotification.titulo, {
              description: newNotification.mensagem,
              duration: 5000,
            });
            
            // Mostrar notificação do navegador
            showBrowserNotification(newNotification);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playNotificationSound, showBrowserNotification, requestNotificationPermission, loadNotifications, checkIfRead]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    loadNotifications
  };
}
