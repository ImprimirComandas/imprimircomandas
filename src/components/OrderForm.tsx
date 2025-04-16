
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderItem } from "@/types/order";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface OrderFormProps {
  onSubmit: (tableNumber: string, serverName: string, items: OrderItem[]) => void;
}

export default function OrderForm({ onSubmit }: OrderFormProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [serverName, setServerName] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { id: uuidv4(), name: "", quantity: 1, notes: "" }
  ]);

  const addItem = () => {
    setItems([...items, { id: uuidv4(), name: "", quantity: 1, notes: "" }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(tableNumber, serverName, items);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Nova Comanda</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tableNumber">Mesa/Número</Label>
              <Input
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Número da mesa"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serverName">Atendente</Label>
              <Input
                id="serverName"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="Nome do atendente"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Itens</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" /> Adicionar Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="space-y-2 p-3 border rounded-md">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="md:col-span-2 space-y-1">
                    <Label htmlFor={`item-name-${item.id}`}>Nome</Label>
                    <Input
                      id={`item-name-${item.id}`}
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      placeholder="Item"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`item-quantity-${item.id}`}>Qtd</Label>
                    <Input
                      id={`item-quantity-${item.id}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`item-notes-${item.id}`}>Observações</Label>
                  <Textarea
                    id={`item-notes-${item.id}`}
                    value={item.notes}
                    onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                    placeholder="Observações especiais"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Gerar Comanda</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
