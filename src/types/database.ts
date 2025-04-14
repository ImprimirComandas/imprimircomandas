
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  store_name: string;
  avatar_url: string | null;
  updated_at: string;
}

export interface AuthError {
  message: string;
}

export interface Produto {
  nome: string;
  valor: number;
  quantidade: number;
}

export interface Comanda {
  id?: string;
  user_id?: string;
  produtos: Produto[];
  total: number;
  forma_pagamento: 'pix' | 'dinheiro' | 'cartao' | '' | 'misto';
  data: string;
  endereco: string;
  bairro: string;
  taxaentrega: number;
  pago: boolean;
  created_at?: string;
  quantiapaga?: number;
  troco?: number;
  valor_cartao?: number;
  valor_dinheiro?: number;
  valor_pix?: number;
}
export interface Produto {
  id?: string;
  nome: string;
  valor: number;
  quantidade: number;
}

export interface Comanda {
  id?: string;
  produtos: Produto[];
  endereco: string;
  bairro: string;
  forma_pagamento: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '';
  pago: boolean;
  total: number;
  taxaentrega: number;
  troco?: number | null;
  order_date: string; // Changed from 'data'
  pagamento_misto?: { cartao: number; dinheiro: number; pix: number } | null;
}

export interface Profile {
  id: string;
}
