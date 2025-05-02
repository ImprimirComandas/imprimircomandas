
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
    // Sempre definir a forma de pagamento imediatamente
    setComandaFormaPagamento(forma);
    
    if (forma === 'dinheiro') {
      setShowTrocoModal(true);
      setNeedsTroco(null);
      // Limpar outros valores de pagamento misto
      setValorCartaoInput(null);
      setValorDinheiroInput(null);
      setValorPixInput(null);
    } else if (forma === 'misto') {
      setShowPagamentoMistoModal(true);
      // Reset valores ao abrir o modal
      setValorCartaoInput(null);
      setValorDinheiroInput(null);
      setValorPixInput(null);
      setNeedsTroco(null);
      setQuantiapagaInput(null);
    } else {
      // Para outras formas de pagamento, limpar todos os valores
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
    if (needsTroco && (quantiapagaInput === null || quantiapagaInput <= totalComTaxa)) {
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
    setQuantiapagaInput(null);
    setNeedsTroco(null);
  };

  const handlePagamentoMistoConfirm = () => {
    const totalValores = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
    
    // Agora permitimos confirmar pagamento mesmo com troco
    if (totalValores >= totalComTaxa) {
      setShowPagamentoMistoModal(false);
      
      // Se houver pagamento em dinheiro e for maior que o valor atribuído a esta forma,
      // calculamos o troco automaticamente
      if ((valorDinheiroInput || 0) > 0) {
        // Calcula apenas o valor necessário em dinheiro, considerando as outras formas
        const valorOutrasFormas = (valorCartaoInput || 0) + (valorPixInput || 0);
        const valorNecessarioEmDinheiro = Math.max(0, totalComTaxa - valorOutrasFormas);
        
        // Se o dinheiro for maior que o necessário, configura o troco automaticamente
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
