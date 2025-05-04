
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { debounce } from 'lodash';

export const useProdutos = () => {
  const [produtosCadastrados, setProdutosCadastrados] = useState<{ id: string; nome: string; valor: number; numero?: number }[]>([]);
  const [pesquisaProduto, setPesquisaProduto] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState<{ id: string; nome: string; valor: number; numero?: number }[]>([]);
  const [editingProduct, setEditingProduct] = useState<{ id: string; nome: string; valor: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, valor, numero')
        .eq('user_id', session.user.id)
        .order('nome');
        
      if (error) throw error;
      setProdutosCadastrados(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos cadastrados.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();

    // Set up real-time subscription
    const produtosChannel = supabase
      .channel('produtos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produtos'
        },
        (payload) => {
          console.log('Real-time update from produtos:', payload);
          fetchProdutos();
        }
      )
      .subscribe();
      
    // Clean up subscription
    return () => {
      supabase.removeChannel(produtosChannel);
    };
  }, []);

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
  
  // Use debounce to filter products
  const debouncedFilter = useCallback(
    debounce((searchTerm: string) => {
      const filtered = produtosCadastrados.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.numero !== undefined && p.numero !== null && 
         p.numero.toString() && p.numero.toString().includes(searchTerm))
      );
      setProdutosFiltrados(filtered);
    }, 300),
    [produtosCadastrados]
  );
  
  // Update search term
  const updateSearchTerm = (term: string) => {
    setPesquisaProduto(term);
    debouncedFilter(term);
  };

  // Update filtered products when search term changes
  useEffect(() => {
    debouncedFilter(pesquisaProduto);
  }, [pesquisaProduto, debouncedFilter]);

  const startEditingProduct = (produto: { id: string; nome: string; valor: number }) => {
    setEditingProduct(produto);
  };

  return {
    produtosCadastrados,
    pesquisaProduto,
    setPesquisaProduto: updateSearchTerm,
    produtosFiltrados,
    editingProduct,
    setEditingProduct,
    salvarProduto,
    editarProduto,
    startEditingProduct,
    loading,
  };
};
