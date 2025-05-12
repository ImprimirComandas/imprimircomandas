
import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import type { Produto } from '../../types/database';
import { useTheme } from '@/hooks/useTheme';

interface ProductListProps {
  produtos: Produto[];
  onRemoveProduto: (index: number) => void;
  onUpdateQuantidade: (index: number, quantidade: number) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  produtos,
  onRemoveProduto,
  onUpdateQuantidade,
}) => {
  const { isDark } = useTheme();
  
  return (
    <div className="mb-6">
      <h2 className="text-base md:text-lg font-semibold mb-3 text-foreground">Produtos</h2>
      <div className="space-y-2">
        {produtos.map((produto: Produto, index: number) => (
          <div key={index} className="flex justify-between items-center bg-accent/30 p-2 rounded text-sm">
            <span className="flex-1 text-foreground">{produto.nome}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdateQuantidade(index, produto.quantidade - 1)}
                disabled={produto.quantidade <= 1}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                <Minus size={18} />
              </button>
              <input
                type="number"
                value={produto.quantidade}
                onChange={(e) => onUpdateQuantidade(index, Number(e.target.value))}
                className="w-16 p-1 border border-input rounded text-sm text-center bg-background text-foreground"
                min="1"
                placeholder="Quantidade"
                title="Quantidade do produto"
              />
              <button
                type="button"
                onClick={() => onUpdateQuantidade(index, produto.quantidade + 1)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus size={18} />
              </button>
              <span className="text-foreground">R$ {(produto.valor * produto.quantidade).toFixed(2)}</span>
              <button
                type="button"
                onClick={() => onRemoveProduto(index)}
                className="text-destructive hover:text-destructive/80 transition-colors"
                title="Remover produto"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
