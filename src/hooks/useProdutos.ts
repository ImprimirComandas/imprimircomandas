
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useProdutos = () => {
  const [produtosCadastrados, setProdutosCadastrados] = useState<{ id: string; nome: string; valor: number; numero?: number }[]>([]);
  const [pesquisaProduto, setPesquisaProduto] = useState('');
  const [editingProduct, setEditingProduct] = useState<{ id: string; nome: string; valor: number } | null>(null);

  useEffect(() => {
    fetchProdutos();
  }, []);

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

  const produtosFiltrados = produtosCadastrados.filter(p =>
    p.nome.toLowerCase().includes(pesquisaProduto.toLowerCase()) ||
    (p.numero !== undefined && p.numero !== null && p.numero.toString() && p.numero.toString().includes(pesquisaProduto))
  );

  const startEditingProduct = (produto: { id: string; nome: string; valor: number }) => {
    setEditingProduct(produto);
  };

  return {
    produtosCadastrados,
    pesquisaProduto,
    setPesquisaProduto,
    produtosFiltrados,
    editingProduct,
    setEditingProduct,
    salvarProduto,
    editarProduto,
    startEditingProduct,
  };
};
