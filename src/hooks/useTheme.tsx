
import { useContext } from 'react';
import { ThemeContext, Theme } from '../contexts/ThemeContext';

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  // Função para mudar o tema
  const changeTheme = (newTheme: Theme) => {
    context.setTheme(newTheme);
  };
  
  return {
    theme: context.theme,
    changeTheme,
    isLight: !context.theme.includes('dark'),
    isDark: context.theme.includes('dark'),
  };
}
