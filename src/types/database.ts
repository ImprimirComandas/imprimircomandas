
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
  numero?: number;
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

export interface BairroTaxa {
  id: string;
  nome: string;
  taxa: number;
  user_id: string;
}

export interface ShopSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  created_at: string;
}
export interface Comanda {
  id?: string;
  produtos: Produto[];
  endereco: string;
  bairro: string;
  taxaentrega: number;
  total: number;
  forma_pagamento: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '';
  pago: boolean;
  pagamentoMisto?: {
    cartao: number;
    dinheiro: number;
    pix: number;
    troco: number;
  } | null;
}