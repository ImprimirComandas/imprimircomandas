
import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface Product {
  id: string;
  nome: string;
  valor: number;
  categoria?: string | null;
}

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
  saving: boolean;
}

export function ProductEditModal({
  product,
  isOpen,
  onClose,
  onSave,
  saving
}: ProductEditModalProps) {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');

  useEffect(() => {
    if (product) {
      setNome(product.nome);
      setValor(product.valor.toString());
      setCategoria(product.categoria || '');
    }
  }, [product]);

  const handleSave = async () => {
    if (!product || !nome || !valor) return;
    
    const parsedValue = parseFloat(valor);
    if (isNaN(parsedValue) || parsedValue <= 0) return;

    await onSave({
      ...product,
      nome,
      valor: parsedValue,
      categoria: categoria || null
    });
  };

  const handleClose = () => {
    setNome('');
    setValor('');
    setCategoria('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="edit-nome" className="block text-sm font-medium text-foreground mb-1">
              Nome do Produto
            </label>
            <input
              id="edit-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-all"
              placeholder="Ex: Água Mineral 500ml"
            />
          </div>
          
          <div>
            <label htmlFor="edit-valor" className="block text-sm font-medium text-foreground mb-1">
              Valor (R$)
            </label>
            <input
              id="edit-valor"
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-all"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          
          <div>
            <label htmlFor="edit-categoria" className="block text-sm font-medium text-foreground mb-1">
              Categoria (opcional)
            </label>
            <input
              id="edit-categoria"
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-ring transition-all"
              placeholder="Ex: Bebidas"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={saving}
            className="flex items-center px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !nome || !valor}
            className="flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors duration-200"
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
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
