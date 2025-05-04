
import { useState, useEffect } from 'react';

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
    // Update the payment method in the parent component first
    setComandaFormaPagamento(forma);
    
    // Handle specific logic based on payment type
    if (forma === 'dinheiro') {
      setShowTrocoModal(true);
      setNeedsTroco(null);
      // Clear other mixed payment values
      setValorCartaoInput(null);
      setValorDinheiroInput(null);
      setValorPixInput(null);
    } else if (forma === 'misto') {
      setShowPagamentoMistoModal(true);
      // Reset values when opening modal
      setValorCartaoInput(null);
      setValorDinheiroInput(null);
      setValorPixInput(null);
      setNeedsTroco(null);
      setQuantiapagaInput(null);
    } else if (forma === 'pix' || forma === 'cartao') {
      // For other payment methods, clear all values
      setShowTrocoModal(false);
      setShowPagamentoMistoModal(false);
      setNeedsTroco(null);
      setQuantiapagaInput(null);
      setValorCartaoInput(null);
      setValorDinheiroInput(null);
      setValorPixInput(null);
    } else if (forma === '') {
      // Handle case when payment method is cleared
      setShowTrocoModal(false);
      setShowPagamentoMistoModal(false);
      setNeedsTroco(null);
      setQuantiapagaInput(null);
      setValorCartaoInput(null);
      setValorDinheiroInput(null);
      setValorPixInput(null);
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
    if (needsTroco && (quantiapagaInput === null || quantiapagaInput <= 0)) {
      return false;
    }
    setShowTrocoModal(false);
    return true;
  };

  const closeTrocoModal = (resetFormaPagamento?: () => void) => {
    setShowTrocoModal(false);
    if (resetFormaPagamento) {
      resetFormaPagamento();
    }
  };

  const handlePagamentoMistoConfirm = () => {
    const totalValores = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
    
    // Allow confirmation if total is at least equal to the required amount
    if (totalValores >= totalComTaxa) {
      setShowPagamentoMistoModal(false);
      
      // If there's cash payment and it's more than needed, calculate change automatically
      if ((valorDinheiroInput || 0) > 0) {
        // Calculate only the amount needed in cash, considering other payment methods
        const valorOutrasFormas = (valorCartaoInput || 0) + (valorPixInput || 0);
        const valorNecessarioEmDinheiro = Math.max(0, totalComTaxa - valorOutrasFormas);
        
        // If cash is more than needed, set up change automatically
        if ((valorDinheiroInput || 0) > valorNecessarioEmDinheiro) {
          setQuantiapagaInput(valorDinheiroInput);
          setNeedsTroco(true);
        }
      }
      return true;
    }
    return false;
  };

  const closePagamentoMistoModal = (resetFormaPagamento?: () => void) => {
    setShowPagamentoMistoModal(false);
    if (resetFormaPagamento) {
      resetFormaPagamento();
    }
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
