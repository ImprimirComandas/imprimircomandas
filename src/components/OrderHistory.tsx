
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types/order";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Printer } from "lucide-react";

interface OrderHistoryProps {
  orders: Order[];
  onViewOrder: (orderId: string) => void;
  onPrintOrder: (orderId: string) => void;
}

export default function OrderHistory({ orders, onViewOrder, onPrintOrder }: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Histórico de Comandas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            Nenhuma comanda gerada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Histórico de Comandas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.slice().reverse().map((order) => {
            const timeAgo = formatDistanceToNow(new Date(order.timestamp), { 
              addSuffix: true,
              locale: ptBR
            });
            
            return (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <div className="font-medium">Mesa {order.tableNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {timeAgo} • {order.items.length} itens • Atendente: {order.serverName}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onViewOrder(order.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onPrintOrder(order.id)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
