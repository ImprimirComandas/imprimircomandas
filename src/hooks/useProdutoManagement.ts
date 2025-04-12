
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Produto } from '../types/database';
import { toast } from 'sonner';

export const useProdutoManagement = () => {
  const [nomeProduto, setNomeProduto] = useState('');
  const [valorProduto, setValorProduto] = useState('');
  const [quantidadeProduto, setQuantidadeProduto] = useState('1');
  const [produtosCadastrados, setProdutosCadastrados] = useState<{id: string, nome: string, valor: number}[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<{id: string, nome: string, valor: number}[]>([]);
  const [pesquisaProduto, setPesquisaProduto] = useState('');

  useEffect(() => {
    carregarProdutosCadastrados();
  }, []);

  useEffect(() => {
    if (pesquisaProduto.trim() === '') {
      setProdutosFiltrados([]);
    } else {
      const filtrados = produtosCadastrados.filter(produto => 
        produto.nome.toLowerCase().includes(pesquisaProduto.toLowerCase())
      );
      setProdutosFiltrados(filtrados);
    }
  }, [pesquisaProduto, produtosCadastrados]);

  const carregarProdutosCadastrados = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }

      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, valor')
        .eq('user_id', session.user.id)
        .order('nome');

      if (error) throw error;
      setProdutosCadastrados(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos cadastrados:', error);
    }
  };

  const selecionarProdutoCadastrado = (produto: {id: string, nome: string, valor: number}) => {
    setNomeProduto(produto.nome);
    setValorProduto(produto.valor.toString());
    setPesquisaProduto('');
    setProdutosFiltrados([]);
  };

  const adicionarProduto = (produtos: Produto[]) => {
    if (!nomeProduto || !valorProduto || !quantidadeProduto) {
      toast.error('Preencha todos os campos do produto.');
      return null;
    }

    const novoProduto: Produto = {
      nome: nomeProduto,
      valor: parseFloat(valorProduto),
      quantidade: parseInt(quantidadeProduto),
    };

    setNomeProduto('');
    setValorProduto('');
    setQuantidadeProduto('1');
    setPesquisaProduto('');
    
    return [...produtos, novoProduto];
  };

  const removerProduto = (produtos: Produto[], index: number) => {
    return produtos.filter((_, i) => i !== index);
  };

  const handleChange = (field: string, value: any) => {
    if (field === 'nomeProduto') {
      setNomeProduto(value);
    } else if (field === 'valorProduto') {
      setValorProduto(value);
    } else if (field === 'quantidadeProduto') {
      setQuantidadeProduto(value);
    } else if (field === 'pesquisaProduto') {
      setPesquisaProduto(value);
    }
  };

  return {
    nomeProduto,
    valorProduto,
    quantidadeProduto,
    pesquisaProduto,
    produtosFiltrados,
    adicionarProduto,
    removerProduto,
    handleChange,
    selecionarProdutoCadastrado
  };
};
