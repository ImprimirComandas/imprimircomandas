
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ExtendedMotoboySession, Motoboy } from '@/types';

export function useWorkSessions() {
  const [workSessions, setWorkSessions] = useState<ExtendedMotoboySession[]>([]);
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);

  const loadWorkSessions = async (
    start: Date,
    end: Date,
    motoboyStats: { motoboy_id: string; motoboy_nome: string; count: number }[]
  ) => {
    try {
      const sessions: ExtendedMotoboySession[] = [];
      for (const statsItem of motoboyStats) {
        const { data, error } = await supabase
          .from('entregas')
          .select('created_at')
          .eq('motoboy_id', statsItem.motoboy_id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
          .order('created_at');

        if (error) throw error;

        if (data && data.length > 0) {
          const firstDelivery = new Date(data[0].created_at);
          const lastDelivery = new Date(data[data.length - 1].created_at);
          const durationMs = lastDelivery.getTime() - firstDelivery.getTime();
          const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;

          sessions.push({
            id: `${statsItem.motoboy_id}-${firstDelivery.getTime()}`,
            motoboy_id: statsItem.motoboy_id,
            start_time: firstDelivery.toLocaleString(),
            end_time: lastDelivery.toLocaleString(),
            duration: `${durationHours} horas`,
            user_id: statsItem.motoboy_id
          });
        }
      }

      // Fetch updated motoboy list
      const { data: motoboyData, error: motoboyError } = await supabase
        .from('motoboys')
        .select('*');

      if (motoboyError) throw motoboyError;
      setMotoboys(motoboyData || []);
      setWorkSessions(sessions);

    } catch (error: unknown) {
      console.error('Erro ao carregar períodos de trabalho:', error);
      if (error instanceof Error) {
        toast.error(`Erro ao carregar períodos de trabalho: ${error.message}`);
      } else {
        toast.error('Erro ao carregar períodos de trabalho: Erro desconhecido');
      }
    }
  };

  return { workSessions, motoboys, loadWorkSessions };
}
