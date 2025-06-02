
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  nome: string;
  valor: number;
  categoria?: string | null;
}

interface ProductsByCategory {
  [category: string]: Product[];
}

export function useProductsByCategory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data, error } = await supabase
          .from('produtos')
          .select('id, nome, valor, categoria')
          .eq('user_id', session.user.id)
          .order('nome');

        if (error) throw error;
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const productsByCategory = useMemo(() => {
    const grouped: ProductsByCategory = {};
    
    products.forEach(product => {
      const category = product.categoria || '';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(product);
    });

    return grouped;
  }, [products]);

  const categories = useMemo(() => {
    return Object.keys(productsByCategory).sort((a, b) => {
      // "Sem categoria" sempre por último
      if (a === '' && b !== '') return 1;
      if (b === '' && a !== '') return -1;
      return a.localeCompare(b);
    });
  }, [productsByCategory]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const expandAllCategories = () => {
    setExpandedCategories(new Set(categories));
  };

  const collapseAllCategories = () => {
    setExpandedCategories(new Set());
  };

  const updateProductInList = (updatedProduct: Product) => {
    setProducts(prev =>
      prev
        .map(p => (p.id === updatedProduct.id ? updatedProduct : p))
        .sort((a, b) => a.nome.localeCompare(b.nome))
    );
  };

  const removeProductFromList = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addProductToList = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct].sort((a, b) => a.nome.localeCompare(b.nome)));
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  return {
    products,
    productsByCategory,
    categories,
    loading,
    expandedCategories,
    toggleCategory,
    expandAllCategories,
    collapseAllCategories,
    fetchAllProducts,
    updateProductInList,
    removeProductFromList,
    addProductToList,
  };
}
