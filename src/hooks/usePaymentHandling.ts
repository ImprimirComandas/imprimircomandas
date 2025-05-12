
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
    console.log('usePaymentHandling: Payment method being set to:', forma);
    // Update the payment method in the parent component first
    setComandaFormaPagamento(forma);
    
    // Handle specific logic based on payment type
    if (forma === 'dinheiro') {
      setShowTrocoModal(true);
      setNeedsTroco(null); // Reset to null when opening modal
      console.log('usePaymentHandling: Opening troco modal, needsTroco reset to null');
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
    console.log(`usePaymentHandling: Handling input change for ${field}:`, value);
    
    if (field === 'needsTroco') {
      // Ensure we're always setting a boolean value
      const boolValue = typeof value === 'string' 
        ? value === 'true' 
        : Boolean(value);
      
      console.log(`usePaymentHandling: Setting needsTroco to boolean:`, boolValue);
      setNeedsTroco(boolValue);
    } else if (field === 'quantiapagaInput') {
      const numValue = value !== null && value !== '' ? Number(value) : null;
      console.log(`usePaymentHandling: Setting quantiapagaInput to:`, numValue);
      setQuantiapagaInput(numValue);
    } else if (field === 'valorCartaoInput') {
      setValorCartaoInput(value !== null && value !== '' ? Number(value) : null);
    } else if (field === 'valorDinheiroInput') {
      setValorDinheiroInput(value !== null && value !== '' ? Number(value) : null);
    } else if (field === 'valorPixInput') {
      setValorPixInput(value !== null && value !== '' ? Number(value) : null);
    }
  };

  const handleTrocoConfirm = () => {
    console.log('usePaymentHandling: Confirming troco with needsTroco:', needsTroco);
    
    if (needsTroco === null) {
      console.log('usePaymentHandling: Cannot confirm - needsTroco is null');
      return false;
    }
    
    if (needsTroco === true && (quantiapagaInput === null || quantiapagaInput <= 0)) {
      console.log('usePaymentHandling: Cannot confirm - invalid quantia paga');
      return false;
    }
    
    console.log('usePaymentHandling: Troco confirmed successfully');
    setShowTrocoModal(false);
    return true;
  };

  const closeTrocoModal = (resetFormaPagamento?: () => void) => {
    console.log('usePaymentHandling: Closing troco modal');
    setShowTrocoModal(false);
    if (resetFormaPagamento) {
      console.log('usePaymentHandling: Resetting forma pagamento');
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

  // Debug logs to track state changes
  useEffect(() => {
    console.log('usePaymentHandling: needsTroco changed to:', needsTroco);
  }, [needsTroco]);

  useEffect(() => {
    console.log('usePaymentHandling: quantiapagaInput changed to:', quantiapagaInput);
  }, [quantiapagaInput]);

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
