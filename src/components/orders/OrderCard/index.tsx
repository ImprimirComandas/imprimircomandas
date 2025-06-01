
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { OrderCardHeader } from './OrderCardHeader';
import { OrderCardDetails } from './OrderCardDetails';
import { EditOrderForm } from './EditOrderForm';
import { useProdutoSearch } from '@/hooks/useProdutoSearch';
import type { Produto, Comanda } from '@/types';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedComanda, setEditedComanda] = useState<Partial<Comanda>>(comanda);
  const [getProdutos, setGetProdutos] = useState<Produto[]>(comanda.produtos || []);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    pesquisaProduto,
    setPesquisaProduto,
    produtosFiltrados,
    loading: loadingProdutos,
  } = useProdutoSearch();

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const startEdit = () => {
    setIsEditing(true);
    setEditedComanda(comanda);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedComanda(comanda);
    setPesquisaProduto('');
  };

  const saveEdit = async () => {
    if (comanda.id) {
      const success = await onSaveEdit(comanda.id, editedComanda);
      if (success) {
        setIsEditing(false);
        setGetProdutos(editedComanda.produtos as Produto[]);
        setPesquisaProduto('');
      }
    }
  };

  return (
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
            {isEditing ? (
              <EditOrderForm
                editedComanda={editedComanda}
                setEditedComanda={setEditedComanda}
                onSave={saveEdit}
                onCancel={cancelEdit}
                getProdutos={getProdutos}
                searchInputRef={searchInputRef}
                pesquisaProduto={pesquisaProduto}
                setPesquisaProduto={setPesquisaProduto}
                produtosFiltrados={produtosFiltrados}
                loadingProdutos={loadingProdutos}
              />
            ) : (
              <OrderCardDetails
                comanda={comanda}
                getProdutos={getProdutos}
                onTogglePayment={onTogglePayment}
                onStartEdit={startEdit}
                onReprint={onReprint}
                onDelete={onDelete}
              />
            )}
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}
