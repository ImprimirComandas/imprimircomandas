
import { useState } from 'react';
import { toast } from 'sonner';

export const usePagamentoHandling = (totalComTaxa: number) => {
  const [showTrocoModal, setShowTrocoModal] = useState(false);
  const [needsTroco, setNeedsTroco] = useState<boolean | null>(null);
  const [quantiapagaInput, setquantiapagaInput] = useState('');
  const [showPagamentoMistoModal, setShowPagamentoMistoModal] = useState(false);
  const [valorCartaoInput, setValorCartaoInput] = useState('');
  const [valorDinheiroInput, setValorDinheiroInput] = useState('');
  const [valorPixInput, setValorPixInput] = useState('');

  const handleFormaPagamentoChange = (
    forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '', 
    setComanda: (fn: (prev: any) => any) => void
  ) => {
    setComanda(prev => ({
      ...prev,
      forma_pagamento: forma,
      quantiapaga: 0,
      troco: 0,
      valor_cartao: 0,
      valor_dinheiro: 0,
      valor_pix: 0,
    }));
    setNeedsTroco(null);
    setquantiapagaInput('');
    setValorCartaoInput('');
    setValorDinheiroInput('');
    setValorPixInput('');
    
    if (forma === 'misto') {
      setShowPagamentoMistoModal(true);
    } else {
      setShowPagamentoMistoModal(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (field === 'needsTroco') {
      setNeedsTroco(value);
    } else if (field === 'quantiapagaInput') {
      setquantiapagaInput(value);
    } else if (field === 'valorCartaoInput') {
      setValorCartaoInput(value);
    } else if (field === 'valorDinheiroInput') {
      setValorDinheiroInput(value);
    } else if (field === 'valorPixInput') {
      setValorPixInput(value);
    }
  };

  const handleTrocoConfirm = (
    forma_pagamento: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '',
    setComanda: (fn: (prev: any) => any) => void
  ) => {
    if (needsTroco === null) {
      toast.error('Por favor, selecione se precisa de troco.');
      return;
    }
    
    if (needsTroco) {
      let valorDinheiro = 0;
      
      if (forma_pagamento === 'misto') {
        valorDinheiro = parseFloat(valorDinheiroInput) || 0;
      } else {
        valorDinheiro = totalComTaxa;
      }
      
      const quantia = parseFloat(quantiapagaInput);
      if (isNaN(quantia) || quantia <= valorDinheiro) {
        toast.error('Por favor, informe uma quantia válida maior que o valor em dinheiro.');
        return;
      }
      
      const trocoCalculado = quantia - valorDinheiro;
      setComanda(prev => ({
        ...prev,
        quantiapaga: quantia,
        troco: trocoCalculado,
      }));
    } else {
      setComanda(prev => ({
        ...prev,
        quantiapaga: 0,
        troco: 0,
      }));
    }
    
    setShowTrocoModal(false);
    
    if (forma_pagamento === 'misto' && showPagamentoMistoModal) {
      handlePagamentoMistoConfirm(setComanda);
    }
  };

  const closeTrocoModal = (
    forma_pagamento: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '', 
    setComanda: (fn: (prev: any) => any) => void
  ) => {
    setShowTrocoModal(false);
    setNeedsTroco(null);
    setquantiapagaInput('');
    
    if (forma_pagamento === 'dinheiro') {
      setComanda(prev => ({ ...prev, forma_pagamento: '', quantiapaga: 0, troco: 0 }));
    }
  };

  const handlePagamentoMistoConfirm = (setComanda: (fn: (prev: any) => any) => void) => {
    const valorCartao = parseFloat(valorCartaoInput) || 0;
    const valorDinheiro = parseFloat(valorDinheiroInput) || 0;
    const valorPix = parseFloat(valorPixInput) || 0;
    const totalPagamento = valorCartao + valorDinheiro + valorPix;
    
    if (Math.abs(totalPagamento - totalComTaxa) > 0.01) {
      toast.error(`O total dos pagamentos (${totalPagamento.toFixed(2)}) deve ser igual ao valor total (${totalComTaxa.toFixed(2)})`);
      return;
    }
    
    setComanda(prev => ({
      ...prev,
      valor_cartao: valorCartao,
      valor_dinheiro: valorDinheiro,
      valor_pix: valorPix,
    }));
    
    setShowPagamentoMistoModal(false);
    
    if (valorDinheiro > 0 && needsTroco === null) {
      setShowTrocoModal(true);
    }
  };

  const closePagamentoMistoModal = (setComanda: (fn: (prev: any) => any) => void) => {
    setShowPagamentoMistoModal(false);
    setValorCartaoInput('');
    setValorDinheiroInput('');
    setValorPixInput('');
    setComanda(prev => ({ 
      ...prev, 
      forma_pagamento: '', 
      valor_cartao: 0, 
      valor_dinheiro: 0, 
      valor_pix: 0 
    }));
  };

  return {
    showTrocoModal,
    needsTroco,
    quantiapagaInput,
    showPagamentoMistoModal,
    valorCartaoInput,
    valorDinheiroInput,
    valorPixInput,
    handleFormaPagamentoChange,
    handleChange,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal
  };
};
