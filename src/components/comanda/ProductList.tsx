
import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import type { Produto } from '../../types/database';

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
  return (
    <div className="mb-6">
      <h2 className="text-base md:text-lg font-semibold mb-3">Produtos</h2>
      <div className="space-y-2">
        {produtos.map((produto: Produto, index: number) => (
          <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
            <span className="flex-1">{produto.nome}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdateQuantidade(index, produto.quantidade - 1)}
                disabled={produto.quantidade <= 1}
                className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                <Minus size={18} />
              </button>
              <input
                type="number"
                value={produto.quantidade}
                onChange={(e) => onUpdateQuantidade(index, Number(e.target.value))}
                className="w-16 p-1 border rounded text-sm text-center"
                min="1"
                placeholder="Quantidade"
                title="Quantidade do produto"
              />
              <button
                type="button"
                onClick={() => onUpdateQuantidade(index, produto.quantidade + 1)}
                className="text-gray-600 hover:text-gray-800"
              >
                <Plus size={18} />
              </button>
              <span>R$ {(produto.valor * produto.quantidade).toFixed(2)}</span>
              <button
                type="button"
                onClick={() => onRemoveProduto(index)}
                className="text-red-500 hover:text-red-700"
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
