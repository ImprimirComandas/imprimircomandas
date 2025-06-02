
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { Card } from '../ui/card';

interface Product {
  id: string;
  nome: string;
  valor: number;
  categoria?: string | null;
}

interface ProductCategorySectionProps {
  categoryName: string;
  products: Product[];
  searchTerm: string;
  editingProduct: Product | null;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ProductCategorySection({
  categoryName,
  products,
  searchTerm,
  editingProduct,
  onEdit,
  onDelete,
  isExpanded,
  onToggle
}: ProductCategorySectionProps) {
  const filteredProducts = products.filter(product =>
    !searchTerm || product.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayName = categoryName || 'Sem Categoria';
  const hasSearchResults = searchTerm && filteredProducts.length > 0;

  if (searchTerm && filteredProducts.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">{displayName}</h3>
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {(isExpanded || hasSearchResults) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard
                        product={product}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        disabled={editingProduct !== null}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum produto encontrado nesta categoria.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
