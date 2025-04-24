
import React, { useState, useRef, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { OrderCardHeader } from './OrderCardHeader';
import { OrderCardDetails } from './OrderCardDetails';
import { EditOrderForm } from './EditOrderForm';
import type { Produto, ProdutoFiltrado, Comanda } from '@/types/orders';

interface OrderCardProps {
  comanda: Comanda;
  onTogglePayment: (comanda: Comanda) => void;
  onReprint: (comanda: Comanda) => void;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string, updatedComanda: Partial<Comanda>) => void;
}

export function OrderCard({ comanda, onTogglePayment, onReprint, onDelete, onSaveEdit }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComanda, setEditedComanda] = useState<Partial<Comanda>>({});
  const [pesquisaProduto, setPesquisaProduto] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState<ProdutoFiltrado[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const getProdutos = useMemo(() => {
    try {
      const produtos = Array.isArray(comanda.produtos)
        ? comanda.produtos
        : typeof comanda.produtos === 'string'
        ? JSON.parse(comanda.produtos)
        : [];
      return produtos.map((p: Produto) => ({
        nome: p.nome || 'Produto desconhecido',
        quantidade: p.quantidade || 1,
        valor: p.valor || 0,
      }));
    } catch (error) {
      console.error('Erro ao processar produtos:', error);
      return [];
    }
  }, [comanda.produtos]);

  const handleExpand = () => setIsExpanded(!isExpanded);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-4 hover:shadow-xl transition-all duration-300"
    >
      <OrderCardHeader
        comanda={comanda}
        isExpanded={isExpanded}
        onExpand={handleExpand}
      />

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <div className="border-t pt-4">
              {isEditing ? (
                <EditOrderForm
                  editedComanda={editedComanda}
                  setEditedComanda={setEditedComanda}
                  onSave={() => {
                    onSaveEdit(comanda.id, editedComanda);
                    setIsEditing(false);
                  }}
                  onCancel={() => setIsEditing(false)}
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
                  onStartEdit={() => setIsEditing(true)}
                  onReprint={onReprint}
                  onDelete={onDelete}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
