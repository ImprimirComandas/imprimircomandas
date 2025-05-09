
import { type Theme } from "../contexts/ThemeContext";

/**
 * Gets the appropriate CSS classes for a UI component based on the current theme
 */
export function getThemeClasses(theme: Theme, options: {
  light?: string;
  dark?: string;
  lightBlue?: string;
  darkPurple?: string;
  default?: string;
}) {
  switch (theme) {
    case 'light':
      return options.light || options.default || '';
    case 'dark':
      return options.dark || options.default || '';
    case 'light-blue':
      return options.lightBlue || options.light || options.default || '';
    case 'dark-purple':
      return options.darkPurple || options.dark || options.default || '';
    default:
      return options.default || '';
  }
}

/**
 * Determines if a theme is considered "dark" for color contrast purposes
 */
export function isDarkTheme(theme: Theme) {
  return theme.includes('dark');
}

/**
 * Gets background classes based on current theme
 */
export function getBackgroundClasses(theme: Theme) {
  switch (theme) {
    case 'light':
      return 'bg-background text-foreground';
    case 'dark':
      return 'bg-background text-foreground';
    case 'light-blue':
      return 'bg-background text-foreground';
    case 'dark-purple':
      return 'bg-background text-foreground';
    default:
      return 'bg-background text-foreground';
  }
}

/**
 * Gets card classes based on current theme
 */
export function getCardClasses(theme: Theme) {
  return 'bg-card text-card-foreground border border-border rounded-lg shadow-sm';
}

/**
 * Gets button classes based on current theme and variant
 */
export function getButtonClasses(theme: Theme, variant: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' = 'default') {
  const baseClasses = 'rounded-md px-4 py-2 font-medium transition-colors';
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} bg-primary text-primary-foreground hover:bg-primary/90`;
    case 'secondary':
      return `${baseClasses} bg-secondary text-secondary-foreground hover:bg-secondary/80`;
    case 'destructive':
      return `${baseClasses} bg-destructive text-destructive-foreground hover:bg-destructive/90`;
    case 'outline':
      return `${baseClasses} border border-input bg-background hover:bg-accent hover:text-accent-foreground`;
    case 'ghost':
      return `${baseClasses} hover:bg-accent hover:text-accent-foreground`;
    default:
      return `${baseClasses} bg-primary text-primary-foreground hover:bg-primary/90`;
  }
}
