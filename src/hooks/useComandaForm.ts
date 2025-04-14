import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Comanda, Produto } from '../types/database';

export const useComandaForm = (carregarComandas: () => void, setSalvando: (value: boolean) => void) => {
  const [comanda, setComanda] = useState<Comanda>({
    produtos: [],
    endereco: '',
    bairro: '',
    forma_pagamento: '',
    pago: false,
    total: 0,
    taxaentrega: 0,
    troco: null,
    order_date: new Date().toISOString().split('T')[0], // Changed from 'data'
    data: new Date().toISOString(), // Added 'data' property
    pagamento_misto: null,
  });
  const [pesquisaProduto, setPesquisaProduto] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState<{ id: string; nome: string; valor: number }[]>([]);
  const [editingProduct, setEditingProduct] = useState<{ id: string; nome: string; valor: number } | null>(null);
  const [showTrocoModal, setShowTrocoModal] = useState(false);
  const [needsTroco, setNeedsTroco] = useState<boolean | null>(null);
  const [quantiapagaInput, setQuantiapagaInput] = useState('');
  const [showPagamentoMistoModal, setShowPagamentoMistoModal] = useState(false);
  const [valorCartaoInput, setValorCartaoInput] = useState('');
  const [valorDinheiroInput, setValorDinheiroInput] = useState('');
  const [valorPixInput, setValorPixInput] = useState('');

  // Calculate total with delivery fee
  const totalComTaxa = comanda.total + comanda.taxaentrega;

  // Search products
  useEffect(() => {
    const fetchProdutos = async () => {
      if (!pesquisaProduto) {
        setProdutosFiltrados([]);
        return;
      }
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, valor')
        .ilike('nome', `%${pesquisaProduto}%`)
        .limit(10);
      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Erro ao buscar produtos');
      } else {
        setProdutosFiltrados(data || []);
      }
    };
    fetchProdutos();
  }, [pesquisaProduto]);

  // Update delivery fee based on bairro
  const onBairroChange = (bairro: string) => {
    const taxas: { [key: string]: number } = {
      'Jardim Paraíso': 6,
      Aventureiro: 9,
      'Jardim Sofia': 9,
      Cubatão: 9,
    };
    setComanda((prev) => ({
      ...prev,
      bairro,
      taxaentrega: taxas[bairro] || 0,
    }));
  };

  // Handle payment method change
  const onFormaPagamentoChange = (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => {
    setComanda((prev) => ({
      ...prev,
      forma_pagamento: forma,
      troco: forma === 'dinheiro' ? prev.troco : null,
      pagamento_misto: forma === 'misto' ? prev.pagamento_misto : null,
    }));
    if (forma === 'misto') {
      setShowPagamentoMistoModal(true);
    } else {
      setShowPagamentoMistoModal(false);
      setValorCartaoInput('');
      setValorDinheiroInput('');
      setValorPixInput('');
    }
    if (forma !== 'dinheiro') {
      setNeedsTroco(null);
      setQuantiapagaInput('');
    }
  };

  // Handle state changes
  const onChange = (field: string, value: string | boolean | number | null) => {
    if (field === 'showTrocoModal') {
      setShowTrocoModal(!!value);
    } else if (field === 'needsTroco') {
      setNeedsTroco(value === 'true' ? true : value === 'false' ? false : null);
    } else if (field === 'quantiapagaInput') {
      setQuantiapagaInput(String(value));
    } else if (field === 'pesquisaProduto') {
      setPesquisaProduto(String(value));
    } else if (field === 'valorCartaoInput') {
      setValorCartaoInput(String(value));
    } else if (field === 'valorDinheiroInput') {
      setValorDinheiroInput(String(value));
    } else if (field === 'valorPixInput') {
      setValorPixInput(String(value));
    } else {
      setComanda((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Save product
  const salvarProduto = async (produto: { nome: string; valor: number }) => {
    const { data, error } = await supabase
      .from('produtos')
      .insert([produto])
      .select()
      .single();
    if (error) {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar produto');
    } else {
      toast.success('Produto salvo com sucesso');
    }
  };

  // Edit product
  const editarProduto = async (produto: { id: string; nome: string; valor: number }) => {
    const { error } = await supabase
      .from('produtos')
      .update({ nome: produto.nome, valor: produto.valor })
      .eq('id', produto.id);
    if (error) {
      console.error('Error editing product:', error);
      toast.error('Erro ao editar produto');
    } else {
      toast.success('Produto editado com sucesso');
      setEditingProduct(null);
    }
  };

  // Remove product
  const removerProduto = (index: number) => {
    setComanda((prev) => {
      const newProdutos = [...prev.produtos];
      newProdutos.splice(index, 1);
      const newTotal = newProdutos.reduce((sum, p) => sum + p.valor * p.quantidade, 0);
      return { ...prev, produtos: newProdutos, total: newTotal };
    });
  };

  // Update product quantity
  const atualizarQuantidadeProduto = (index: number, quantidade: number) => {
    if (quantidade < 1) return;
    setComanda((prev) => {
      const newProdutos = [...prev.produtos];
      newProdutos[index] = { ...newProdutos[index], quantidade };
      const newTotal = newProdutos.reduce((sum, p) => sum + p.valor * p.quantidade, 0);
      return { ...prev, produtos: newProdutos, total: newTotal };
    });
  };

  // Select registered product
  const selecionarProdutoCadastrado = (produto: { id: string; nome: string; valor: number }) => {
    setComanda((prev) => {
      const newProdutos = [...prev.produtos, { ...produto, quantidade: 1 }];
      const newTotal = newProdutos.reduce((sum, p) => sum + p.valor * p.quantidade, 0);
      return { ...prev, produtos: newProdutos, total: newTotal };
    });
    setPesquisaProduto('');
  };

  // Start editing product
  const startEditingProduct = (produto: { id: string; nome: string; valor: number }) => {
    setEditingProduct(produto);
  };

  // Handle troco confirmation
  const handleTrocoConfirm = () => {
    if (needsTroco === true && quantiapagaInput) {
      const parsedQuantiapaga = parseFloat(quantiapagaInput);
      if (isNaN(parsedQuantiapaga) || parsedQuantiapaga < totalComTaxa) {
        toast.error('Quantia paga inválida ou insuficiente');
        return;
      }
      const troco = parsedQuantiapaga - totalComTaxa;
      setComanda((prev) => ({ ...prev, troco }));
    } else if (needsTroco === false) {
      setComanda((prev) => ({ ...prev, troco: 0 }));
    }
    setShowTrocoModal(false);
  };

  // Close troco modal
  const closeTrocoModal = () => {
    setShowTrocoModal(false);
    setNeedsTroco(null);
    setQuantiapagaInput('');
  };

  // Handle mixed payment confirmation
  const handlePagamentoMistoConfirm = (paymentDetails: { cartao: number; dinheiro: number; pix: number; troco: number | null }) => {
    const { cartao, dinheiro, pix, troco } = paymentDetails;
    const totalPaid = cartao + dinheiro + pix;
    if (totalPaid < totalComTaxa) {
      toast.error('Soma dos valores insuficiente');
      return;
    }
    setComanda((prev) => ({
      ...prev,
      pagamento_misto: { cartao, dinheiro, pix },
      troco,
    }));
    setShowPagamentoMistoModal(false);
    setValorCartaoInput('');
    setValorDinheiroInput('');
    setValorPixInput('');
  };

  // Close mixed payment modal
  const closePagamentoMistoModal = () => {
    setShowPagamentoMistoModal(false);
    setValorCartaoInput('');
    setValorDinheiroInput('');
    setValorPixInput('');
  };

  // Save comanda
  const salvarComanda = async () => {
    // Validate comanda
    if (!comanda.produtos.length) {
      toast.error('Adicione pelo menos um produto');
      return;
    }
    if (!comanda.endereco.trim()) {
      toast.error('Informe o endereço de entrega');
      return;
    }
    if (!comanda.bairro) {
      toast.error('Selecione um bairro');
      return;
    }
    if (!comanda.forma_pagamento) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }
    if (!comanda.order_date) {
      toast.error('Informe a data do pedido');
      return;
    }
    if (comanda.forma_pagamento === 'dinheiro' && needsTroco === null) {
      setShowTrocoModal(true);
      return;
    }
    if (comanda.forma_pagamento === 'misto' && !comanda.pagamento_misto) {
      toast.error('Confirme os valores do pagamento misto');
      setShowPagamentoMistoModal(true);
      return;
    }

    setSalvando(true);

    // Prepare comanda for Supabase
    const comandaToSave = {
      produtos: comanda.produtos.map(({ id, ...rest }) => rest),
      endereco: comanda.endereco,
      bairro: comanda.bairro,
      forma_pagamento: comanda.forma_pagamento,
      pago: comanda.pago,
      total: comanda.total,
      taxaentrega: comanda.taxaentrega,
      troco: comanda.troco ?? null,
      order_date: comanda.order_date, // Changed from 'data'
      pagamento_misto: comanda.pagamento_misto ?? null,
    };

    console.log('Saving comanda:', comandaToSave);

    const { error } = await supabase.from('comandas').insert([comandaToSave]);

    if (error) {
      console.error('Supabase error:', error);
      toast.error(`Erro ao salvar comanda: ${error.message}`);
    } else {
      toast.success('Comanda salva com sucesso');
      setComanda({
              produtos: [],
              endereco: '',
              bairro: '',
              forma_pagamento: '',
              pago: false,
              total: 0,
              taxaentrega: 0,
              troco: null,
              order_date: new Date().toISOString().split('T')[0],
              data: new Date().toISOString(), // Added 'data' property
              pagamento_misto: null,
            });
      setNeedsTroco(null);
      setQuantiapagaInput('');
      setValorCartaoInput('');
      setValorDinheiroInput('');
      setValorPixInput('');
      carregarComandas();
    }
    setSalvando(false);
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
    showPagamentoMistoModal,
    valorCartaoInput,
    valorDinheiroInput,
    valorPixInput,
    totalComTaxa,
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