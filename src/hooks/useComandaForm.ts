
import { useState, useEffect } from 'react';
import type { Comanda } from '../types/database';
import { useProdutoManagement } from './useProdutoManagement';
import { usePagamentoHandling } from './usePagamentoHandling';
import { useComandaValidation } from './useComandaValidation';
import { useBairroTaxa } from './useBairroTaxa';
import { useComandaPersistence } from './useComandaPersistence';

export const useComandaForm = (carregarComandas: () => Promise<void>, setSalvando: (value: boolean) => void) => {
  const [comanda, setComanda] = useState<Comanda>({
    produtos: [],
    total: 0,
    forma_pagamento: '',
    data: new Date().toISOString(),
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

  const {
    nomeProduto,
    valorProduto,
    quantidadeProduto,
    pesquisaProduto,
    produtosFiltrados,
    adicionarProduto: addProduto,
    removerProduto: removeProduto,
    handleChange: handleProdutoChange,
    selecionarProdutoCadastrado
  } = useProdutoManagement();

  const totalComTaxa = comanda.total + comanda.taxaentrega;

  const {
    showTrocoModal,
    needsTroco,
    quantiapagaInput,
    showPagamentoMistoModal,
    valorCartaoInput,
    valorDinheiroInput,
    valorPixInput,
    handleFormaPagamentoChange: handleFormaPagamentoChangeInternal,
    handleChange: handlePagamentoChange,
    handleTrocoConfirm: handleTrocoConfirmInternal,
    closeTrocoModal: closeTrocoModalInternal,
    handlePagamentoMistoConfirm: handlePagamentoMistoConfirmInternal,
    closePagamentoMistoModal: closePagamentoMistoModalInternal
  } = usePagamentoHandling(totalComTaxa);

  const { validarComanda: validarComandaInternal } = useComandaValidation();
  const { handleBairroChange: handleBairroChangeInternal } = useBairroTaxa();
  const { salvarComanda: salvarComandaInternal } = useComandaPersistence();

  useEffect(() => {
    const subtotal = comanda.produtos.reduce((acc, produto) => acc + (produto.valor * produto.quantidade), 0);
    setComanda(prev => ({ ...prev, total: subtotal }));
  }, [comanda.produtos]);

  // Wrapper functions to provide context
  const handleBairroChange = (bairro: string) => {
    handleBairroChangeInternal(bairro, setComanda);
  };

  const handleFormaPagamentoChange = (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => {
    handleFormaPagamentoChangeInternal(forma, setComanda);
  };

  const handleTrocoConfirm = () => {
    handleTrocoConfirmInternal(comanda.forma_pagamento, setComanda);
  };

  const closeTrocoModal = () => {
    closeTrocoModalInternal(comanda.forma_pagamento, setComanda);
  };

  const handlePagamentoMistoConfirm = () => {
    handlePagamentoMistoConfirmInternal(setComanda);
  };

  const closePagamentoMistoModal = () => {
    closePagamentoMistoModalInternal(setComanda);
  };

  const adicionarProduto = () => {
    const novosProdutos = addProduto(comanda.produtos);
    if (novosProdutos) {
      setComanda(prev => ({
        ...prev,
        produtos: novosProdutos,
      }));
    }
  };

  const removerProduto = (index: number) => {
    const novosProdutos = removeProduto(comanda.produtos, index);
    setComanda(prev => ({
      ...prev,
      produtos: novosProdutos,
    }));
  };

  const handleChange = (field: string, value: any) => {
    if (['nomeProduto', 'valorProduto', 'quantidadeProduto', 'pesquisaProduto'].includes(field)) {
      handleProdutoChange(field, value);
    } else if (['needsTroco', 'quantiapagaInput', 'valorCartaoInput', 'valorDinheiroInput', 'valorPixInput'].includes(field)) {
      handlePagamentoChange(field, value);
    } else if (field === 'endereco' || field === 'pago') {
      setComanda(prev => ({ ...prev, [field]: value }));
    }
  };

  const validarComanda = () => {
    return validarComandaInternal(
      comanda,
      needsTroco,
      valorCartaoInput,
      valorDinheiroInput,
      valorPixInput,
      totalComTaxa,
      setShowTrocoModal
    );
  };

  const resetComanda = () => {
    setComanda({
      produtos: [],
      total: 0,
      forma_pagamento: '',
      data: new Date().toISOString(),
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
  };

  const salvarComanda = async () => {
    await salvarComandaInternal(
      comanda,
      totalComTaxa,
      valorCartaoInput,
      valorDinheiroInput,
      valorPixInput,
      needsTroco,
      validarComanda,
      carregarComandas,
      setSalvando,
      resetComanda
    );
  };

  return {
    comanda,
    nomeProduto,
    valorProduto,
    quantidadeProduto,
    pesquisaProduto,
    produtosFiltrados,
    showTrocoModal,
    needsTroco,
    quantiapagaInput,
    totalComTaxa,
    showPagamentoMistoModal,
    valorCartaoInput,
    valorDinheiroInput,
    valorPixInput,
    handleBairroChange,
    adicionarProduto,
    removerProduto,
    handleFormaPagamentoChange,
    handleChange,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    salvarComanda,
    selecionarProdutoCadastrado
  };
};
