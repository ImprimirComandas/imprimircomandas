
import { useState, useEffect } from 'react';
import { useComandaForm } from './useComandaForm';
import type { Comanda } from '@/types';

export const useEditOrderForm = (
  comanda: Comanda | null,
  onSave: (id: string, updatedComanda: Partial<Comanda>) => Promise<boolean>,
  onCancel: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    comanda: editedComanda,
    pesquisaProduto,
    produtosFiltrados,
    loading,
    totalComTaxa,
    bairrosDisponiveis,
    showTrocoModal,
    needsTroco,
    quantiapagaInput,
    showPagamentoMistoModal,
    valorCartaoInput,
    valorDinheiroInput,
    valorPixInput,
    onBairroChange,
    removerProduto,
    atualizarQuantidadeProduto,
    onFormaPagamentoChange,
    onChange,
    selecionarProdutoCadastrado,
    startEditingProduct,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    resetComanda,
  } = useComandaForm(
    async () => {},
    () => {}
  );

  useEffect(() => {
    if (!comanda || isInitialized) return;

    console.log('Inicializando form de edição com comanda:', comanda);
    
    // Reset the form first
    resetComanda();

    // Set basic info with proper delay to ensure bairros are loaded
    setTimeout(() => {
      onChange('endereco', comanda.endereco || '');
      
      // Set bairro and trigger tax calculation
      if (comanda.bairro) {
        onBairroChange(comanda.bairro);
      }
      
      // Set payment info
      if (comanda.forma_pagamento) {
        onFormaPagamentoChange(comanda.forma_pagamento);
      }
      
      onChange('pago', comanda.pago || false);
      
      // Set payment values
      if (comanda.quantiapaga) {
        onChange('quantiapagaInput', comanda.quantiapaga);
      }
      if (comanda.troco && comanda.troco > 0) {
        onChange('needsTroco', true);
      }
      if (comanda.valor_cartao) {
        onChange('valorCartaoInput', comanda.valor_cartao);
      }
      if (comanda.valor_dinheiro) {
        onChange('valorDinheiroInput', comanda.valor_dinheiro);
      }
      if (comanda.valor_pix) {
        onChange('valorPixInput', comanda.valor_pix);
      }

      // Add products with proper delay
      if (comanda.produtos && comanda.produtos.length > 0) {
        comanda.produtos.forEach((produto, index) => {
          setTimeout(() => {
            const produtoFormatted = {
              id: produto.id || crypto.randomUUID(),
              nome: produto.nome,
              valor: produto.valor
            };
            
            selecionarProdutoCadastrado(produtoFormatted);
            
            // Update quantity if different from 1
            if (produto.quantidade !== 1) {
              setTimeout(() => {
                atualizarQuantidadeProduto(index, produto.quantidade);
              }, 100);
            }
          }, index * 100);
        });
      }

      setIsInitialized(true);
    }, 500);
  }, [comanda?.id]);

  // Reset initialization when comanda changes
  useEffect(() => {
    setIsInitialized(false);
  }, [comanda?.id]);

  const handleSave = async () => {
    if (!comanda?.id) return;
    
    setIsLoading(true);
    try {
      const updatedComanda: Partial<Comanda> = {
        endereco: editedComanda.endereco,
        bairro: editedComanda.bairro,
        taxaentrega: editedComanda.taxaentrega,
        produtos: editedComanda.produtos,
        total: totalComTaxa,
        forma_pagamento: editedComanda.forma_pagamento,
        pago: editedComanda.pago,
        quantiapaga: needsTroco === true ? quantiapagaInput : totalComTaxa,
        troco: needsTroco === true && quantiapagaInput ? quantiapagaInput - totalComTaxa : 0,
        valor_cartao: valorCartaoInput || 0,
        valor_dinheiro: valorDinheiroInput || 0,
        valor_pix: valorPixInput || 0,
      };

      console.log('Salvando comanda atualizada:', updatedComanda);
      const success = await onSave(comanda.id, updatedComanda);
      if (success) {
        onCancel();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    comanda: editedComanda,
    pesquisaProduto,
    produtosFiltrados,
    loading: loading || isLoading,
    totalComTaxa,
    bairrosDisponiveis,
    showTrocoModal,
    needsTroco,
    quantiapagaInput,
    showPagamentoMistoModal,
    valorCartaoInput,
    valorDinheiroInput,
    valorPixInput,
    onBairroChange,
    removerProduto,
    atualizarQuantidadeProduto,
    onFormaPagamentoChange,
    onChange,
    selecionarProdutoCadastrado,
    startEditingProduct,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    handleSave,
    handleCancel: onCancel,
    isLoading,
  };
};
