
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type Theme = 'light' | 'dark' | 'light-blue' | 'dark-purple' | 'dark-green' | 'supabase' | string;

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkTheme: boolean;
}

// Create the context with default values
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark-green',
  setTheme: () => {},
  isDarkTheme: true,
});

const defaultTheme: Theme = 'dark-green'; // Changed to dark-green theme

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);

  useEffect(() => {
    // Load theme from local storage or user preferences
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Use dark-green theme as default
      setTheme('dark-green');
    }
  }, []);

  useEffect(() => {
    const isDark = theme.includes('dark') || theme === 'supabase'; // Supabase is dark
    setIsDarkTheme(isDark);
    
    // Apply theme class to document
    const root = window.document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove(
      'theme-light', 
      'theme-dark', 
      'theme-light-blue', 
      'theme-dark-purple', 
      'theme-dark-green',
      'theme-supabase'
    );
    
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
