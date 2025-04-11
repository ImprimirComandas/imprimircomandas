
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';
import { toast } from 'sonner';

export const useAuth = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        // Use setTimeout to avoid potential deadlocks with Supabase client
        setTimeout(() => {
          getProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        getProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getProfile = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar perfil do usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        toast.error('Erro ao fazer logout. Tente novamente.');
        throw error;
      }
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      toast.success('Login realizado com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer login');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao fazer login' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      
      // Register the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) throw error;
      
      toast.success('Verifique seu email para confirmar sua conta!', {
        duration: 5000
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao cadastrar' 
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#reset-password',
      });
      
      if (error) throw error;
      toast.success('Instruções para redefinir a senha foram enviadas para o seu e-mail');
      return { success: true };
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao solicitar redefinição de senha');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao solicitar redefinição de senha' 
      };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ 
        password
      });
      
      if (error) throw error;
      toast.success('Senha atualizada com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar senha');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar senha' 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    showProfileMenu,
    setShowProfileMenu,
    handleSignOut,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    user,
    profile,
    loading
  };
};
