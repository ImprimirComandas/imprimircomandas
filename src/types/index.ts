
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

// Add missing type definitions
export interface Entrega {
  id: string;
  motoboy_id: string;
  comanda_id?: string;
  data_entrega: string;
  valor: number;
  bairro?: string;
  status?: string;
  nome_cliente?: string;
  endereco?: string;
  motoboy_nome?: string;
  created_at?: string;
}

export interface GroupedDeliveries {
  [motoboyId: string]: {
    motoboyName: string;
    deliveriesByDate: {
      [date: string]: Entrega[];
    };
    totalValue: number;
  };
}

export interface DeliveryTableProps {
  deliveries: Entrega[];
  onEdit: (delivery: Entrega) => void;
  onDelete: (id: string) => void;
}

export interface DeliveryTableRowProps {
  delivery: Entrega;
  onEdit: (delivery: Entrega) => void;
  onDelete: (id: string) => void;
}

export interface EditDeliveryDialogProps {
  delivery: Entrega;
  isOpen: boolean;
  onClose: () => void;
  onSave: (delivery: Entrega) => void;
}

export interface TotaisPorStatusPagamentoProps {
  comandas: any[];
}
