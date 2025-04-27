
// Re-export all types from the database.ts file
export * from './database';

// Additional types
export interface Motoboy {
  id: string;
  nome: string;
  telefone?: string;  // Making telefone optional
  user_id: string;
  status: string;
  created_at: string;
  plate?: string;
  vehicle_type?: string;
}

export interface MotoboySession {
  id: string;
  motoboy_id: string;
  start_time: string;
  end_time: string | null;
  user_id: string;
}

export interface ExtendedMotoboySession extends MotoboySession {
  duration?: string;
}

export interface Entrega {
  motoboy_id: string;
  comanda_id: string | null;
  bairro: string;
  origem: string;
  valor_entrega: number;
  valor_pedido: number;
  forma_pagamento: string;
  user_id?: string;
  id?: string;
  created_at?: string;
  pago: boolean;
  status?: string;
}

export interface Delivery {
  id: string;
  motoboy_id: string;
  bairro: string;
  user_id: string;
  created_at: string;
  valor_entrega: number;
  origem: string;
  valor_pedido: number;
  forma_pagamento: string;
  comanda_id?: string | null;
  pago: boolean;
  status?: string;
}

export interface BairroTaxa {
  id?: string;
  nome: string;
  taxa: number;
  user_id?: string;
}

export interface GroupedDeliveries {
  [motoboyId: string]: {
    motoboyName: string;
    deliveriesByDate: {
      [date: string]: Entrega[];
    };
    totalValue: number;
  }
}

export interface DeliveryTableProps {
  deliveries: Entrega[];
  onDeleteDelivery: (delivery: Entrega) => void;
  onEditDelivery: (delivery: Entrega) => void;
  showDeleteButton?: boolean;
}

export interface DeliveryTableRowProps {
  delivery: Entrega;
  onDelete: (delivery: Entrega) => void;
  onEdit: (delivery: Entrega) => void;
  showDeleteButton?: boolean;
}

export interface EditDeliveryDialogProps {
  open: boolean;
  loading: boolean;
  delivery: Entrega | null;
  bairros: BairroTaxa[];
  motoboys: Motoboy[];
  onOpenChange: (open: boolean) => void;
  onSave: (delivery: Entrega) => void;
}

export interface Profile {
  id: string;
  avatar_url?: string | null;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  store_name?: string | null;
  theme?: string | null;
  updated_at?: string | null;
}

// Adding necessary props interfaces for Header components
export interface ShopStatusButtonProps {
  className?: string; // Add className property
}

export interface ProfileMenuProps {
  profile: Profile | null;
  onSignOut: () => Promise<void>;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  className?: string; // Add className property
}

export interface MobileMenuProps {
  pathname: string;
  className?: string; // Add className property
}

export interface TotaisPorStatusPagamentoProps {
  confirmados?: number;
  naoConfirmados?: number;
  total?: number;
  showValues?: boolean;
  toggleShowValues?: () => void;
}

export interface MotoboyListProps {
  motoboys: Motoboy[];
  sessions: MotoboySession[];
  loading: boolean;
  sessionLoading: boolean;
  onMotoboyDeleted: () => Promise<void>;
  onSessionStatusChanged: () => Promise<void>; 
  onSessionAdded?: () => void;
  onSessionEnded?: () => void;
  onToggleStatus?: (id: string, currentStatus: string) => Promise<void>;
}

export interface SessionHistoryProps {
  sessions: MotoboySession[];
  motoboys: Motoboy[];
  onRefresh: () => void;
}

export interface AddMotoboyFormProps {
  onMotoboyAdded: () => void;
  onCancel: () => void;
}
