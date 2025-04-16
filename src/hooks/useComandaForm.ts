
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

  // Handle generic input changes
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
    const resetFormaPagamento = () => {
      setComanda(prev => ({ ...prev, forma_pagamento: '' }));
    };
    
    handleFormaPagamentoChange(forma, (newForma) => {
      setComanda(prev => ({ ...prev, forma_pagamento: newForma }));
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

      // Fix: Make sure to include taxaentrega in the total field for proper calculations
      const novaComanda = {
        user_id: session.user.id,
        produtos: comanda.produtos,
        total: comanda.total, // Subtotal without tax
        forma_pagamento: comanda.forma_pagamento,
        data: new Date().toISOString(),
        endereco: comanda.endereco,
        bairro: comanda.bairro,
        taxaentrega: comanda.taxaentrega,
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
        module.imprimirComanda({ ...novaComanda, id: data.id });
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
