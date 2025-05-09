
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

export interface Delivery {
  id: string;
  bairro: string;
  data: string;
  valor: number;
  motoboy_id?: string;
  motoboy_nome?: string;
}
