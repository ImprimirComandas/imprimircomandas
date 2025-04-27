
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { debounce } from 'lodash';

export function useProdutoSearch() {
  const [pesquisaProduto, setPesquisaProduto] = useState('');
  const [produtosCadastrados, setProdutosCadastrados] = useState<
    { id: string; nome: string; valor: number; numero?: number }[]
  >([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<
    { id: string; nome: string; valor: number; numero?: number }[]
  >([]);
  const [editingProduct, setEditingProduct] = useState<
    { id: string; nome: string; valor: number } | null
  >(null);
  const [loading, setLoading] = useState(false);

  // Fetch products from the database
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data, error } = await supabase
          .from('produtos')
          .select('id, nome, valor, numero')
          .eq('user_id', session.user.id)
          .order('nome');
          
        if (error) throw error;
        setProdutosCadastrados(data || []);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        toast.error('Erro ao carregar produtos cadastrados.');
      }
    };
    fetchProdutos();
  }, []);

  // Use debounce to avoid too many filter operations
  const debouncedFilter = useCallback(
    debounce((searchTerm: string) => {
      if (!searchTerm || searchTerm.trim() === '') {
        setProdutosFiltrados([]);
        return;
      }
      
      setLoading(true);
      const filtered = produtosCadastrados.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.numero !== undefined && p.numero !== null && 
         p.numero.toString() && p.numero.toString().includes(searchTerm))
      );
      setProdutosFiltrados(filtered);
      setLoading(false);
    }, 300),
    [produtosCadastrados]
  );

  // Update search term and filter products
  const updateSearchTerm = (term: string) => {
    setPesquisaProduto(term);
    
    // Clear results immediately if search is empty
    if (!term || term.trim() === '') {
      setProdutosFiltrados([]);
      return;
    }
    
    debouncedFilter(term);
  };

  // Filter products when search term changes
  useEffect(() => {
    // Don't filter if search term is empty
    if (!pesquisaProduto || pesquisaProduto.trim() === '') {
      setProdutosFiltrados([]);
      return;
    }
    
    debouncedFilter(pesquisaProduto);
  }, [pesquisaProduto, debouncedFilter]);

  // Save a new product
  const salvarProduto = async (nome: string, valor: string) => {
    try {
      const valorNum = Number(valor);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autorizado');
      
      const { data, error } = await supabase
        .from('produtos')
        .insert([{ nome, valor: valorNum, user_id: session.user.id }])
        .select('id, nome, valor, numero');
        
      if (error) throw error;
      if (data && data[0]) {
        setProdutosCadastrados(prev => [...prev, data[0]].sort((a, b) => a.nome.localeCompare(b.nome)));
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      throw error;
    }
  };

  // Edit an existing product
  const editarProduto = async (id: string, nome: string, valor: string) => {
    try {
      const valorNum = Number(valor);
      const { error } = await supabase
        .from('produtos')
        .update({ nome, valor: valorNum })
        .eq('id', id);
        
      if (error) throw error;
      setProdutosCadastrados(prev =>
        prev
          .map(p => (p.id === id ? { ...p, nome, valor: valorNum } : p))
          .sort((a, b) => a.nome.localeCompare(b.nome))
      );
    } catch (error) {
      console.error('Erro ao editar produto:', error);
      throw error;
    }
  };

  // Start editing a product
  const startEditingProduct = (produto: { id: string; nome: string; valor: number }) => {
    setEditingProduct(produto);
  };

  return {
    pesquisaProduto,
    setPesquisaProduto: updateSearchTerm,
    produtosCadastrados,
    produtosFiltrados,
    editingProduct,
    setEditingProduct,
    salvarProduto,
    editarProduto,
    loading,
    startEditingProduct,
  };
}
