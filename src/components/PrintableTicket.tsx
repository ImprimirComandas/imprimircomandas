
import { Order } from "@/types/order";

interface PrintableTicketProps {
  order: Order;
}

export default function PrintableTicket({ order }: PrintableTicketProps) {
  const formattedDate = new Date(order.timestamp).toLocaleString();
  
  // Calcular o subtotal como a soma dos itens
  const subtotal = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  return (
    <div className="print-only font-mono p-4 max-w-[80mm] mx-auto text-black">
      <div className="text-center border-b border-black pb-2">
        <div className="font-bold text-lg mb-1">COMANDA</div>
        <div className="text-sm">Mesa: {order.tableNumber}</div>
        <div className="text-sm">Data: {formattedDate}</div>
        <div className="text-sm">Atendente: {order.serverName}</div>
      </div>
      
      <div className="border-b border-black py-2">
        <div className="font-bold">PEDIDO:</div>
        <table className="w-full text-sm mt-1">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left">Item</th>
              <th className="text-right">Qtd</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-dashed border-gray-400">
                <td className="text-left py-1">{item.name}</td>
                <td className="text-right py-1">{item.quantity}x</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-2 text-sm">
        {order.items.map((item) => (
          item.notes ? (
            <div key={item.id} className="mb-2">
              <div className="font-bold">{item.name}:</div>
              <div>{item.notes}</div>
            </div>
          ) : null
        ))}
      </div>
      
      <div className="text-center text-xs mt-4 pt-2 border-t border-black">
        ID: {order.id.slice(0, 8)} • Impresso em: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
