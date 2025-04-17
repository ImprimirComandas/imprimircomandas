
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useVisibilityPreference = () => {
  const [showValues, setShowValues] = useState<boolean>(false);

  useEffect(() => {
    const fetchShowValuesPreference = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('show_values')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setShowValues(data?.show_values || false);
      } catch (error) {
        console.error('Erro ao carregar preferência de visibilidade:', error);
        toast.error('Erro ao carregar preferência de visibilidade');
      }
    };

    fetchShowValuesPreference();
  }, []);

  const toggleShowValues = async () => {
    const newShowValues = !showValues;
    setShowValues(newShowValues);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ show_values: newShowValues })
        .eq('id', session.user.id);

      if (error) throw error;
      toast.success(`Valores ${newShowValues ? 'exibidos' : 'ocultos'} com sucesso`);
    } catch (error) {
      console.error('Erro ao salvar preferência de visibilidade:', error);
      toast.error('Erro ao salvar preferência de visibilidade');
      setShowValues(!newShowValues); // Reverter se falhar
    }
  };

  return { showValues, toggleShowValues };
};
