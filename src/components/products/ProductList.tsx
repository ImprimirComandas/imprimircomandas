
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { Card } from '../ui/card';

interface Product {
  id: string;
  nome: string;
  valor: number;
  categoria?: string | null;
}

interface ProductListProps {
  products: Product[];
  loading: boolean;
  hasMore: boolean;
  editingProduct: Product | null;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;
}

export function ProductList({
  products,
  loading,
  hasMore,
  editingProduct,
  onEdit,
  onDelete,
  onLoadMore
}: ProductListProps) {
  if (loading && products.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-muted/50 p-8 rounded-lg text-center"
      >
        <p className="text-muted-foreground text-lg font-medium">
          Nenhum produto encontrado.
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {products.map(product => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
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
        </AnimatePresence>
      </div>
      
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Carregando...
              </span>
            ) : (
              'Carregar Mais'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
