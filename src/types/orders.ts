
export interface Produto {
  nome: string;
  quantidade: number;
  valor: number;
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

export interface ProdutoFiltrado {
  id: string;
  nome: string;
  valor: number;
  numero?: number;
}

// Updated Motoboy interface to make telefone optional
export interface Motoboy {
  id: string;
  nome: string;
  telefone?: string; // Make telefone optional with ?
  created_at?: string;
  user_id?: string;
}

export interface MotoboySession {
  id: string;
  motoboy_id: string;
  start_time: string;
  end_time?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at?: string;
}
