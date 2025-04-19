
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'light-blue' | 'dark-purple';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check local storage first
    const storedTheme = localStorage.getItem('app-theme');
    if (storedTheme && ['light', 'dark', 'light-blue', 'dark-purple'].includes(storedTheme)) {
      return storedTheme as Theme;
    }
    
    // If no stored preference, check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light-blue)').matches) {
      return 'dark';
    }
    
    // Default to light theme
    return 'light';
  });
  
  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('app-theme', theme);
    
    // Remove all theme classes first
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-light-blue', 'theme-dark-purple');
    
    // Add the selected theme class
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Set the data attribute for tailwind dark mode
    if (theme.includes('dark')) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Function to change the theme
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
