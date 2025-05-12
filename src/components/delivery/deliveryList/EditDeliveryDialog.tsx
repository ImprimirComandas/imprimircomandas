
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { EditDeliveryDialogProps, Entrega } from "@/types";

export default function EditDeliveryDialog({
  open,
  loading,
  delivery,
  bairros,
  motoboys,
  onOpenChange,
  onSave,
}: EditDeliveryDialogProps) {
  const [editedDelivery, setEditedDelivery] = useState<Entrega | null>(null);

  useEffect(() => {
    // This will ensure that whenever the delivery prop changes,
    // we update our local state with a fresh copy
    if (delivery) {
      setEditedDelivery({ ...delivery });
    }
  }, [delivery, open]);

  if (!editedDelivery) return null;

  const handleInputChange = (name: keyof Entrega, value: any) => {
    setEditedDelivery(prev => {
      if (!prev) return prev;
      
      if (name === 'bairro') {
        const selectedBairro = bairros.find(b => b.nome === value);
        return {
          ...prev,
          [name]: value,
          valor_entrega: selectedBairro?.taxa || prev.valor_entrega
        };
      }
      
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleSave = () => {
    if (editedDelivery) {
      onSave(editedDelivery);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-foreground bg-background">
        <DialogHeader>
          <DialogTitle>Editar Entrega</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="motoboy" className="text-right text-foreground">
              Motoboy
            </Label>
            <div className="col-span-3">
              <Select
                value={editedDelivery.motoboy_id}
                onValueChange={(value) => handleInputChange('motoboy_id', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um motoboy" />
                </SelectTrigger>
                <SelectContent>
                  {motoboys.map(motoboy => (
                    <SelectItem key={motoboy.id} value={motoboy.id}>
                      {motoboy.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bairro" className="text-right text-foreground">
              Bairro
            </Label>
            <div className="col-span-3">
              <Select
                value={editedDelivery.bairro}
                onValueChange={(value) => handleInputChange('bairro', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um bairro" />
                </SelectTrigger>
                <SelectContent>
                  {bairros.map(bairro => (
                    <SelectItem key={bairro.id} value={bairro.nome}>
                      {bairro.nome} (R$ {bairro.taxa.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="origem" className="text-right text-foreground">
              Origem
            </Label>
            <div className="col-span-3">
              <Select
                value={editedDelivery.origem}
                onValueChange={(value) => handleInputChange('origem', value as any)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="ifood">iFood</SelectItem>
                  <SelectItem value="ze_delivery">Zé Delivery</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="valor_entrega" className="text-right text-foreground">
              Valor da Entrega
            </Label>
            <div className="col-span-3">
              <Input 
                id="valor_entrega"
                type="number" 
                value={editedDelivery.valor_entrega}
                onChange={(e) => handleInputChange('valor_entrega', parseFloat(e.target.value) || 0)}
                disabled={loading}
                step="0.01"
                min="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="forma_pagamento" className="text-right text-foreground">
              Forma de Pagamento
            </Label>
            <div className="col-span-3">
              <Select
                value={editedDelivery.forma_pagamento || ""}
                onValueChange={(value) => handleInputChange('forma_pagamento', value as any)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="misto">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pago" className="text-right text-foreground">
              Pedido Pago
            </Label>
            <div className="col-span-3 flex items-center">
              <Checkbox
                id="pago"
                checked={editedDelivery.pago}
                onCheckedChange={(checked) => handleInputChange('pago', !!checked)}
                disabled={loading}
              />
              <Label htmlFor="pago" className="ml-2 text-foreground">
                Pedido já está pago
              </Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
