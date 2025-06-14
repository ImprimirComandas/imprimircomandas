import { useState } from 'react';
import { useBairros } from './useBairros';
import { useProdutoSearch } from './useProdutoSearch';
import { usePagamento } from './usePagamento';
import { useComandaState } from './useComandaState';
import { useSalvarComanda } from './useSalvarComanda';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth'; // Para pegar o usuário logado
import { usePendingComandasCount } from './usePendingComandasCount'; // Novo hook

export const MAX_PENDING_COMANDAS = 3;

export const useComandaForm = (carregarComandas: () => Promise<void>, setSalvando: (value: boolean) => void) => {
  const { bairroTaxas, bairrosDisponiveis, loading: bairrosLoading, refreshBairros } = useBairros();
  const { user } = useAuth(); // Pega o usuário logado
  const { pendingCount, loading: loadingPendentes } = usePendingComandasCount(user?.id);

  const {
    comanda,
    subtotal,
    totalComTaxa,
    updateComandaField,
    onBairroChange: updateBairro,
    selecionarProdutoCadastrado,
    removerProduto,
    atualizarQuantidadeProduto,
    resetComanda
  } = useComandaState('', 0);

  const {
    forma_pagamento,
    pago,
    setPago,
    showTrocoModal,
    needsTroco,
    setNeedsTroco,
    quantiapagaInput,
    setQuantiapagaInput,
    showPagamentoMistoModal,
    valorCartaoInput,
    setValorCartaoInput,
    valorDinheiroInput,
    setValorDinheiroInput,
    valorPixInput,
    setValorPixInput,
    onFormaPagamentoChange,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    resetPagamento
  } = usePagamento(totalComTaxa);

  const {
    pesquisaProduto,
    setPesquisaProduto,
    produtosFiltrados,
    editingProduct,
    setEditingProduct,
    salvarProduto,
    editarProduto,
    loading: produtosLoading,
    startEditingProduct
  } = useProdutoSearch();

  // Update the comanda object with the current payment method and status
  const comandaWithPayment = {
    ...comanda,
    forma_pagamento,
    pago
  };

  const { salvando, salvarComanda } = useSalvarComanda(
    comandaWithPayment,  // Pass the updated comanda with current payment info
    totalComTaxa,
    needsTroco,
    quantiapagaInput,
    valorCartaoInput,
    valorDinheiroInput,
    valorPixInput,
    resetComanda,
    resetPagamento,
    carregarComandas
  );

  const onChange = (field: string, value: any) => {
    console.log(`useComandaForm: Change detected: ${field} =`, value);
    
    if (field === 'pesquisaProduto') {
      setPesquisaProduto(value);
    } 
    else if (field === 'endereco') {
      updateComandaField('endereco', value);
    } 
    else if (field === 'pago') {
      console.log('useComandaForm: Setting pago to:', value);
      // Ensure boolean value is passed to setPago and update the comanda state
      const boolValue = Boolean(value);
      setPago(boolValue);
      updateComandaField('pago', boolValue);
    }
    else if (field === 'needsTroco') {
      console.log('useComandaForm: Setting needsTroco to:', value);
      // Handle needsTroco explicitly as a boolean
      const boolValue = typeof value === 'boolean' ? value : (value === 'true' ? true : value === 'false' ? false : null);
      setNeedsTroco(boolValue);
    }
    else if (field === 'quantiapagaInput') {
      const numValue = value !== null && value !== '' ? Number(value) : null;
      setQuantiapagaInput(numValue);
    }
    else if (field === 'valorCartaoInput') {
      setValorCartaoInput(value !== null && value !== '' ? Number(value) : null);
    }
    else if (field === 'valorDinheiroInput') {
      setValorDinheiroInput(value !== null && value !== '' ? Number(value) : null);
    }
    else if (field === 'valorPixInput') {
      setValorPixInput(value !== null && value !== '' ? Number(value) : null);
    }
  };

  const onBairroChange = (bairro: string) => {
    if (!bairro) {
      toast.warning('Selecione um bairro válido');
      return;
    }
    
    if (!bairroTaxas[bairro] && bairroTaxas[bairro] !== 0) {
      toast.error(`Taxa não encontrada para o bairro ${bairro}`);
      return;
    }
    
    updateBairro(bairro, bairroTaxas);
  };

  // Ensure payment method is synced with comanda state
  const handleFormaPagamentoChange = (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => {
    console.log('useComandaForm: Setting forma_pagamento to:', forma);
    onFormaPagamentoChange(forma);
    updateComandaField('forma_pagamento', forma);
  };

  // Determinar se está bloqueado pelo limite de pendentes
  const isCadastroBloqueado = pendingCount >= MAX_PENDING_COMANDAS;

  return {
    comanda: comandaWithPayment, // Return the updated comanda with payment info
    pesquisaProduto,
    produtosFiltrados,
    loading: produtosLoading || bairrosLoading,
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
    onFormaPagamentoChange: handleFormaPagamentoChange,
    onChange,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    salvarComanda,
    selecionarProdutoCadastrado,
    startEditingProduct,
    refreshBairros,
    resetComanda, // Add this to the return object
    isCadastroBloqueado,
    loadingBloqueio: loadingPendentes,
  };
};
