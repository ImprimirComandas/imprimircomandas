
import React from 'react';
import { Save, X, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/card';

interface Product {
  id: string;
  nome: string;
  valor: number;
  categoria?: string | null;
}

interface ProductFormProps {
  productName: string;
  productValue: string;
  productCategory: string;
  saving: boolean;
  editingProduct: Product | null;
  onProductNameChange: (value: string) => void;
  onProductValueChange: (value: string) => void;
  onProductCategoryChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  onDeleteAll: () => void;
  productsCount: number;
}

export function ProductForm({
  productName,
  productValue,
  productCategory,
  saving,
  editingProduct,
  onProductNameChange,
  onProductValueChange,
  onProductCategoryChange,
  onSubmit,
  onCancel,
  onDeleteAll,
  productsCount
}: ProductFormProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="product-name" className="block text-sm font-medium text-foreground mb-1">
            Nome do Produto
          </label>
          <input
            id="product-name"
            type="text"
            value={productName}
            onChange={(e) => onProductNameChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-all"
            placeholder="Ex: Água Mineral 500ml"
          />
        </div>
        
        <div>
          <label htmlFor="product-value" className="block text-sm font-medium text-foreground mb-1">
            Valor (R$)
          </label>
          <input
            id="product-value"
            type="number"
            value={productValue}
            onChange={(e) => onProductValueChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-all"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        
        <div>
          <label htmlFor="product-category" className="block text-sm font-medium text-foreground mb-1">
            Categoria (opcional)
          </label>
          <input
            id="product-category"
            type="text"
            value={productCategory}
            onChange={(e) => onProductCategoryChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-all"
            placeholder="Ex: Bebidas"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={onDeleteAll}
          disabled={saving || productsCount === 0}
          className="w-full sm:w-auto flex items-center px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors duration-200"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Apagar Todos os Produtos
        </button>
        
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          {editingProduct && onCancel && (
            <button
              onClick={onCancel}
              disabled={saving}
              className="w-full sm:w-auto flex items-center px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={saving}
            className="w-full sm:w-auto flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors duration-200"
          >
            {saving ? (
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
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Salvando...' : editingProduct ? 'Salvar Edição' : 'Adicionar Produto'}
          </button>
        </div>
      </div>
    </Card>
  );
}
