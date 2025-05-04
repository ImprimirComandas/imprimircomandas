
import { supabase } from '../lib/supabase';

export interface BairroTaxa {
  id: string;
  nome: string;
  taxa: number;
  user_id: string;
}

// Remover os bairros padrões já que agora vamos sempre buscar do banco de dados
export async function getBairroTaxas(): Promise<Record<string, number>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('Sessão não encontrada, retornando objeto vazio');
      return {};
    }

    console.log('Buscando taxas para o usuário:', session.user.id);
    const { data, error } = await supabase
      .from('bairros_taxas')
      .select('nome, taxa')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Erro ao buscar taxas:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('Nenhuma taxa encontrada');
      return {};
    }

    const taxas: Record<string, number> = {};
    data.forEach(bairro => {
      taxas[bairro.nome] = bairro.taxa;
    });
    
    console.log('Taxas carregadas com sucesso:', taxas);
    return taxas;
  } catch (error) {
    console.error('Error loading neighborhood rates:', error);
    return {};
  }
}

// Exportar um objeto vazio como fallback
export default {};
