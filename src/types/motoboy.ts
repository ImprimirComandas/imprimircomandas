
export interface MotoboySession {
  id: string;
  motoboy_id: string;
  start_time: string;
  end_time?: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Delivery {
  id: string;
  bairro: string;
  data: string;
  valor: number;
  motoboy_id?: string;
  motoboy_nome?: string;
}
