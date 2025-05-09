
// Re-export existing types
export interface Produto {
  nome: string;
  quantidade: number;
  valor: number;
}

export interface ProdutoFiltrado {
  id: string;
  nome: string;
  valor: number;
  numero?: number;
}

export interface Comanda {
  id: string;
  data: string;
  user_id: string;
  produtos: Produto[];
  total: number;
  forma_pagamento: '' | 'pix' | 'dinheiro' | 'cartao' | 'misto';
  pago: boolean;
  troco: number;
  quantiapaga: number;
  valor_cartao: number;
  valor_dinheiro: number;
  valor_pix: number;
  bairro: string;
  taxaentrega: number;
  endereco: string;
}

export type Theme = 'light' | 'dark' | 'light-blue' | 'dark-purple';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Re-export types from motoboy.ts
export * from './motoboy';
export * from './orders';

// Missing types for the delivery management system
export interface Entrega {
  id?: string;
  motoboy_id: string;
  comanda_id: string | null;
  bairro: string;
  origem: string;
  valor_entrega: number;
  valor_pedido?: number;
  forma_pagamento: string;
  pago: boolean;
  created_at?: string;
  user_id?: string;
}

// Motoboy interfaces
export interface Motoboy {
  id: string;
  nome: string;
  telefone?: string;
  status?: string;
  user_id?: string;
  created_at?: string;
  placa?: string;
  tipo_veiculo?: string;
}

export interface MotoboySession {
  id: string;
  motoboy_id: string;
  start_time: string;
  end_time?: string | null;
  status?: 'active' | 'completed' | 'cancelled';
  user_id?: string;
}

export interface ExtendedMotoboySession extends MotoboySession {
  duration?: string;
}

// DeliveryList interfaces
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
  onDeleteDelivery: (delivery: Entrega) => void;
  onEditDelivery: (delivery: Entrega) => void;
  showDeleteButton: boolean;
}

export interface DeliveryTableRowProps {
  delivery: Entrega;
  onDelete: (delivery: Entrega) => void;
  onEdit: (delivery: Entrega) => void;
  showDeleteButton: boolean;
}

export interface EditDeliveryDialogProps {
  open: boolean;
  loading: boolean;
  delivery: Entrega | null;
  bairros: any[];
  motoboys: Motoboy[];
  onOpenChange: (open: boolean) => void;
  onSave: (delivery: Entrega) => Promise<void>;
}

// TotaisPorStatusPagamento props
export interface TotaisPorStatusPagamentoProps {
  confirmados?: number;
  naoConfirmados?: number;
  total?: number;
  showValues?: boolean;
  toggleShowValues?: () => void;
}
