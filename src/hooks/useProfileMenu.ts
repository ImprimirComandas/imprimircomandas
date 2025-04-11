
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useProfileMenu = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        throw error;
      }
      console.log('Usuário deslogado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    }
  };

  return {
    showProfileMenu,
    setShowProfileMenu,
    handleSignOut
  };
};
