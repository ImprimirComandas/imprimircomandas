
import { useState } from 'react';

export const useBairroTaxa = () => {
  const handleBairroChange = (bairro: string, setComanda: (fn: (prev: any) => any) => void) => {
    const taxaentrega = bairro === 'Jardim Paraíso' ? 6 : 9;
    setComanda(prev => ({
      ...prev,
      bairro,
      taxaentrega,
    }));
  };

  return {
    handleBairroChange
  };
};
