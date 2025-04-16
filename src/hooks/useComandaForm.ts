
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Produto } from '../types/database';
import defaultBairroTaxas, { getBairroTaxas } from '../constants/bairroTaxas';
import { useComandaCalculation } from './useComandaCalculation';
import { useProdutoSearch } from './useProdutoSearch';
import { usePaymentHandling } from './usePaymentHandling';
import { useEffect } from 'react';

export const useComandaForm = (carregarComandas: () => Promise<void>, setSalvando: (value: boolean) => void) => {
  const {
    comanda,
    setComanda,
    totalComTaxa,
    adicionarProduto,
    removerProduto,
    atualizarQuantidadeProduto,
    atualizarBairroTaxa,
    resetarComanda,
  } = useComandaCalculation();

  const {
    pesquisaProduto,
    setPesquisaProduto,
    produtosFiltrados,
    editingProduct,
    setEditingProduct,
    salvarProduto,
    editarProduto,
  } = useProdutoSearch();

  const {
    showTrocoModal,
    setShowTrocoModal,
    needsTroco,
    setNeedsTroco,
    quantiapagaInput,
    setQuantiapagaInput,
    showPagamentoMistoModal,
    setShowPagamentoMistoModal,
    valorCartaoInput,
    setValorCartaoInput,
    valorDinheiroInput,
    setValorDinheiroInput,
    valorPixInput,
    setValorPixInput,
    handleFormaPagamentoChange,
    handleInputChange,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
  } = usePaymentHandling(totalComTaxa);

  const [bairroTaxas, setBairroTaxas] = useState<Record<string, number>>(defaultBairroTaxas);
  const [bairrosDisponiveis, setBairrosDisponiveis] = useState<string[]>(Object.keys(defaultBairroTaxas));

  // Fetch neighborhood taxes
  useEffect(() => {
    const fetchBairroTaxas = async () => {
      const taxas = await getBairroTaxas();
      setBairroTaxas(taxas);
      setBairrosDisponiveis(Object.keys(taxas));
      
      if (Object.keys(taxas).length > 0) {
        const firstBairro = Object.keys(taxas)[0];
        atualizarBairroTaxa(firstBairro, taxas[firstBairro]);
      }
    };
    
    fetchBairroTaxas();
  }, []);

<<<<<<< HEAD
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

  const produtosFiltrados = produtosCadastrados.filter(p =>
    p.nome.toLowerCase().includes(pesquisaProduto.toLowerCase()) ||
    (p.numero !== undefined && p.numero !== null && p.numero.toString() && p.numero.toString().includes(pesquisaProduto))
  );

  const subtotal = comanda.produtos.reduce((sum, item) => sum + (item.valor * item.quantidade), 0);
  const totalComTaxa = subtotal + comanda.taxaentrega;

=======
  // Handle generic input changes
>>>>>>> 5b824500faecf066b2616fcedc782c6eb778fba6
  const onChange = (field: string, value: any) => {
    if (field === 'pesquisaProduto') {
      setPesquisaProduto(value);
    } else if (field === 'endereco') {
      setComanda(prev => ({ ...prev, endereco: value }));
    } else if (field === 'pago') {
      setComanda(prev => ({ ...prev, pago: value }));
    } else {
      handleInputChange(field, value);
    }
  };

  // Handle neighborhood change
  const onBairroChange = (bairro: string) => {
    const taxa = bairroTaxas[bairro] || 0;
    atualizarBairroTaxa(bairro, taxa);
  };

  // Handle payment method change
  const onFormaPagamentoChange = (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => {
<<<<<<< HEAD
    setComanda(prev => ({ ...prev, forma_pagamento: forma }));
    if (forma === 'dinheiro') {
      setShowTrocoModal(true);
      setNeedsTroco(null);
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

  const selecionarProdutoCadastrado = (produto: { id: string; nome: string; valor: number }) => {
    const novoProduto: Produto = { nome: produto.nome, valor: produto.valor, quantidade: 1 };
    setComanda(prev => {
      const novoTotal = prev.produtos.reduce(
        (sum, item) => sum + item.valor * item.quantidade, 
        0
      ) + produto.valor;
      
      return {
        ...prev,
        produtos: [...prev.produtos, novoProduto],
        total: novoTotal,
      };
    });
    setPesquisaProduto('');
  };

  const removerProduto = (index: number) => {
    const produtoRemovido = comanda.produtos[index];
    setComanda(prev => {
      const novoTotal = prev.total - produtoRemovido.valor * produtoRemovido.quantidade;
      return {
        ...prev,
        produtos: prev.produtos.filter((_, i) => i !== index),
        total: novoTotal,
      };
    });
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
      
      const novoTotal = prev.total + diferencaQuantidade * produtoAntigo.valor;
      
      return {
        ...prev,
        produtos: novosProdutos,
        total: novoTotal,
      };
=======
    const resetFormaPagamento = () => {
      setComanda(prev => ({ ...prev, forma_pagamento: '' }));
    };
    
    handleFormaPagamentoChange(forma, (newForma) => {
      setComanda(prev => ({ ...prev, forma_pagamento: newForma }));
>>>>>>> 5b824500faecf066b2616fcedc782c6eb778fba6
    });
  };

  // Select a product from the catalog
  const selecionarProdutoCadastrado = (produto: { id: string; nome: string; valor: number }) => {
    const novoProduto: Produto = { nome: produto.nome, valor: produto.valor, quantidade: 1 };
    adicionarProduto(novoProduto);
    setPesquisaProduto('');
  };

  // Start editing a product
  const startEditingProduct = (produto: { id: string; nome: string; valor: number }) => {
    setEditingProduct(produto);
  };

  // Save the order - fixed to correctly include tax in the total
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
    
    // Handle money payment with change
    if (comanda.forma_pagamento === 'dinheiro' && needsTroco === null) {
      setShowTrocoModal(true);
      return;
    }
    if (comanda.forma_pagamento === 'dinheiro' && needsTroco && (quantiapagaInput === null || quantiapagaInput <= totalComTaxa)) {
      toast.error('Informe uma quantia válida para o troco (maior que o total).');
      return;
    }
    
    // Handle mixed payment
    if (comanda.forma_pagamento === 'misto') {
      const totalValores = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
      if (Math.abs(totalValores - totalComTaxa) > 0.01) {
        setShowPagamentoMistoModal(true);
        return;
      }
    }

    setSalvando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autorizado');

<<<<<<< HEAD
      const subtotal = comanda.produtos.reduce((sum, item) => sum + (item.valor * item.quantidade), 0);
      
      const novaComanda = {
        user_id: session.user.id,
        produtos: comanda.produtos,
        total: subtotal + comanda.taxaentrega,
=======
      // Fix: Make sure to include taxaentrega in the total field for proper calculations
      const novaComanda = {
        user_id: session.user.id,
        produtos: comanda.produtos,
        total: comanda.total, // Subtotal without tax
>>>>>>> 5b824500faecf066b2616fcedc782c6eb778fba6
        forma_pagamento: comanda.forma_pagamento,
        data: new Date().toISOString(),
        endereco: comanda.endereco,
        bairro: comanda.bairro,
        taxaentrega: comanda.taxaentrega, // Send as separate field
        pago: comanda.pago,
        quantiapaga: needsTroco ? quantiapagaInput || 0 : totalComTaxa,
        troco: needsTroco && quantiapagaInput ? quantiapagaInput - totalComTaxa : 0,
        valor_cartao: valorCartaoInput || 0,
        valor_dinheiro: valorDinheiroInput || 0,
        valor_pix: valorPixInput || 0,
      };

      const { data, error } = await supabase.from('comandas').insert([novaComanda]).select().single();
      if (error) throw error;

      await import('../utils/printService').then(module => {
        // Pass the correct total with tax to the print service
        module.imprimirComanda({ 
          ...novaComanda, 
          id: data.id,
          // Make sure the print service receives the right total information
          total: novaComanda.total, // Subtotal
          taxaentrega: novaComanda.taxaentrega, // Tax amount
          // Calculate the display total with tax for printing
          totalComTaxa: novaComanda.total + novaComanda.taxaentrega
        });
        toast.success('Comanda salva e enviada para impressão!');
      }).catch(() => {
        toast.error('Comanda salva, mas erro ao imprimir.');
      });

      // Reset the form
      resetarComanda(comanda.bairro, comanda.taxaentrega);
      setQuantiapagaInput(null);
      setValorCartaoInput(null);
      setValorDinheiroInput(null);
      setValorPixInput(null);
      setNeedsTroco(null);
      setPesquisaProduto('');
      await carregarComandas();
    } catch (error: any) {
      console.error('Erro ao salvar comanda:', error);
      toast.error(`Erro ao salvar comanda: ${error.message || 'Desconhecido'}`);
    } finally {
      setSalvando(false);
    }
  };

  const handleTrocoConfirmWrapper = () => {
    if (!handleTrocoConfirm()) {
      if (needsTroco === null) {
        toast.error('Selecione se precisa de troco.');
      } else if (needsTroco && (quantiapagaInput === null || quantiapagaInput <= totalComTaxa)) {
        toast.error('Quantia paga insuficiente para gerar troco.');
      }
      return;
    }
  };

  const closeTrocoModalWrapper = () => {
    const resetFormaPagamento = () => {
      setComanda(prev => ({ ...prev, forma_pagamento: '' }));
    };
    closeTrocoModal(resetFormaPagamento);
  };

  const handlePagamentoMistoConfirmWrapper = () => {
    if (!handlePagamentoMistoConfirm()) {
      const totalValores = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
      toast.error(`A soma dos valores (${totalValores.toFixed(2)}) deve ser igual ao total (${totalComTaxa.toFixed(2)}).`);
    }
  };

  const closePagamentoMistoModalWrapper = () => {
    const resetFormaPagamento = () => {
      setComanda(prev => ({ ...prev, forma_pagamento: '' }));
    };
    closePagamentoMistoModal(resetFormaPagamento);
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
    bairrosDisponiveis,
    onBairroChange,
    salvarProduto,
    editarProduto,
    removerProduto,
    atualizarQuantidadeProduto,
    onFormaPagamentoChange,
    onChange,
    handleTrocoConfirm: handleTrocoConfirmWrapper,
    closeTrocoModal: closeTrocoModalWrapper,
    handlePagamentoMistoConfirm: handlePagamentoMistoConfirmWrapper,
    closePagamentoMistoModal: closePagamentoMistoModalWrapper,
    salvarComanda,
    selecionarProdutoCadastrado,
    startEditingProduct,
  };
};
