
import { useState } from "react";
import { OrderItem, Order } from "@/types/order";
import OrderForm from "@/components/OrderForm";
import OrderPreview from "@/components/OrderPreview";
import OrderHistory from "@/components/OrderHistory";
import PrintableTicket from "@/components/PrintableTicket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from "uuid";
import "../styles/print.css";

const Index = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState("new");

  const handleCreateOrder = (tableNumber: string, serverName: string, items: OrderItem[]) => {
    const newOrder: Order = {
      id: uuidv4(),
      tableNumber,
      serverName,
      items: items.filter(item => item.name.trim() !== ""),
      timestamp: Date.now()
    };
    
    setOrders([...orders, newOrder]);
    setCurrentOrder(newOrder);
    setActiveTab("preview");
  };

  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setCurrentOrder(order);
      setActiveTab("preview");
    }
  };

  const handlePrintOrder = (orderId?: string) => {
    const orderToPrint = orderId 
      ? orders.find(o => o.id === orderId) 
      : currentOrder;
      
    if (orderToPrint) {
      // We set the current order to ensure the PrintableTicket has the right data
      setCurrentOrder(orderToPrint);
      
      // Small timeout to ensure the print ticket component is rendered
      setTimeout(() => {
        window.print();
      }, 100);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Sistema de Comandas</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="new">Nova Comanda</TabsTrigger>
          <TabsTrigger value="preview" disabled={!currentOrder}>Visualizar</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
          <OrderForm onSubmit={handleCreateOrder} />
        </TabsContent>
        
        <TabsContent value="preview">
          {currentOrder && (
            <OrderPreview 
              order={currentOrder} 
              onPrint={() => handlePrintOrder()} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <OrderHistory 
            orders={orders} 
            onViewOrder={handleViewOrder} 
            onPrintOrder={handlePrintOrder} 
          />
        </TabsContent>
      </Tabs>
      
      {/* Hidden printable component */}
      <div className="print-only">
        {currentOrder && <PrintableTicket order={currentOrder} />}
      </div>
    </div>
  );
};

export default Index;
