
import { supabase } from '../lib/supabase';

export interface BairroTaxa {
  id: string;
  nome: string;
  taxa: number;
  user_id: string;
}

// Empty default rates as fallback
const defaultBairroTaxas = {};

export async function getBairroTaxas(): Promise<Record<string, number>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('Sessão não encontrada, usando taxas padrão');
      return defaultBairroTaxas;
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
      return defaultBairroTaxas;
    }

    const taxas: Record<string, number> = {};
    data.forEach(bairro => {
      taxas[bairro.nome] = bairro.taxa;
    });
    
    console.log('Taxas carregadas com sucesso:', taxas);
    return taxas;
  } catch (error) {
    console.error('Error loading neighborhood rates:', error);
    return defaultBairroTaxas;
  }
}

export default defaultBairroTaxas;
