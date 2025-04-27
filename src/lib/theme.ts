
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
