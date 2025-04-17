
import { useState, useEffect } from 'react';
import defaultBairroTaxas, { getBairroTaxas } from '../constants/bairroTaxas';

export const useBairros = () => {
  const [bairroTaxas, setBairroTaxas] = useState<Record<string, number>>(defaultBairroTaxas);
  const [bairrosDisponiveis, setBairrosDisponiveis] = useState<string[]>(Object.keys(defaultBairroTaxas));

  useEffect(() => {
    const fetchBairroTaxas = async () => {
      const taxas = await getBairroTaxas();
      setBairroTaxas(taxas);
      setBairrosDisponiveis(Object.keys(taxas));
    };
    
    fetchBairroTaxas();
  }, []);

  return {
    bairroTaxas,
    bairrosDisponiveis,
  };
};
