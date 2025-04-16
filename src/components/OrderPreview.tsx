
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types/order";
import { Printer } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderPreviewProps {
  order: Order;
  onPrint: () => void;
}

export default function OrderPreview({ order, onPrint }: OrderPreviewProps) {
  const formattedDate = new Date(order.timestamp).toLocaleString();
  const timeAgo = formatDistanceToNow(new Date(order.timestamp), { 
    addSuffix: true,
    locale: ptBR
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Comanda: Mesa {order.tableNumber}</span>
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="mr-1 h-4 w-4" /> Imprimir
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div id="print-content" className="space-y-4">
          <div className="border-b pb-2">
            <div className="text-sm text-muted-foreground">{formattedDate} ({timeAgo})</div>
            <div className="text-sm">Atendente: {order.serverName}</div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Itens</h3>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="py-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span>Qtd: {item.quantity}</span>
                  </div>
                  {item.notes && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      Obs: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <div className="text-sm text-muted-foreground">ID: {order.id.slice(0, 8)}</div>
      </CardFooter>
    </Card>
  );
}
