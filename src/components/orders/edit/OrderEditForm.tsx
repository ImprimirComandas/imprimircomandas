
import React from 'react';
import { useEditOrderFormSimplified } from '@/hooks/useEditOrderFormSimplified';
import ComandaForm from '@/components/comanda/ComandaForm';
import TrocoModalComponent from '@/components/TrocoModalComponent';
import PagamentoMistoModal from '@/components/PagamentoMistoModal';
import type { Comanda } from '@/types';

interface OrderEditFormProps {
  comanda: Comanda | null;
  onSave: (id: string, updatedComanda: Partial<Comanda>) => Promise<boolean>;
  onCancel: () => void;
  onReprint?: (comanda: Comanda) => void;
}

export function OrderEditForm({ comanda, onSave, onCancel, onReprint }: OrderEditFormProps) {
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
    handleSave,
    handleSaveAndReprint,
    isLoading,
  } = useEditOrderFormSimplified(comanda, onSave, onCancel);

  if (!comanda) return null;

  const handleSaveAndReprintWrapper = async () => {
    if (!comanda?.id) return;
    
    const success = await handleSaveAndReprint();
    if (success && onReprint) {
      // Create updated comanda object for reprinting
      const updatedComanda: Comanda = {
        ...comanda,
        endereco: editedComanda.endereco,
        bairro: editedComanda.bairro,
        taxaentrega: editedComanda.taxaentrega,
        produtos: editedComanda.produtos,
        total: editedComanda.total,
        forma_pagamento: editedComanda.forma_pagamento,
        pago: editedComanda.pago,
        quantiapaga: needsTroco === true ? quantiapagaInput : totalComTaxa,
        troco: needsTroco === true && quantiapagaInput ? quantiapagaInput - totalComTaxa : 0,
        valor_cartao: valorCartaoInput || 0,
        valor_dinheiro: valorDinheiroInput || 0,
        valor_pix: valorPixInput || 0,
      };
      onReprint(updatedComanda);
    }
  };

  return (
    <>
      <ComandaForm
        comanda={editedComanda}
        pesquisaProduto={pesquisaProduto}
        produtosFiltrados={produtosFiltrados}
        loading={loading}
        salvando={isLoading}
        totalComTaxa={totalComTaxa}
        bairrosDisponiveis={bairrosDisponiveis}
        onRemoveProduto={removerProduto}
        onUpdateQuantidade={atualizarQuantidadeProduto}
        onSaveComanda={handleSave}
        onChange={onChange}
        onBairroChange={onBairroChange}
        onFormaPagamentoChange={onFormaPagamentoChange}
        selecionarProdutoCadastrado={selecionarProdutoCadastrado}
        startEditingProduct={startEditingProduct}
        mode="edit"
        onSaveAndReprint={onReprint ? handleSaveAndReprintWrapper : undefined}
        layout="horizontal"
      />

      <TrocoModalComponent
        show={showTrocoModal}
        needsTroco={needsTroco}
        quantiapagaInput={quantiapagaInput}
        totalComTaxa={totalComTaxa}
        onClose={closeTrocoModal}
        onConfirm={handleTrocoConfirm}
        onChange={onChange}
      />

      <PagamentoMistoModal
        show={showPagamentoMistoModal}
        valorCartaoInput={valorCartaoInput}
        valorDinheiroInput={valorDinheiroInput}
        valorPixInput={valorPixInput}
        totalComTaxa={totalComTaxa}
        onClose={closePagamentoMistoModal}
        onConfirm={handlePagamentoMistoConfirm}
        onChange={onChange}
      />
    </>
  );
}
