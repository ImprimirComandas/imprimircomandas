
import React from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '../ui/input';

interface ProductSearchProps {
  pesquisaProduto: string;
  loading: boolean;
  produtosFiltrados: Array<{
    id: string;
    nome: string;
    valor: number;
    numero?: number;
  }>;
  onChange: (field: string, value: string) => void;
  onSelectProduct: (produto: {
    id: string;
    nome: string;
    valor: number;
  }) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  pesquisaProduto,
  loading,
  produtosFiltrados,
  onChange,
  onSelectProduct
}) => {
  const {
    isDark
  } = useTheme();
  const showResults = pesquisaProduto.trim().length > 0 && produtosFiltrados.length > 0;
  
  return (
    <div className="mb-4 relative">
      <label htmlFor="pesquisaProduto" className="block text-sm font-medium text-foreground mb-1.5">
        Buscar Produto
      </label>
      <div className="relative">
        <Input 
          id="pesquisaProduto" 
          type="text" 
          value={pesquisaProduto} 
          onChange={e => onChange('pesquisaProduto', e.target.value)} 
          placeholder="Digite o nome ou número do produto" 
          disabled={loading} 
          aria-label="Buscar produto por nome ou número" 
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
      </div>

      {loading && <div className="absolute right-3 top-9 text-muted-foreground">Carregando...</div>}

      {showResults && (
        <div className="absolute z-10 w-full bg-card border border-border rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
          {produtosFiltrados.map(produto => (
            <div 
              key={produto.id} 
              onClick={() => {
                onSelectProduct(produto);
                onChange('pesquisaProduto', '');
              }} 
              className="px-4 py-2 hover:bg-accent cursor-pointer flex justify-between items-center"
            >
              <span className="text-foreground">
                {produto.numero !== undefined && (
                  <span className="inline-block bg-primary/20 text-primary text-xs font-semibold mr-2 px-2 py-0.5 rounded">
                    #{produto.numero}
                  </span>
                )}
                {produto.nome}
              </span>
              <span className="text-foreground font-medium">R$ {produto.valor.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
