
import { useState } from 'react';
import { toast } from 'sonner';

export const usePagamento = (totalComTaxa: number) => {
  const [forma_pagamento, setFormaPagamento] = useState<'' | 'pix' | 'dinheiro' | 'cartao' | 'misto'>('');
  const [showTrocoModal, setShowTrocoModal] = useState(false);
  const [needsTroco, setNeedsTroco] = useState<boolean | null>(null);
  const [quantiapagaInput, setQuantiapagaInput] = useState<number | null>(null);
  const [showPagamentoMistoModal, setShowPagamentoMistoModal] = useState(false);
  const [valorCartaoInput, setValorCartaoInput] = useState<number | null>(null);
  const [valorDinheiroInput, setValorDinheiroInput] = useState<number | null>(null);
  const [valorPixInput, setValorPixInput] = useState<number | null>(null);
  const [pago, setPago] = useState(false);

  const onFormaPagamentoChange = (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => {
    setFormaPagamento(forma);
    if (forma === 'dinheiro') {
      setShowTrocoModal(true);
      setNeedsTroco(null);
    } else if (forma === 'misto') {
      setShowPagamentoMistoModal(true);
    } else {
      setShowTrocoModal(false);
      setShowPagamentoMistoModal(false);
      setNeedsTroco(null);
      setQuantiapagaInput(null);
    }
  };

  const handleTrocoConfirm = () => {
    if (needsTroco === null) {
      toast.error('Selecione se precisa de troco.');
      return;
    }
    if (needsTroco && (quantiapagaInput === null || quantiapagaInput <= totalComTaxa)) {
      toast.error('Quantia paga insuficiente para gerar troco.');
      return;
    }
    setShowTrocoModal(false);
  };

  const closeTrocoModal = () => {
    setShowTrocoModal(false);
    if (forma_pagamento === 'dinheiro') {
      setFormaPagamento('');
    }
    setQuantiapagaInput(null);
    setNeedsTroco(null);
  };

  const handlePagamentoMistoConfirm = () => {
    const totalValores = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
    if (Math.abs(totalValores - totalComTaxa) < 0.01) {
      setShowPagamentoMistoModal(false);
      
      if ((valorDinheiroInput || 0) > 0 && needsTroco === null) {
        setShowTrocoModal(true);
      }
    } else {
      toast.error(`A soma dos valores (${totalValores.toFixed(2)}) deve ser igual ao total (${totalComTaxa.toFixed(2)}).`);
    }
  };

  const closePagamentoMistoModal = () => {
    setShowPagamentoMistoModal(false);
    setFormaPagamento('');
    setValorCartaoInput(null);
    setValorDinheiroInput(null);
    setValorPixInput(null);
  };

  const resetPagamento = () => {
    setFormaPagamento('');
    setPago(false);
    setNeedsTroco(null);
    setQuantiapagaInput(null);
    setValorCartaoInput(null);
    setValorDinheiroInput(null);
    setValorPixInput(null);
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
    resetPagamento,
  };
};
