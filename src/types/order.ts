
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  serverName: string;
  items: OrderItem[];
  timestamp: number;
}
