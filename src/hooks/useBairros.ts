
import { useState, useEffect } from 'react';
import defaultBairroTaxas, { getBairroTaxas } from '../constants/bairroTaxas';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useBairros = () => {
  const [bairroTaxas, setBairroTaxas] = useState<Record<string, number>>({});
  const [bairrosDisponiveis, setBairrosDisponiveis] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBairroTaxas = async () => {
      try {
        setLoading(true);
        // Obter o usuário atual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('Usuário não autenticado para buscar bairros');
          setBairroTaxas(defaultBairroTaxas);
          setBairrosDisponiveis(Object.keys(defaultBairroTaxas));
          return;
        }
        
        console.log('Buscando bairros para o usuário:', session.user.id);
        
        // Buscar os bairros do usuário atual
        const { data, error } = await supabase
          .from('bairros_taxas')
          .select('nome, taxa')
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Erro ao buscar bairros:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          const taxas: Record<string, number> = {};
          data.forEach(bairro => {
            taxas[bairro.nome] = bairro.taxa;
          });
          console.log('Bairros carregados:', data.length, taxas);
          setBairroTaxas(taxas);
          setBairrosDisponiveis(Object.keys(taxas));
        } else {
          console.log('Nenhum bairro encontrado, usando defaults');
          setBairroTaxas(defaultBairroTaxas);
          setBairrosDisponiveis(Object.keys(defaultBairroTaxas));
        }
      } catch (error) {
        console.error('Erro ao carregar taxas de bairros:', error);
        setBairroTaxas(defaultBairroTaxas);
        setBairrosDisponiveis(Object.keys(defaultBairroTaxas));
      } finally {
        setLoading(false);
      }
    };
    
    fetchBairroTaxas();
  }, []);

  return {
    bairroTaxas,
    bairrosDisponiveis,
    loading,
  };
};
