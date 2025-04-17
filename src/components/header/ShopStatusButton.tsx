
import { useState } from 'react';
import { DoorOpen, DoorClosed } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface ShopStatusButtonProps {
  isShopOpen: boolean;
  setIsShopOpen: (isOpen: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export default function ShopStatusButton({ 
  isShopOpen, 
  setIsShopOpen, 
  isLoading, 
  setIsLoading 
}: ShopStatusButtonProps) {
  
  const toggleShopStatus = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      if (isShopOpen) {
        const { data: sessions, error: fetchError } = await supabase
          .from('shop_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .is('end_time', null)
          .order('start_time', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        if (sessions && sessions.length > 0) {
          const { error: updateError } = await supabase
            .from('shop_sessions')
            .update({ end_time: new Date().toISOString() })
            .eq('id', sessions[0].id);

          if (updateError) throw updateError;
          toast.success('Loja fechada com sucesso');
        }
      } else {
        const { error } = await supabase
          .from('shop_sessions')
          .insert([
            {
              user_id: session.user.id,
              start_time: new Date().toISOString(),
              end_time: null,
            },
          ]);

        if (error) throw error;
        toast.success('Loja aberta com sucesso');
      }

      setIsShopOpen(!isShopOpen);
    } catch (error) {
      console.error('Erro ao alterar status da loja:', error);
      if (error instanceof Error) {
        toast.error(`Erro ao alterar status da loja: ${error.message}`);
      } else {
        toast.error('Erro ao alterar status da loja');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleShopStatus}
      disabled={isLoading}
      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isShopOpen
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-red-600 hover:bg-red-700'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isShopOpen ? (
        <DoorOpen className="h-5 w-5 mr-1" />
      ) : (
        <DoorClosed className="h-5 w-5 mr-1" />
      )}
      <span>{isShopOpen ? 'Loja Aberta' : 'Loja Fechada'}</span>
    </button>
  );
}
