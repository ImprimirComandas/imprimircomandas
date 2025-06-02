
import { useState, useEffect } from 'react';
import { format, parseISO, startOfDay, endOfDay, subDays, subWeeks, subMonths, subYears, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export type ChartPeriod = 'today' | 'week' | 'month' | 'year' | 'all';

export const useChartData = (period: ChartPeriod = 'week') => {
  const [chartData, setChartData] = useState<{ name: string; Pedidos: number; Valor: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const getDateRange = (selectedPeriod: ChartPeriod) => {
    const now = new Date();
    let startDate: Date;
    let endDate = endOfDay(now);

    switch (selectedPeriod) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = startOfDay(subDays(now, 6));
        break;
      case 'month':
        startDate = startOfDay(subDays(now, 29));
        break;
      case 'year':
        startDate = startOfDay(subDays(now, 364));
        break;
      case 'all':
        // Get the earliest order date, default to 1 year ago if no orders
        startDate = startOfDay(subYears(now, 1));
        break;
      default:
        startDate = startOfDay(subDays(now, 6));
    }

    return { startDate, endDate };
  };

  const groupDataByPeriod = (data: any[], selectedPeriod: ChartPeriod, startDate: Date, endDate: Date) => {
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'today':
        // Show hourly data for today
        const hours = Array.from({ length: 24 }, (_, i) => {
          const hour = i;
          const comandasHora = data?.filter(comanda => {
            const comandaDate = parseISO(comanda.created_at);
            return comandaDate.getHours() === hour && 
                   comandaDate >= startOfDay(now) && 
                   comandaDate <= endOfDay(now);
          }) || [];
          
          return {
            name: `${hour.toString().padStart(2, '0')}h`,
            Pedidos: comandasHora.length,
            Valor: comandasHora.reduce((sum, comanda) => sum + (comanda.total || 0), 0),
          };
        });
        return hours;

      case 'week':
        // Show daily data for the week
        return Array.from({ length: 7 }, (_, i) => {
          const date = subDays(now, 6 - i);
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

      case 'month':
        // Show daily data for the month (last 30 days)
        return Array.from({ length: 30 }, (_, i) => {
          const date = subDays(now, 29 - i);
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

      case 'year':
        // Show monthly data for the year
        return Array.from({ length: 12 }, (_, i) => {
          const date = subMonths(now, 11 - i);
          const startOfMonthDate = startOfMonth(date);
          const endOfMonthDate = endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
          
          const comandasDoMes = data?.filter(comanda => {
            const comandaDate = parseISO(comanda.created_at);
            return (
              comandaDate >= startOfMonthDate && comandaDate <= endOfMonthDate
            );
          }) || [];
          
          return {
            name: format(date, 'MMM/yy'),
            Pedidos: comandasDoMes.length,
            Valor: comandasDoMes.reduce((sum, comanda) => sum + (comanda.total || 0), 0),
          };
        });

      case 'all':
        // Show monthly data for all time
        if (!data || data.length === 0) return [];
        
        const oldestOrder = data.reduce((oldest, current) => {
          const currentDate = parseISO(current.created_at);
          const oldestDate = parseISO(oldest.created_at);
          return currentDate < oldestDate ? current : oldest;
        });
        
        const actualStartDate = startOfMonth(parseISO(oldestOrder.created_at));
        const months = eachMonthOfInterval({ start: actualStartDate, end: now });
        
        return months.map(month => {
          const startOfMonthDate = startOfMonth(month);
          const endOfMonthDate = endOfDay(new Date(month.getFullYear(), month.getMonth() + 1, 0));
          
          const comandasDoMes = data?.filter(comanda => {
            const comandaDate = parseISO(comanda.created_at);
            return (
              comandaDate >= startOfMonthDate && comandaDate <= endOfMonthDate
            );
          }) || [];
          
          return {
            name: format(month, 'MMM/yy'),
            Pedidos: comandasDoMes.length,
            Valor: comandasDoMes.reduce((sum, comanda) => sum + (comanda.total || 0), 0),
          };
        });

      default:
        return [];
    }
  };

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setChartData([]);
          return;
        }

        const { startDate, endDate } = getDateRange(period);

        let query = supabase
          .from('comandas')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true });

        // For 'all' period, don't apply date filters to get all data
        if (period !== 'all') {
          query = query
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        const groupedData = groupDataByPeriod(data || [], period, startDate, endDate);
        setChartData(groupedData);
      } catch (error) {
        console.error('Erro ao carregar dados do gráfico:', error);
        toast.error('Erro ao carregar dados do gráfico');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [period]);

  return { chartData, loading };
};
