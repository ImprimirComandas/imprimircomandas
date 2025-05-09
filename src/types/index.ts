
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

// Update Entrega interface with all required properties and make id optional
export interface Entrega {
  id?: string;  // Made id optional to fix initialization errors
  motoboy_id: string;
  comanda_id?: string | null;
  data_entrega?: string;
  valor?: number;
  bairro?: string;
  origem?: string;
  status?: string;
  nome_cliente?: string;
  endereco?: string;
  motoboy_nome?: string;
  created_at?: string;
  valor_entrega?: number;
  valor_pedido?: number;
  forma_pagamento?: string;
  pago?: boolean;
  user_id?: string;
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

// Update DeliveryTableProps interface to include all required properties
export interface DeliveryTableProps {
  deliveries: Entrega[];
  onEdit?: (delivery: Entrega) => void;
  onDelete?: (delivery: Entrega) => void;  // Changed parameter type from string to Entrega
  onDeleteDelivery?: (delivery: Entrega) => void;
  onEditDelivery?: (delivery: Entrega) => void;
  showDeleteButton?: boolean;
}

// Update DeliveryTableRowProps interface to include all required properties
export interface DeliveryTableRowProps {
  delivery: Entrega;
  onEdit: (delivery: Entrega) => void;
  onDelete: (delivery: Entrega) => void;  // Changed parameter type from string to Entrega
  showDeleteButton?: boolean;
}

// Update EditDeliveryDialogProps interface to include all required properties
export interface EditDeliveryDialogProps {
  delivery: Entrega | null;
  isOpen?: boolean;
  open?: boolean;
  loading?: boolean;
  bairros?: any[];
  motoboys?: any[];
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSave: (delivery: Entrega) => void;
}

// Update TotaisPorStatusPagamentoProps interface to include all required properties
export interface TotaisPorStatusPagamentoProps {
  comandas?: any[];
  confirmados?: number;
  naoConfirmados?: number;
  total?: number;
  showValues?: boolean;
  toggleShowValues?: () => void;
}
