
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useShopIsOpen = () => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    const checkShopStatus = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsShopOpen(false);
          setCurrentSessionId(null);
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
        
        if (data && data.length > 0) {
          console.log("Active shop session found:", data[0].id);
          setIsShopOpen(true);
          setCurrentSessionId(data[0].id);
        } else {
          console.log("No active shop session found");
          setIsShopOpen(false);
          setCurrentSessionId(null);
        }
      } catch (error) {
        console.error('Erro ao verificar status da loja:', error);
        setIsShopOpen(false);
        setCurrentSessionId(null);
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
        const { data, error } = await supabase
          .from('shop_sessions')
          .insert({
            user_id: session.user.id,
            start_time: new Date().toISOString(),
          })
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setCurrentSessionId(data[0].id);
          console.log("New shop session created:", data[0].id);
          setIsShopOpen(true);
          toast.success('Loja aberta com sucesso');
        }
      } else {
        // Fechar a loja - atualizar a sessão atual
        if (!currentSessionId) {
          const { data, error: fetchError } = await supabase
            .from('shop_sessions')
            .select('id')
            .eq('user_id', session.user.id)
            .is('end_time', null)
            .order('start_time', { ascending: false })
            .limit(1);
          
          if (fetchError) throw fetchError;
          
          if (data && data.length > 0) {
            setCurrentSessionId(data[0].id);
          } else {
            toast.error('Não foi possível encontrar uma sessão aberta');
            setIsLoading(false);
            return;
          }
        }
        
        console.log("Closing shop session:", currentSessionId);
        const { error: updateError } = await supabase
          .from('shop_sessions')
          .update({ end_time: new Date().toISOString() })
          .eq('id', currentSessionId);
        
        if (updateError) {
          console.error("Error closing shop:", updateError);
          throw updateError;
        }
        
        setIsShopOpen(false);
        setCurrentSessionId(null);
        toast.success('Loja fechada com sucesso');
      }
    } catch (error: any) {
      console.error('Erro ao alterar status da loja:', error);
      toast.error('Erro ao alterar status da loja: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    isShopOpen, 
    setIsShopOpen: handleSetIsShopOpen, 
    isLoading,
    currentSessionId
  };
};
