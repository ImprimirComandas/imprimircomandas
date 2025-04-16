
import { useState } from 'react';

export function usePaymentHandling(totalComTaxa: number) {
  const [showTrocoModal, setShowTrocoModal] = useState(false);
  const [needsTroco, setNeedsTroco] = useState<boolean | null>(null);
  const [quantiapagaInput, setQuantiapagaInput] = useState<number | null>(null);
  const [showPagamentoMistoModal, setShowPagamentoMistoModal] = useState(false);
  const [valorCartaoInput, setValorCartaoInput] = useState<number | null>(null);
  const [valorDinheiroInput, setValorDinheiroInput] = useState<number | null>(null);
  const [valorPixInput, setValorPixInput] = useState<number | null>(null);

  const handleFormaPagamentoChange = (
    forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '',
    setComandaFormaPagamento: (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => void
  ) => {
    setComandaFormaPagamento(forma);
    
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

  const handleInputChange = (field: string, value: any) => {
    if (field === 'needsTroco') {
      setNeedsTroco(value === 'true' ? true : value === 'false' ? false : null);
    } else if (field === 'quantiapagaInput') {
      setQuantiapagaInput(value ? Number(value) : null);
    } else if (field === 'valorCartaoInput') {
      setValorCartaoInput(value ? Number(value) : null);
    } else if (field === 'valorDinheiroInput') {
      setValorDinheiroInput(value ? Number(value) : null);
    } else if (field === 'valorPixInput') {
      setValorPixInput(value ? Number(value) : null);
    }
  };

  const handleTrocoConfirm = () => {
    if (needsTroco === null) {
      return false;
    }
    if (needsTroco && (quantiapagaInput === null || quantiapagaInput <= totalComTaxa)) {
      return false;
    }
    setShowTrocoModal(false);
    return true;
  };

  const closeTrocoModal = (resetFormaPagamento: () => void) => {
    setShowTrocoModal(false);
    resetFormaPagamento();
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
      return true;
    }
    return false;
  };

  const closePagamentoMistoModal = (resetFormaPagamento: () => void) => {
    setShowPagamentoMistoModal(false);
    resetFormaPagamento();
    setValorCartaoInput(null);
    setValorDinheiroInput(null);
    setValorPixInput(null);
  };

  return {
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
  };
}
