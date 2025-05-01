
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from './ThemeContext';
import { supabase } from '../lib/supabase';

const defaultTheme: Theme = 'light';

export const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: defaultTheme,
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // Carrega o tema quando o componente é montado
  useEffect(() => {
    const loadTheme = async () => {
      // Primeiro verificar se há um tema no localStorage
      const savedTheme = localStorage.getItem('theme') as Theme;
      
      if (savedTheme && ['light', 'dark', 'light-blue', 'dark-purple'].includes(savedTheme)) {
        setTheme(savedTheme);
      } else {
        // Se não houver tema no localStorage, tentar carregar do perfil do usuário
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data } = await supabase
            .from('profiles')
            .select('theme')
            .eq('id', session.user.id)
            .single();
          
          if (data?.theme && ['light', 'dark', 'light-blue', 'dark-purple'].includes(data.theme)) {
            setTheme(data.theme);
            localStorage.setItem('theme', data.theme);
          }
        }
      }
    };

    loadTheme();
  }, []);

  // Aplicar o tema sempre que ele mudar
  useEffect(() => {
    const root = document.documentElement;
    
    // Remover todas as classes de tema anteriores
    root.classList.remove('theme-light', 'theme-dark', 'theme-light-blue', 'theme-dark-purple');
    
    // Adicionar a nova classe de tema
    root.classList.add(`theme-${theme}`);
    
    // Configurar dark mode para o Tailwind
    if (theme.includes('dark')) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Salvar no localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSetTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    
    // Salvar no perfil do usuário se estiver autenticado
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase
          .from('profiles')
          .update({ theme: newTheme })
          .eq('id', session.user.id);
      }
    } catch (error) {
      console.error('Erro ao salvar tema no perfil:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
