
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format, parseISO, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { Motoboy } from '@/types';

interface DeliveryStats {
  totalDeliveries: number;
  deliveriesByMotoboy: {
    motoboy_id: string;
    motoboy_nome: string;
    count: number;
  }[];
  deliveriesByBairro: {
    bairro: string;
    count: number;
  }[];
}

interface UseDeliveryStatsReturn {
  stats: DeliveryStats;
  chartData: { name: string; Entregas: number }[];
  loading: boolean;
  loadStats: (startDate: string, endDate: string) => Promise<void>;
}

export function useDeliveryStats(): UseDeliveryStatsReturn {
  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 0,
    deliveriesByMotoboy: [],
    deliveriesByBairro: [],
  });
  const [chartData, setChartData] = useState<{ name: string; Entregas: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStats = async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T23:59:59`);

      // Fetch deliveries
      const { data: entregas, error: entregasError } = await supabase
        .from('entregas')
        .select('id, motoboy_id, bairro, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (entregasError) throw entregasError;

      // Fetch motoboy names
      const { data: motoboys, error: motoboyError1 } = await supabase
        .from('motoboys')
        .select('id, nome');

      if (motoboyError1) throw motoboyError1;

      const motoboyMap = new Map(motoboys?.map(motoboy => [motoboy.id, motoboy.nome]) || []);

      // Count deliveries by motoboy
      const deliveriesByMotoboy = entregas?.reduce((acc: DeliveryStats['deliveriesByMotoboy'], entrega) => {
        const motoboyId = entrega.motoboy_id;
        const exists = acc.find(item => item.motoboy_id === motoboyId);

        if (exists) {
          exists.count += 1;
        } else {
          acc.push({
            motoboy_id: motoboyId,
            motoboy_nome: motoboyMap.get(motoboyId) || 'Desconhecido',
            count: 1,
          });
        }
        return acc;
      }, []) || [];

      // Count deliveries by neighborhood
      const deliveriesByBairro = entregas?.reduce((acc: DeliveryStats['deliveriesByBairro'], entrega) => {
        const bairro = entrega.bairro;
        const exists = acc.find(item => item.bairro === bairro);

        if (exists) {
          exists.count += 1;
        } else {
          acc.push({
            bairro,
            count: 1,
          });
        }
        return acc;
      }, []) || [];

      setStats({
        totalDeliveries: entregas?.length || 0,
        deliveriesByMotoboy,
        deliveriesByBairro,
      });

      // Generate chart data
      const days = eachDayOfInterval({ start, end });
      const chartData = days.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        const entregasDoDia = entregas?.filter(entrega => {
          const entregaDate = parseISO(entrega.created_at);
          return entregaDate >= dayStart && entregaDate <= dayEnd;
        }) || [];
        return {
          name: format(day, 'dd/MM'),
          Entregas: entregasDoDia.length,
        };
      });
      setChartData(chartData);

    } catch (error: unknown) {
      console.error('Erro ao carregar estatísticas:', error);
      if (error instanceof Error) {
        toast.error(`Erro ao carregar estatísticas: ${error.message}`);
      } else {
        toast.error('Erro ao carregar estatísticas: Erro desconhecido');
      }
    } finally {
      setLoading(false);
    }
  };

  return { stats, chartData, loading, loadStats };
}
