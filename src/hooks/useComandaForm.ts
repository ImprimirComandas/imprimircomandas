
import { useState } from 'react';
import { useBairros } from './useBairros';
import { useProdutoSearch } from './useProdutoSearch';
import { usePagamento } from './usePagamento';
import { useComandaState } from './useComandaState';
import { useSalvarComanda } from './useSalvarComanda';
import { toast } from 'sonner';

export const useComandaForm = (carregarComandas: () => Promise<void>, setSalvando: (value: boolean) => void) => {
  const { bairroTaxas, bairrosDisponiveis } = useBairros();
  
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
  } = useComandaState(
    Object.keys(bairroTaxas)[0] || 'Jardim Paraíso', 
    Object.values(bairroTaxas)[0] || 6
  );

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
    loading,
    startEditingProduct
  } = useProdutoSearch();

  const { salvando, salvarComanda } = useSalvarComanda(
    { ...comanda, forma_pagamento, pago },
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
    if (field === 'pesquisaProduto') setPesquisaProduto(value);
    else if (field === 'endereco') updateComandaField('endereco', value);
    else if (field === 'pago') setPago(value);
    else if (field === 'quantiapagaInput') setQuantiapagaInput(value ? Number(value) : null);
    else if (field === 'needsTroco') setNeedsTroco(value === 'true' ? true : value === 'false' ? false : null);
    else if (field === 'valorCartaoInput') setValorCartaoInput(value ? Number(value) : null);
    else if (field === 'valorDinheiroInput') setValorDinheiroInput(value ? Number(value) : null);
    else if (field === 'valorPixInput') setValorPixInput(value ? Number(value) : null);
  };

  const onBairroChange = (bairro: string) => {
    updateBairro(bairro, bairroTaxas);
  };

  return {
    comanda: { ...comanda, forma_pagamento, pago },
    pesquisaProduto,
    produtosFiltrados,
    loading,
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
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    salvarComanda,
    selecionarProdutoCadastrado,
    startEditingProduct,
  };
};
