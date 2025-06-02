
import { useState, useEffect } from 'react';
import { useBairros } from './useBairros';
import { useComandaState } from './useComandaState';
import { usePagamento } from './usePagamento';
import { useProdutoSearch } from './useProdutoSearch';
import { toast } from '@/hooks/use-toast';
import type { Comanda } from '@/types';

export const useEditOrderFormSimplified = (
  comanda: Comanda | null,
  onSave: (id: string, updatedComanda: Partial<Comanda>) => Promise<boolean>,
  onCancel: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { bairroTaxas, bairrosDisponiveis, loading: bairrosLoading } = useBairros();
  
  const {
    comanda: editedComanda,
    updateComandaField,
    onBairroChange,
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
  } = usePagamento(editedComanda.total + (editedComanda.taxaentrega || 0));

  const {
    pesquisaProduto,
    setPesquisaProduto,
    produtosFiltrados,
    loading: produtosLoading,
    startEditingProduct
  } = useProdutoSearch();

  // Initialize form with comanda data
  useEffect(() => {
    if (!comanda || isInitialized || bairrosLoading) return;

    console.log('Initializing edit form with comanda:', comanda);
    
    // Reset everything first
    resetComanda();
    resetPagamento();

    // Initialize basic fields
    updateComandaField('endereco', comanda.endereco || '');
    
    // Set payment info
    if (comanda.forma_pagamento) {
      onFormaPagamentoChange(comanda.forma_pagamento);
    }
    
    setPago(comanda.pago || false);
    
    // Set bairro and tax
    if (comanda.bairro && bairroTaxas[comanda.bairro] !== undefined) {
      onBairroChange(comanda.bairro, bairroTaxas);
    }
    
    // Set payment values
    if (comanda.quantiapaga && comanda.quantiapaga > 0) {
      setQuantiapagaInput(comanda.quantiapaga);
      if (comanda.troco && comanda.troco > 0) {
        setNeedsTroco(true);
      }
    }
    
    if (comanda.valor_cartao) setValorCartaoInput(comanda.valor_cartao);
    if (comanda.valor_dinheiro) setValorDinheiroInput(comanda.valor_dinheiro);
    if (comanda.valor_pix) setValorPixInput(comanda.valor_pix);

    // Add products
    if (comanda.produtos && comanda.produtos.length > 0) {
      comanda.produtos.forEach((produto) => {
        const produtoFormatted = {
          id: produto.id || crypto.randomUUID(),
          nome: produto.nome,
          valor: produto.valor
        };
        
        selecionarProdutoCadastrado(produtoFormatted);
        
        // Update quantity if different from 1
        if (produto.quantidade !== 1) {
          const index = editedComanda.produtos.length;
          atualizarQuantidadeProduto(index, produto.quantidade);
        }
      });
    }

    setIsInitialized(true);
  }, [comanda?.id, bairroTaxas, bairrosLoading]);

  // Reset when comanda changes
  useEffect(() => {
    setIsInitialized(false);
  }, [comanda?.id]);

  const totalComTaxa = editedComanda.total + (editedComanda.taxaentrega || 0);

  const onChange = (field: string, value: any) => {
    if (field === 'pesquisaProduto') {
      setPesquisaProduto(value);
    } else if (field === 'endereco') {
      updateComandaField('endereco', value);
    } else if (field === 'pago') {
      setPago(Boolean(value));
    } else if (field === 'needsTroco') {
      setNeedsTroco(value);
    } else if (field === 'quantiapagaInput') {
      setQuantiapagaInput(value !== null && value !== '' ? Number(value) : null);
    } else if (field === 'valorCartaoInput') {
      setValorCartaoInput(value !== null && value !== '' ? Number(value) : null);
    } else if (field === 'valorDinheiroInput') {
      setValorDinheiroInput(value !== null && value !== '' ? Number(value) : null);
    } else if (field === 'valorPixInput') {
      setValorPixInput(value !== null && value !== '' ? Number(value) : null);
    }
  };

  const handleBairroChange = (bairro: string) => {
    onBairroChange(bairro, bairroTaxas);
  };

  const handleFormaPagamentoChange = (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => {
    onFormaPagamentoChange(forma);
    updateComandaField('forma_pagamento', forma);
  };

  const validatePayment = (): boolean => {
    // Validação para pagamento em dinheiro com troco
    if (forma_pagamento === 'dinheiro' && needsTroco === true) {
      if (!quantiapagaInput || quantiapagaInput < totalComTaxa) {
        toast({
          title: "Erro no pagamento",
          description: `A quantia paga deve ser maior ou igual ao total do pedido (R$ ${totalComTaxa.toFixed(2)})`,
          variant: "destructive"
        });
        return false;
      }
    }

    // Validação para pagamento misto
    if (forma_pagamento === 'misto') {
      const totalValores = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
      if (totalValores < totalComTaxa) {
        toast({
          title: "Erro no pagamento misto",
          description: `O valor total deve ser pelo menos R$ ${totalComTaxa.toFixed(2)}`,
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSave = async (): Promise<boolean> => {
    if (!comanda?.id) return false;
    
    // Validar pagamento antes de salvar
    if (!validatePayment()) {
      return false;
    }
    
    setIsLoading(true);
    try {
      const updatedComanda: Partial<Comanda> = {
        endereco: editedComanda.endereco,
        bairro: editedComanda.bairro,
        taxaentrega: editedComanda.taxaentrega,
        produtos: editedComanda.produtos,
        total: editedComanda.total,
        forma_pagamento: forma_pagamento,
        pago: pago,
        quantiapaga: needsTroco === true ? quantiapagaInput : totalComTaxa,
        troco: needsTroco === true && quantiapagaInput ? quantiapagaInput - totalComTaxa : 0,
        valor_cartao: valorCartaoInput || 0,
        valor_dinheiro: valorDinheiroInput || 0,
        valor_pix: valorPixInput || 0,
      };

      console.log('Saving updated comanda:', updatedComanda);
      const success = await onSave(comanda.id, updatedComanda);
      if (success) {
        onCancel();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndReprint = async (): Promise<boolean> => {
    // Validar pagamento antes de salvar e reimprimir
    if (!validatePayment()) {
      return false;
    }
    
    return await handleSave();
  };

  return {
    comanda: {
      ...editedComanda,
      forma_pagamento,
      pago
    },
    pesquisaProduto,
    produtosFiltrados,
    loading: produtosLoading || bairrosLoading || isLoading,
    totalComTaxa,
    bairrosDisponiveis,
    showTrocoModal,
    needsTroco,
    quantiapagaInput,
    showPagamentoMistoModal,
    valorCartaoInput,
    valorDinheiroInput,
    valorPixInput,
    onBairroChange: handleBairroChange,
    removerProduto,
    atualizarQuantidadeProduto,
    onFormaPagamentoChange: handleFormaPagamentoChange,
    onChange,
    selecionarProdutoCadastrado,
    startEditingProduct,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    handleSave,
    handleSaveAndReprint,
    isLoading,
  };
};
