
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ThemeContext, ThemeContextType, Theme } from './ThemeContext';

const defaultTheme: Theme = 'light';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);

  useEffect(() => {
    // Load theme from local storage or user preferences
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    }
  }, []);

  useEffect(() => {
    const isDark = theme.includes('dark');
    setIsDarkTheme(isDark);
    
    // Apply theme class to document
    const root = window.document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove('theme-light', 'theme-dark', 'theme-light-blue', 'theme-dark-purple');
    
    // Add the selected theme class
    root.classList.add(`theme-${theme}`);
    
    // Set the data attribute for tailwind dark mode
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
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
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export a custom hook for using the theme context
export const useThemeContext = () => useContext(ThemeContext);

// Re-export Theme type for convenience
export type { Theme };
export { ThemeContext };
