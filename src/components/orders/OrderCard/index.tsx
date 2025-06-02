
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  showSelection?: boolean;
}

export function OrderCard({
  comanda,
  onTogglePayment,
  onReprint,
  onDelete,
  onSaveEdit,
  isSelected = false,
  onToggleSelect,
  showSelection = false
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

  const handleSelectToggle = () => {
    if (onToggleSelect && comanda.id) {
      onToggleSelect(comanda.id);
    }
  };

  return (
    <>
      <motion.div layout className="mb-4">
        <Card className={`p-6 ${isSelected ? 'ring-2 ring-primary' : ''}`}>
          <div className="flex items-start gap-3">
            {showSelection && (
              <div className="flex items-center pt-2">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleSelectToggle}
                />
              </div>
            )}
            
            <div className="flex-1">
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
            </div>
          </div>
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
