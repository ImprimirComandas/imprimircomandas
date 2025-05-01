
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import type { Theme } from '../contexts/ThemeContext';

export function useTheme() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  // Função para mudar o tema
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };
  
  return {
    theme,
    changeTheme,
    isLight: !theme.includes('dark'),
    isDark: theme.includes('dark'),
  };
}
