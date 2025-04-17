
import { useState, useEffect } from 'react';
import { format, parseISO, startOfDay, endOfDay, subDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useChartData = () => {
  const [chartData, setChartData] = useState<{ name: string; Pedidos: number; Valor: number }[]>([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const endDate = endOfDay(new Date()).toISOString();
        const startDate = startOfDay(subDays(new Date(), 6)).toISOString();

        const { data, error } = await supabase
          .from('comandas')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate);

        if (error) throw error;

        const dataByDay = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          const comandasDoDia = data?.filter(comanda => {
            const comandaDate = parseISO(comanda.created_at);
            return (
              comandaDate >= startOfDay(date) && comandaDate <= endOfDay(date)
            );
          }) || [];
          return {
            name: format(date, 'dd/MM'),
            Pedidos: comandasDoDia.length,
            Valor: comandasDoDia.reduce((sum, comanda) => sum + (comanda.total || 0), 0),
          };
        });

        setChartData(dataByDay);
      } catch (error) {
        console.error('Erro ao carregar dados do gráfico:', error);
        toast.error('Erro ao carregar dados do gráfico');
      }
    };

    fetchChartData();
  }, []);

  return chartData;
};
