
// Import and re-export all types from other files
export * from './motoboy';
export * from './orders';

// Re-export from ThemeContext to avoid circular dependencies
import { Theme } from '../contexts/ThemeContext';
export type { Theme };

// Define theme-related options interfaces
export interface ThemeClassOptions {
  light?: string;
  dark?: string;
  lightBlue?: string;
  darkPurple?: string;
  default?: string;
}

// Define ExtendedMotoboySession interface
export interface ExtendedMotoboySession {
  id?: string;
  motoboy_id: string;
  start_time: string;
  end_time?: string | null;
  duration?: string;
  status?: 'active' | 'completed' | 'cancelled';
  user_id?: string;
}

export interface Motoboy {
  id: string;
  nome: string;
  telefone: string;
  placa?: string;
  ativo: boolean;
  created_at?: string;
}
