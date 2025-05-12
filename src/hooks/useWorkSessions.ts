import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatDuration, intervalToDuration } from 'date-fns';
import { ExtendedMotoboySession, Motoboy } from '@/types';

interface UseWorkSessionsReturn {
  workSessions: ExtendedMotoboySession[];
  motoboys: Motoboy[];
  loading: boolean;
  loadWorkSessions: (startDate: Date, endDate: Date, deliveriesByMotoboy: any[]) => Promise<void>;
}

export function useWorkSessions(): UseWorkSessionsReturn {
  const [workSessions, setWorkSessions] = useState<ExtendedMotoboySession[]>([]);
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWorkSessions = async (startDate: Date, endDate: Date, deliveriesByMotoboy: any[]) => {
    setLoading(true);
    try {
      // Fetch work sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('motoboy_sessions')
        .select('id, motoboy_id, start_time, end_time')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());

      if (sessionsError) throw sessionsError;

      // Fetch motoboys
      const { data: motoboysData, error: motoboysError } = await supabase
        .from('motoboys')
        .select('id, nome');

      if (motoboysError) throw motoboysError;

      setMotoboys(motoboysData || []);

      // Calculate duration and format sessions
      const formattedSessions = sessions?.map(session => {
        const startTime = new Date(session.start_time);
        const endTime = session.end_time ? new Date(session.end_time) : new Date();
        const durationObj = intervalToDuration({ start: startTime, end: endTime });
        const duration = formatDuration(durationObj);

        const motoboy = motoboysData?.find(m => m.id === session.motoboy_id);

        return {
          ...session,
          duration,
          motoboy_nome: motoboy?.nome,
        };
      }) || [];

      setWorkSessions(formattedSessions);
    } catch (error: unknown) {
      console.error('Erro ao carregar sessões de trabalho:', error);
      if (error instanceof Error) {
        toast.error(`Erro ao carregar sessões de trabalho: ${error.message}`);
      } else {
        toast.error('Erro ao carregar sessões de trabalho: Erro desconhecido');
      }
    } finally {
      setLoading(false);
    }
  };

  return { workSessions, motoboys, loading, loadWorkSessions };
}
