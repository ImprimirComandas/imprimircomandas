
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { useTheme } from '@/hooks/useTheme';

interface Product {
  id: string;
  nome: string;
  valor: number;
  categoria?: string | null;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export function ProductCard({ product, onEdit, onDelete, disabled = false }: ProductCardProps) {
  const { isDark } = useTheme();

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg">{product.nome}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {product.categoria || 'Sem categoria'}
          </p>
          <p className="text-lg font-bold text-primary mt-2">
            R$ {product.valor.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(product)}
            disabled={disabled}
            className={`p-2 rounded-full text-blue-600 ${
              isDark ? 'hover:bg-accent' : 'hover:bg-blue-100'
            } disabled:text-muted-foreground disabled:hover:bg-transparent transition-colors duration-200`}
            aria-label={`Editar ${product.nome}`}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            disabled={disabled}
            className={`p-2 rounded-full text-red-600 ${
              isDark ? 'hover:bg-accent' : 'hover:bg-red-100'
            } disabled:text-muted-foreground disabled:hover:bg-transparent transition-colors duration-200`}
            aria-label={`Deletar ${product.nome}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
