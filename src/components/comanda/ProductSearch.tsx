
import React from 'react';
import { Search } from 'lucide-react';

interface ProductSearchProps {
  pesquisaProduto: string;
  loading: boolean;
  produtosFiltrados: Array<{ id: string; nome: string; valor: number; numero?: number }>;
  onChange: (field: string, value: string) => void;
  onSelectProduct: (produto: { id: string; nome: string; valor: number }) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  pesquisaProduto,
  loading,
  produtosFiltrados,
  onChange,
  onSelectProduct,
}) => {
  const showResults = pesquisaProduto.trim().length > 0 && produtosFiltrados.length > 0;
  
  return (
    <div className="mb-4 relative">
      <label htmlFor="pesquisaProduto" className="block text-sm font-medium text-gray-700">
        Buscar Produto (nome ou número)
      </label>
      <div className="relative">
        <input
          id="pesquisaProduto"
          type="text"
          value={pesquisaProduto}
          onChange={(e) => onChange('pesquisaProduto', e.target.value)}
          placeholder="Digite o nome ou número do produto"
          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          aria-label="Buscar produto por nome ou número"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>
      
      {loading && (
        <div className="absolute right-3 top-9 text-gray-400">Carregando...</div>
      )}
      
      {showResults && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
          {produtosFiltrados.map((produto) => (
            <div
              key={produto.id}
              onClick={() => onSelectProduct(produto)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
            >
              <span>
                {produto.numero !== undefined && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2 py-0.5 rounded">
                    #{produto.numero}
                  </span>
                )}
                {produto.nome}
              </span>
              <span>R$ {produto.valor.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
