
import { supabase } from '../lib/supabase';

export interface BairroTaxa {
  id: string;
  nome: string;
  taxa: number;
  user_id: string;
}

// Default rates as fallback
const defaultBairroTaxas = {
  'Jardim Paraíso': 6,
  'Aventureiro': 9,
  'Jardim Sofia': 9,
  'Cubatão': 9,
};

export async function getBairroTaxas(): Promise<Record<string, number>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return defaultBairroTaxas;

    const { data, error } = await supabase
      .from('bairros_taxas')
      .select('nome, taxa')
      .eq('user_id', session.user.id);

    if (error) throw error;

    if (!data || data.length === 0) return defaultBairroTaxas;

    const taxas: Record<string, number> = {};
    data.forEach(bairro => {
      taxas[bairro.nome] = bairro.taxa;
    });

    return taxas;
  } catch (error) {
    console.error('Error loading neighborhood rates:', error);
    return defaultBairroTaxas;
  }
}

export default defaultBairroTaxas;
