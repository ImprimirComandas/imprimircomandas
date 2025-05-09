
import { useContext } from 'react';
import { useThemeContext, Theme } from '../contexts/ThemeContext.tsx';
import { getThemeClasses, isDarkTheme as isThemeDark } from '../lib/theme';

export function useTheme() {
  const { theme, setTheme, isDarkTheme } = useThemeContext();
  
  // Function to change the theme
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };
  
  return {
    theme,
    changeTheme,
    getThemeClasses: (options: any) => getThemeClasses(theme, options),
    isDark: isDarkTheme,
    isLight: !isDarkTheme,
  };
}
