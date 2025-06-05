
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealtimeNotification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  dados_extras?: any;
  created_at: string;
  lida: boolean;
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === 'granted');
      return permission === 'granted';
    }
    return false;
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Create audio context for beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((notification: RealtimeNotification) => {
    if (permissionGranted && 'Notification' in window) {
      const browserNotification = new Notification(notification.titulo, {
        body: notification.mensagem,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: true
      });

      browserNotification.onclick = () => {
        window.focus();
        markAsRead(notification.id);
        browserNotification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 10000);
    }
  }, [permissionGranted]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, lida: true } : n)
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Here you could also update the database if needed
      console.log('Marked notification as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Handle new notification
  const handleNewNotification = useCallback((notification: RealtimeNotification) => {
    console.log('New notification received:', notification);
    
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Play sound
    playNotificationSound();
    
    // Show browser notification
    showBrowserNotification(notification);
    
    // Show toast notification
    toast(notification.titulo, {
      description: notification.mensagem,
      duration: 5000,
      action: {
        label: 'Marcar como lida',
        onClick: () => markAsRead(notification.id)
      }
    });
  }, [playNotificationSound, showBrowserNotification, markAsRead]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    // Request permission on mount
    requestNotificationPermission();

    // Set up realtime listener for notifications
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification: RealtimeNotification = {
            id: payload.new.id,
            titulo: payload.new.titulo,
            mensagem: payload.new.mensagem,
            tipo: payload.new.tipo,
            dados_extras: payload.new.dados_extras,
            created_at: payload.new.created_at,
            lida: false
          };
          
          handleNewNotification(newNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleNewNotification, requestNotificationPermission]);

  return {
    notifications,
    unreadCount,
    permissionGranted,
    requestNotificationPermission,
    markAsRead,
    clearAllNotifications,
    markAllAsRead,
    playNotificationSound
  };
}
