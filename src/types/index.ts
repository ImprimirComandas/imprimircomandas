
export interface Comanda {
  id?: string;
  created_at?: string;
  cliente?: string;
  telefone?: string;
  endereco: string;
  bairro: string;
  total: number;
  subtotal?: number;
  taxa_entrega?: number;
  taxaentrega: number; // Changed from optional to required to match database.ts
  observacoes?: string;
  itens?: Item[];
  produtos: Produto[];
  pagamento_confirmado?: boolean;
  forma_pagamento: "" | "pix" | "dinheiro" | "cartao" | "misto";
  troco?: number;
  quantiapaga?: number;
  pago: boolean;
  cliente_id?: string;
  motoboy_id?: string;
  status?: string;
  data: string;
  user_id?: string;
  valor_cartao?: number;
  valor_dinheiro?: number;
  valor_pix?: number;
}

export interface Item {
  id?: string;
  produto?: string;
  quantidade?: number;
  preco?: number;
  comanda_id?: string;
}

export interface BairroTaxa {
  id?: string;
  nome: string;
  taxa: number;
}

export interface Motoboy {
  id?: string;
  nome: string;
  telefone?: string;
  email?: string;
  disponivel?: boolean;
}

export interface Produto {
  id?: string;
  nome: string;
  preco?: number;
  valor: number; // Changed from optional to required to match database.ts
  categoria?: string;
  descricao?: string;
  imagem_url?: string;
  quantidade: number; // Changed from optional to required to match database.ts
}

export interface ProdutoFiltrado {
  id: string;
  nome: string;
  valor: number;
  numero?: number;
}

export interface Categoria {
  id?: string;
  nome: string;
}

export interface Cliente {
  id?: string;
  nome: string;
  telefone: string;
  endereco: string;
  bairro: string;
}

export interface MotoboySession {
  id?: string;
  motoboy_id: string;
  start_time: string;
  end_time?: string;
}

export interface ExtendedMotoboySession extends MotoboySession {
  duration?: string;
  motoboy_nome?: string;
}

export interface DeliveryStats {
  total: number;
  byNeighborhood: {
    bairro: string;
    count: number;
  }[];
}

export interface GrowthChartData {
  name: string;
  Pedidos: number;
  Valor: number;
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
  onDeleteDelivery?: (delivery: Entrega) => void;
  onEditDelivery?: (delivery: Entrega) => void;
  showDeleteButton?: boolean;
}

export interface DeliveryTableRowProps {
  delivery: Entrega;
  onDelete: (delivery: Entrega) => void;
  onEdit: (delivery: Entrega) => void;
  showDeleteButton?: boolean;
}

export interface Entrega {
  id?: string;
  created_at?: string;
  motoboy_id: string;
  comanda_id: string | null;
  bairro: string;
  origem: string;
  valor_entrega: number;
  valor_pedido: number;
  forma_pagamento: string;
  pago: boolean;
}

export interface EditDeliveryDialogProps {
  open: boolean;
  loading: boolean;
  delivery: Entrega | null;
  bairros: any[];
  motoboys: any[];
  onOpenChange: (open: boolean) => void;
  onSave: (delivery: Entrega) => void;
}

export interface TotaisPorStatusPagamentoProps {
  totais?: {
    confirmados: number;
    naoConfirmados: number;
    total: number;
  };
  confirmados?: number;
  naoConfirmados?: number;
  total?: number;
  showValues?: boolean;
  toggleShowValues?: () => void;
}
