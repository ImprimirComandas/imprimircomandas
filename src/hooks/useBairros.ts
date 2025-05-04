
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useBairros = () => {
  const [bairroTaxas, setBairroTaxas] = useState<Record<string, number>>({});
  const [bairrosDisponiveis, setBairrosDisponiveis] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBairroTaxas = async () => {
    try {
      setLoading(true);
      // Obter o usuário atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('Usuário não autenticado para buscar bairros');
        toast.error('Você precisa estar autenticado para buscar bairros');
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
        console.log('Nenhum bairro encontrado');
        // Objeto vazio ao invés de valores padrão
        setBairroTaxas({});
        setBairrosDisponiveis([]);
        toast.warning('Nenhum bairro cadastrado. Adicione bairros nas configurações.');
      }
    } catch (error) {
      console.error('Erro ao carregar taxas de bairros:', error);
      toast.error('Erro ao carregar taxas de bairros');
      // Objeto vazio ao invés de valores padrão
      setBairroTaxas({});
      setBairrosDisponiveis([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBairroTaxas();

    // Set up real-time subscription
    const bairrosChannel = supabase
      .channel('bairros_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bairros_taxas'
        },
        (payload) => {
          console.log('Real-time update from bairros_taxas:', payload);
          fetchBairroTaxas();
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(bairrosChannel);
    };
  }, []);

  return {
    bairroTaxas,
    bairrosDisponiveis,
    loading,
    refreshBairros: fetchBairroTaxas
  };
};
