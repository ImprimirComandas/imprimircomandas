
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
    // Sempre definir a forma de pagamento imediatamente
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

  // Modified to make resetFormaPagamento optional
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
    
    // Verifica se o total está correto (permitindo uma pequena margem de erro)
    if (Math.abs(totalValores - totalComTaxa) < 0.01) {
      setShowPagamentoMistoModal(false);
      
      // Se houver pagamento em dinheiro e for maior que o valor atribuído a esta forma,
      // calculamos o troco automaticamente
      if ((valorDinheiroInput || 0) > 0) {
        // Não precisamos mostrar o modal de troco aqui, pois o valor já foi especificado
        setQuantiapagaInput(valorDinheiroInput);
        setNeedsTroco(false);
      }
      return true;
    }
    return false;
  };

  // Modified to make resetFormaPagamento optional
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
