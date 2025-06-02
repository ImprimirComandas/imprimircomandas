
import React from 'react';
import { X, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OrderEditForm } from './edit/OrderEditForm';
import type { Comanda } from '@/types';

interface OrderEditModalProps {
  comanda: Comanda | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updatedComanda: Partial<Comanda>) => Promise<boolean>;
  onReprint?: (comanda: Comanda) => void;
}

export function OrderEditModal({ comanda, isOpen, onClose, onSave, onReprint }: OrderEditModalProps) {
  if (!comanda) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Editar Pedido #{comanda.id?.slice(-8)}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <OrderEditForm
          comanda={comanda}
          onSave={onSave}
          onCancel={onClose}
          onReprint={onReprint}
        />
      </DialogContent>
    </Dialog>
  );
}
