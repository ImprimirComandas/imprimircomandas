
import { createContext } from 'react';

export type Theme = 'light' | 'dark' | 'light-blue' | 'dark-purple' | string;

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkTheme: boolean;
}

// Create a default context with empty values
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  isDarkTheme: false,
});

export default ThemeContext;
