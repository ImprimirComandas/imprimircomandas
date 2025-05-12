
import { useState, useEffect } from 'react';
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
    console.log('usePagamento: Resetting payment form');
    setFormaPagamento('');
    setPago(false);
    setNeedsTroco(null);
    setQuantiapagaInput(null);
    setValorCartaoInput(null);
    setValorDinheiroInput(null);
    setValorPixInput(null);
  };

  const onFormaPagamentoChange = (forma: '' | 'pix' | 'dinheiro' | 'cartao' | 'misto') => {
    console.log('usePagamento: Payment method being set to:', forma);
    setFormaPagamento(forma); // Directly set the state first for immediate UI feedback
    handlePaymentChange(forma, setFormaPagamento);
  };

  // Wrap the original closeTrocoModal to provide resetPagamento
  const handleCloseTrocoModal = () => {
    console.log('usePagamento: Closing troco modal');
    const resetFunc = () => setFormaPagamento('');
    closeChange(resetFunc);
  };

  // Wrap the original closePagamentoMistoModal to provide resetPagamento
  const handleClosePagamentoMistoModal = () => {
    console.log('usePagamento: Closing pagamento misto modal');
    const resetFunc = () => setFormaPagamento('');
    closeMixed(resetFunc);
  };

  // Debug log whenever forma_pagamento changes
  useEffect(() => {
    console.log('usePagamento: Current payment method state:', forma_pagamento);
  }, [forma_pagamento]);

  // Debug log whenever pago changes
  useEffect(() => {
    console.log('usePagamento: Current payment status state:', pago);
  }, [pago]);

  // Debug log whenever needsTroco changes
  useEffect(() => {
    console.log('usePagamento: Current needsTroco state:', needsTroco);
  }, [needsTroco]);

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
