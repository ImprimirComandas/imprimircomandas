
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
    handleFormaPagamentoChange,
    handleInputChange,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
  } = usePaymentHandling(totalComTaxa);

  const resetPagamento = () => {
    setFormaPagamento('');
    setPago(false);
    setNeedsTroco(null);
    setQuantiapagaInput(null);
    setValorCartaoInput(null);
    setValorDinheiroInput(null);
    setValorPixInput(null);
  };

  const onFormaPagamentoChange = (forma: '' | 'pix' | 'dinheiro' | 'cartao' | 'misto') => {
    handleFormaPagamentoChange(forma, setFormaPagamento);
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
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    resetPagamento
  };
}
