
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { TotaisPorStatusPagamentoProps } from '../types';

interface Comanda {
  total: number;
  pago: boolean;
  data: string;
}

export default function TotaisPorStatusPagamento(props?: TotaisPorStatusPagamentoProps) {
  const [showValues, setShowValues] = useState(props?.showValues ?? true);
  const [totais, setTotais] = useState({
    confirmados: props?.confirmados ?? 0,
    naoConfirmados: props?.naoConfirmados ?? 0,
    total: props?.total ?? 0,
  });
  const [loading, setLoading] = useState(true);

  // Função para buscar totais do dia atual
  const fetchTotaisDiaAtual = async () => {
    setLoading(true);
    try {
      const start = startOfDay(new Date()).toISOString();
      const end = endOfDay(new Date()).toISOString();

      const { data, error } = await supabase
        .from('comandas')
        .select('total, pago, data')
        .gte('data', start)
        .lte('data', end);

      if (error) throw new Error(`Erro ao carregar totais: ${error.message}`);

      const comandas = data as Comanda[];

      const confirmados = comandas
        .filter(comanda => comanda.pago)
        .reduce((sum, comanda) => sum + (comanda.total || 0), 0);

      const naoConfirmados = comandas
        .filter(comanda => !comanda.pago)
        .reduce((sum, comanda) => sum + (comanda.total || 0), 0);

      const total = confirmados + naoConfirmados;

      setTotais({ confirmados, naoConfirmados, total });
    } catch (error: unknown) {
      console.error('Erro ao buscar pagamentos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar totais';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar o estado de showValues do Supabase
  const loadShowValuesState = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('show_payment_values')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: registro não encontrado
        throw new Error(`Erro ao carregar configuração: ${error.message}`);
      }

      setShowValues(data?.show_payment_values ?? true);
    } catch (error: unknown) {
      console.error('Erro ao carregar configuração:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar configuração';
      toast.error(errorMessage);
    }
  };

  // Função para salvar o estado de showValues no Supabase
  const saveShowValuesState = async (value: boolean) => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert(
          { user_id: (await supabase.auth.getUser()).data.user?.id, show_payment_values: value },
          { onConflict: 'user_id' }
        );

      if (error) throw new Error(`Erro ao salvar configuração: ${error.message}`);
    } catch (error: unknown) {
      console.error('Erro ao salvar configuração:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar configuração';
      toast.error(errorMessage);
    }
  };

  // Carregar totais e estado de showValues ao montar o componente
  useEffect(() => {
    if (!props?.confirmados) {
      fetchTotaisDiaAtual();
    }
    if (props?.showValues === undefined) {
      loadShowValuesState();
    }
  }, [props]);

  // Função para alternar showValues e salvar no Supabase
  const toggleShowValues = () => {
    const newValue = !showValues;
    setShowValues(newValue);
    if (props?.toggleShowValues) {
      props.toggleShowValues();
    } else {
      saveShowValuesState(newValue);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Status de Pagamentos - Hoje</h2>
        <button
          onClick={toggleShowValues}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          title={showValues ? 'Ocultar valores' : 'Exibir valores'}
        >
          {showValues ? (
            <Eye className="h-5 w-5 text-gray-600" />
          ) : (
            <EyeOff className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-800">Confirmados</p>
            <p className="text-lg font-bold text-green-900">
              {showValues ? `R$ ${totais.confirmados.toFixed(2)}` : '****'}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-800">Não Confirmados</p>
            <p className="text-lg font-bold text-red-900">
              {showValues ? `R$ ${totais.naoConfirmados.toFixed(2)}` : '****'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Total</p>
            <p className="text-lg font-bold text-gray-900">
              {showValues ? `R$ ${totais.total.toFixed(2)}` : '****'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
