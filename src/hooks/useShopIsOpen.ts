
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

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

  const handleSetIsShopOpen = async (isOpen: boolean) => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Sessão expirada, faça login novamente');
        return;
      }
      
      if (isOpen) {
        // Abrir a loja - criar nova sessão
        const { error } = await supabase
          .from('shop_sessions')
          .insert({
            user_id: session.user.id,
            start_time: new Date().toISOString(),
          });
        
        if (error) throw error;
        toast.success('Loja aberta com sucesso');
      } else {
        // Fechar a loja - atualizar a sessão atual
        const { data, error: fetchError } = await supabase
          .from('shop_sessions')
          .select('id')
          .eq('user_id', session.user.id)
          .is('end_time', null)
          .order('start_time', { ascending: false })
          .limit(1);
        
        if (fetchError) throw fetchError;
        
        if (data && data.length > 0) {
          const { error: updateError } = await supabase
            .from('shop_sessions')
            .update({ end_time: new Date().toISOString() })
            .eq('id', data[0].id);
          
          if (updateError) throw updateError;
          toast.success('Loja fechada com sucesso');
        }
      }
      
      setIsShopOpen(isOpen);
    } catch (error) {
      console.error('Erro ao alterar status da loja:', error);
      toast.error('Erro ao alterar status da loja');
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    isShopOpen, 
    setIsShopOpen: handleSetIsShopOpen, 
    isLoading 
  };
};
