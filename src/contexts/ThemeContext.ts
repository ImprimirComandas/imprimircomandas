
export type Theme = 'light' | 'dark' | 'light-blue' | 'dark-purple' | string;

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
