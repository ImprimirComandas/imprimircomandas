
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, ThemeContextType } from './ThemeContext';
import { supabase } from '../lib/supabase';

const defaultTheme: Theme = 'light';

export const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    // Load theme from local storage or user preferences
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme class to document
    const root = window.document.documentElement;
    const isDark = newTheme.includes('dark');
    
    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
    
    // Save to user profile if logged in
    const saveThemeToProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('profiles')
          .update({ theme: newTheme })
          .eq('id', session.user.id);
      }
    };
    
    saveThemeToProfile().catch(console.error);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
