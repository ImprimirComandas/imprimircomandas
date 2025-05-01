
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { BairroTaxa } from '../types/database';

export function useNeighborhoods() {
  const [bairros, setBairros] = useState<BairroTaxa[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBairros = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        setLoading(false);
        return;
      }

      console.log('Fetching bairros for user:', session.user.id);
      const { data, error } = await supabase
        .from('bairros_taxas')
        .select('*')
        .eq('user_id', session.user.id)
        .order('nome');

      if (error) {
        console.error('Error fetching bairros:', error);
        throw error;
      }
      
      console.log('Bairros fetched:', data ? data.length : 0, data);
      setBairros(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar bairros:', error);
      toast.error(`Erro ao carregar bairros: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addBairro = async (nome: string, taxa: number) => {
    try {
      if (nome.trim() === '') {
        toast.error('O nome do bairro não pode estar vazio');
        return;
      }

      if (isNaN(taxa) || taxa < 0) {
        toast.error('A taxa deve ser um número positivo');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      console.log('Adding bairro:', nome, taxa);
      
      const { data, error } = await supabase
        .from('bairros_taxas')
        .insert([
          {
            nome,
            taxa,
            user_id: session.user.id,
          },
        ])
        .select();

      if (error) {
        console.error('Insert error details:', error);
        throw error;
      }

      console.log('Bairro added successfully:', data);
      toast.success('Bairro adicionado com sucesso');
      await fetchBairros();
    } catch (error: any) {
      console.error('Erro ao adicionar bairro:', error);
      toast.error(`Erro ao adicionar bairro: ${error.message}`);
    }
  };

  const updateBairro = async (bairro: BairroTaxa) => {
    try {
      if (bairro.nome.trim() === '') {
        toast.error('O nome do bairro não pode estar vazio');
        return;
      }

      if (isNaN(bairro.taxa) || bairro.taxa < 0) {
        toast.error('A taxa deve ser um número positivo');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      console.log('Updating bairro:', bairro);

      const { error } = await supabase
        .from('bairros_taxas')
        .update({
          nome: bairro.nome,
          taxa: bairro.taxa,
        })
        .eq('id', bairro.id);

      if (error) {
        console.error('Erro ao atualizar bairro:', error);
        throw error;
      }

      toast.success('Bairro atualizado com sucesso');
      await fetchBairros();
    } catch (error: any) {
      console.error('Erro ao atualizar bairro:', error);
      toast.error(`Erro ao atualizar bairro: ${error.message}`);
    }
  };

  const deleteBairro = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este bairro?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      console.log('Deleting bairro:', id);

      const { error } = await supabase
        .from('bairros_taxas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir bairro:', error);
        throw error;
      }

      toast.success('Bairro excluído com sucesso');
      await fetchBairros();
    } catch (error: any) {
      console.error('Erro ao excluir bairro:', error);
      toast.error(`Erro ao excluir bairro: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchBairros();
  }, []);

  return {
    bairros,
    loading,
    addBairro,
    updateBairro,
    deleteBairro,
    refreshBairros: fetchBairros
  };
}
