
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Comanda, Produto } from '../types/database';

// Taxas de bairro
const bairroTaxas = {
  'Jardim Paraíso': 6,
  'Aventureiro': 9,
  'Jardim Sofia': 9,
  'Cubatão': 9,
};

export const useComandaForm = (carregarComandas: () => Promise<void>, setSalvando: (value: boolean) => void) => {
  const [comanda, setComanda] = useState<Comanda>({
    id: '',
    user_id: '',
    produtos: [],
    total: 0,
    forma_pagamento: '',
    data: '',
    endereco: '',
    bairro: 'Jardim Paraíso',
    taxaentrega: 6,
    pago: false,
    quantiapaga: 0,
    troco: 0,
    valor_cartao: 0,
    valor_dinheiro: 0,
    valor_pix: 0,
  });
  const [pesquisaProduto, setPesquisaProduto] = useState('');
  const [produtosCadastrados, setProdutosCadastrados] = useState<{ id: string; nome: string; valor: number }[]>([]);
  const [editingProduct, setEditingProduct] = useState<{ id: string; nome: string; valor: number } | null>(null);
  const [showTrocoModal, setShowTrocoModal] = useState(false);
  const [needsTroco, setNeedsTroco] = useState<boolean | null>(null);
  const [quantiapagaInput, setQuantiapagaInput] = useState<number | null>(null);
  const [showPagamentoMistoModal, setShowPagamentoMistoModal] = useState(false);
  const [valorCartaoInput, setValorCartaoInput] = useState<number | null>(null);
  const [valorDinheiroInput, setValorDinheiroInput] = useState<number | null>(null);
  const [valorPixInput, setValorPixInput] = useState<number | null>(null);

  // Buscar produtos do Supabase
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const { data, error } = await supabase.from('produtos').select('id, nome, valor').order('nome');
        if (error) throw error;
        setProdutosCadastrados(data || []);
      } catch (error) {
        toast.error('Erro ao carregar produtos cadastrados.');
      }
    };
    fetchProdutos();
  }, []);

  const produtosFiltrados = produtosCadastrados.filter(p =>
    p.nome.toLowerCase().includes(pesquisaProduto.toLowerCase())
  );

  const totalComTaxa = comanda.total + comanda.taxaentrega;

  const onChange = (field: string, value: any) => {
    if (field === 'pesquisaProduto') setPesquisaProduto(value);
    else if (field === 'endereco') setComanda(prev => ({ ...prev, endereco: value }));
    else if (field === 'pago') setComanda(prev => ({ ...prev, pago: value }));
    else if (field === 'quantiapagaInput') setQuantiapagaInput(value ? Number(value) : null);
    else if (field === 'needsTroco') setNeedsTroco(value === 'true' ? true : value === 'false' ? false : null);
    else if (field === 'valorCartaoInput') setValorCartaoInput(value ? Number(value) : null);
    else if (field === 'valorDinheiroInput') setValorDinheiroInput(value ? Number(value) : null);
    else if (field === 'valorPixInput') setValorPixInput(value ? Number(value) : null);
  };

  const onBairroChange = (bairro: string) => {
    const taxa = bairroTaxas[bairro as keyof typeof bairroTaxas] || 0;
    setComanda(prev => ({ ...prev, bairro, taxaentrega: taxa }));
  };

  const onFormaPagamentoChange = (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => {
    setComanda(prev => ({ ...prev, forma_pagamento: forma }));
    if (forma === 'dinheiro') {
      setShowTrocoModal(true);
      setNeedsTroco(null); // Reset needsTroco when opening modal
    } else if (forma === 'misto') {
      setShowPagamentoMistoModal(true);
    } else {
      setShowTrocoModal(false);
      setShowPagamentoMistoModal(false);
      setNeedsTroco(null);
      setQuantiapagaInput(null);
    }
  };

  const salvarProduto = async (nome: string, valor: string) => {
    const valorNum = Number(valor);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Não autorizado');
    const { data, error } = await supabase
      .from('produtos')
      .insert([{ nome, valor: valorNum, user_id: session.user.id }])
      .select('id, nome, valor');
    if (error) throw error;
    if (data && data[0]) {
      setProdutosCadastrados(prev => [...prev, data[0]].sort((a, b) => a.nome.localeCompare(b.nome)));
    }
  };

  const editarProduto = async (id: string, nome: string, valor: string) => {
    const valorNum = Number(valor);
    const { error } = await supabase
      .from('produtos')
      .update({ nome, valor: valorNum })
      .eq('id', id);
    if (error) throw error;
    setProdutosCadastrados(prev =>
      prev
        .map(p => (p.id === id ? { id, nome, valor: valorNum } : p))
        .sort((a, b) => a.nome.localeCompare(b.nome))
    );
  };

  const adicionarProdutoCadastrado = (produto: { id: string; nome: string; valor: number }) => {
    const novoProduto: Produto = { nome: produto.nome, valor: produto.valor, quantidade: 1 };
    setComanda(prev => ({
      ...prev,
      produtos: [...prev.produtos, novoProduto],
      total: prev.total + produto.valor,
    }));
    setPesquisaProduto('');
  };

  const removerProduto = (index: number) => {
    const produtoRemovido = comanda.produtos[index];
    setComanda(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index),
      total: prev.total - produtoRemovido.valor * produtoRemovido.quantidade,
    }));
  };

  const atualizarQuantidadeProduto = (index: number, quantidade: number) => {
    if (quantidade < 1) {
      toast.error('A quantidade deve ser pelo menos 1.');
      return;
    }
    setComanda(prev => {
      const novosProdutos = [...prev.produtos];
      const produtoAntigo = novosProdutos[index];
      const diferencaQuantidade = quantidade - produtoAntigo.quantidade;
      novosProdutos[index] = { ...produtoAntigo, quantidade };
      return {
        ...prev,
        produtos: novosProdutos,
        total: prev.total + diferencaQuantidade * produtoAntigo.valor,
      };
    });
  };

  const selecionarProdutoCadastrado = (produto: { id: string; nome: string; valor: number }) => {
    adicionarProdutoCadastrado(produto);
  };

  const startEditingProduct = (produto: { id: string; nome: string; valor: number }) => {
    setEditingProduct(produto);
  };

  const salvarComanda = async () => {
    if (comanda.produtos.length === 0) {
      toast.error('Adicione pelo menos um produto.');
      return;
    }
    if (!comanda.forma_pagamento) {
      toast.error('Selecione a forma de pagamento.');
      return;
    }
    if (!comanda.endereco || !comanda.bairro) {
      toast.error('Preencha o endereço e o bairro.');
      return;
    }
    if (comanda.forma_pagamento === 'dinheiro' && needsTroco === null) {
      toast.error('Selecione se precisa de troco.');
      return;
    }
    if (comanda.forma_pagamento === 'dinheiro' && needsTroco && (quantiapagaInput === null || quantiapagaInput <= 0)) {
      toast.error('Informe a quantia paga.');
      return;
    }
    if (comanda.forma_pagamento === 'misto') {
      const totalValores = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
      if (totalValores !== totalComTaxa) {
        toast.error('A soma dos valores deve ser igual ao total.');
        return;
      }
    }

    setSalvando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autorizado');

      const novaComanda = {
        user_id: session.user.id,
        produtos: comanda.produtos,
        total: totalComTaxa,
        forma_pagamento: comanda.forma_pagamento,
        data: new Date().toISOString(),
        endereco: comanda.endereco,
        bairro: comanda.bairro,
        taxaentrega: comanda.taxaentrega,
        pago: comanda.pago,
        quantiapaga: comanda.forma_pagamento === 'dinheiro' && !needsTroco ? totalComTaxa : quantiapagaInput || 0,
        troco: comanda.forma_pagamento === 'dinheiro' && !needsTroco ? 0 : quantiapagaInput && quantiapagaInput > totalComTaxa ? quantiapagaInput - totalComTaxa : 0,
        valor_cartao: valorCartaoInput || 0,
        valor_dinheiro: valorDinheiroInput || 0,
        valor_pix: valorPixInput || 0,
      };

      const { data, error } = await supabase.from('comandas').insert([novaComanda]).select().single();
      if (error) throw error;

      // Print the comanda
      await import('../utils/printService').then(module => {
        module.imprimirComanda({ ...novaComanda, id: data.id });
        toast.success('Comanda salva e enviada para impressão!');
      }).catch(() => {
        toast.error('Comanda salva, mas erro ao imprimir.');
      });

      // Reset form
      setComanda({
        id: '',
        user_id: '',
        produtos: [],
        total: 0,
        forma_pagamento: '',
        data: '',
        endereco: '',
        bairro: 'Jardim Paraíso',
        taxaentrega: 6,
        pago: false,
        quantiapaga: 0,
        troco: 0,
        valor_cartao: 0,
        valor_dinheiro: 0,
        valor_pix: 0,
      });
      setQuantiapagaInput(null);
      setValorCartaoInput(null);
      setValorDinheiroInput(null);
      setValorPixInput(null);
      setNeedsTroco(null);
      await carregarComandas();
    } catch (error: any) {
      toast.error(`Erro ao salvar comanda: ${error.message || 'Desconhecido'}`);
    } finally {
      setSalvando(false);
    }
  };

  const handleTrocoConfirm = () => {
    if (needsTroco === null) {
      toast.error('Selecione se precisa de troco.');
      return;
    }
    if (needsTroco && (quantiapagaInput === null || quantiapagaInput < totalComTaxa)) {
      toast.error('Por favor, informe uma quantia válida maior que o valor em dinheiro.');
      return;
    }
    if (!needsTroco) {
      setQuantiapagaInput(totalComTaxa); // Set exact amount if no change needed
    }
    setShowTrocoModal(false);
  };

  const closeTrocoModal = () => {
    setShowTrocoModal(false);
    setQuantiapagaInput(null);
    setNeedsTroco(null);
  };

  const handlePagamentoMistoConfirm = () => {
    const totalValores = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
    if (totalValores === totalComTaxa) {
      setShowPagamentoMistoModal(false);
    } else {
      toast.error('A soma dos valores deve ser igual ao total.');
    }
  };

  const closePagamentoMistoModal = () => {
    setShowPagamentoMistoModal(false);
    setValorCartaoInput(null);
    setValorDinheiroInput(null);
    setValorPixInput(null);
  };

  return {
    comanda,
    pesquisaProduto,
    produtosFiltrados,
    editingProduct,
    setEditingProduct,
    showTrocoModal,
    needsTroco,
    quantiapagaInput,
    totalComTaxa,
    showPagamentoMistoModal,
    valorCartaoInput,
    valorDinheiroInput,
    valorPixInput,
    onBairroChange,
    salvarProduto,
    editarProduto,
    removerProduto,
    atualizarQuantidadeProduto,
    onFormaPagamentoChange,
    onChange,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    salvarComanda,
    selecionarProdutoCadastrado,
    startEditingProduct,
  };
};
