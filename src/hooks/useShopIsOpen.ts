
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useShopIsOpen = () => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkShopStatus = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsShopOpen(false);
          return;
        }

        const { data, error } = await supabase
          .from('shop_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .is('end_time', null)
          .order('start_time', { ascending: false })
          .limit(1);

        if (error) throw error;
        setIsShopOpen(data && data.length > 0);
      } catch (error) {
        console.error('Erro ao verificar status da loja:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkShopStatus();
    
    // Atualizar a cada minuto
    const interval = setInterval(checkShopStatus, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { isShopOpen, isLoading };
};
