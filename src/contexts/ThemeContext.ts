
export type Theme = 'light' | 'dark' | 'light-blue' | 'dark-purple';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
