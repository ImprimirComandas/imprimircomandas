
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { OrderCardHeader } from './OrderCardHeader';
import { OrderCardDetails } from './OrderCardDetails';
import { OrderEditModal } from '../OrderEditModal';
import type { Comanda } from '@/types';

interface OrderCardProps {
  comanda: Comanda;
  onTogglePayment: (comanda: Comanda) => void;
  onReprint: (comanda: Comanda) => void;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string, updatedComanda: Partial<Comanda>) => Promise<boolean>;
}

export function OrderCard({
  comanda,
  onTogglePayment,
  onReprint,
  onDelete,
  onSaveEdit
}: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const startEdit = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  return (
    <>
      <motion.div layout className="mb-4">
        <Card className="p-6">
          <OrderCardHeader
            comanda={comanda}
            isExpanded={isExpanded}
            onExpand={toggleExpand}
          />
          
          <motion.div
            layout
            className="mt-4 overflow-hidden"
            initial={{ height: 0 }}
            animate={{ height: isExpanded ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mt-4">
              <OrderCardDetails
                comanda={comanda}
                getProdutos={comanda.produtos || []}
                onTogglePayment={onTogglePayment}
                onStartEdit={startEdit}
                onReprint={onReprint}
                onDelete={onDelete}
              />
            </div>
          </motion.div>
        </Card>
      </motion.div>

      <OrderEditModal
        comanda={comanda}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={onSaveEdit}
        onReprint={onReprint}
      />
    </>
  );
}
