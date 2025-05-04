
import { useState } from 'react';
import { usePaymentHandling } from './usePaymentHandling';

export function usePagamento(totalComTaxa: number) {
  const [forma_pagamento, setFormaPagamento] = useState<'' | 'pix' | 'dinheiro' | 'cartao' | 'misto'>('');
  const [pago, setPago] = useState(false);

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
    handleFormaPagamentoChange: handlePaymentChange,
    handleInputChange,
    handleTrocoConfirm,
    closeTrocoModal: closeChange,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal: closeMixed,
  } = usePaymentHandling(totalComTaxa);

  const resetPagamento = () => {
    console.log("Resetting payment data");
    setFormaPagamento('');
    setPago(false);
    setNeedsTroco(null);
    setQuantiapagaInput(null);
    setValorCartaoInput(null);
    setValorDinheiroInput(null);
    setValorPixInput(null);
  };

  const onFormaPagamentoChange = (forma: '' | 'pix' | 'dinheiro' | 'cartao' | 'misto') => {
    console.log("Payment method selected:", forma);
    setFormaPagamento(forma);
    handlePaymentChange(forma, setFormaPagamento);
  };

  // Wrap the original closeTrocoModal to provide resetPagamento
  const handleCloseTrocoModal = () => {
    const resetFunc = () => setFormaPagamento('');
    closeChange(resetFunc);
  };

  // Wrap the original closePagamentoMistoModal to provide resetPagamento
  const handleClosePagamentoMistoModal = () => {
    const resetFunc = () => setFormaPagamento('');
    closeMixed(resetFunc);
  };

  return {
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
    closeTrocoModal: handleCloseTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal: handleClosePagamentoMistoModal,
    resetPagamento
  };
}
