
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Layers, Clock, MapPin } from 'lucide-react';

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

interface WorkSession {
  motoboy_id: string;
  motoboy_nome: string;
  start_time: string;
  end_time: string | null;
  duration: string;
}

export default function DeliveryStats() {
  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 0,
    deliveriesByMotoboy: [],
    deliveriesByBairro: []
  });
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, [startDate, endDate]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Format dates for query
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T23:59:59`);
      
      // Get total deliveries and by neighborhood
      const { data: entregas, error: entregasError } = await supabase
        .from('entregas')
        .select('id, motoboy_id, bairro, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
        
      if (entregasError) throw entregasError;
      
      // Get motoboy names
      const { data: motoboys, error: motoboyError } = await supabase
        .from('motoboys')
        .select('id, nome');
        
      if (motoboyError) throw motoboyError;
      
      // Map motoboy IDs to names
      const motoboyMap = new Map();
      motoboys?.forEach(motoboy => {
        motoboyMap.set(motoboy.id, motoboy.nome);
      });
      
      // Count deliveries by motoboy
      const deliveriesByMotoboy = entregas?.reduce((acc: any, entrega) => {
        const motoboyId = entrega.motoboy_id;
        const exists = acc.find((item: any) => item.motoboy_id === motoboyId);
        
        if (exists) {
          exists.count += 1;
        } else {
          acc.push({
            motoboy_id: motoboyId,
            motoboy_nome: motoboyMap.get(motoboyId) || 'Desconhecido',
            count: 1
          });
        }
        
        return acc;
      }, []) || [];
      
      // Count deliveries by neighborhood
      const deliveriesByBairro = entregas?.reduce((acc: any, entrega) => {
        const bairro = entrega.bairro;
        const exists = acc.find((item: any) => item.bairro === bairro);
        
        if (exists) {
          exists.count += 1;
        } else {
          acc.push({
            bairro,
            count: 1
          });
        }
        
        return acc;
      }, []) || [];
      
      setStats({
        totalDeliveries: entregas?.length || 0,
        deliveriesByMotoboy,
        deliveriesByBairro
      });
      
      // Get motoboy work sessions
      await loadWorkSessions(start, end, motoboyMap);
      
    } catch (error: any) {
      console.error('Error loading delivery stats:', error);
      toast.error(`Erro ao carregar estatísticas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkSessions = async (start: Date, end: Date, motoboyMap: Map<string, string>) => {
    try {
      // This is a placeholder. In a real app, you'd have a table for motoboy work sessions
      // For now, we'll calculate based on first and last delivery of the day
      
      // For each motoboy that made deliveries in the period
      const sessions: WorkSession[] = [];
      
      for (const motoboyStats of stats.deliveriesByMotoboy) {
        const { data, error } = await supabase
          .from('entregas')
          .select('created_at')
          .eq('motoboy_id', motoboyStats.motoboy_id)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
          .order('created_at');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const firstDelivery = new Date(data[0].created_at);
          const lastDelivery = new Date(data[data.length - 1].created_at);
          
          // Calculate duration in hours
          const durationMs = lastDelivery.getTime() - firstDelivery.getTime();
          const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
          
          sessions.push({
            motoboy_id: motoboyStats.motoboy_id,
            motoboy_nome: motoboyMap.get(motoboyStats.motoboy_id) || 'Desconhecido',
            start_time: firstDelivery.toLocaleString(),
            end_time: lastDelivery.toLocaleString(),
            duration: `${durationHours} horas`
          });
        }
      }
      
      setWorkSessions(sessions);
      
    } catch (error: any) {
      console.error('Error loading work sessions:', error);
      toast.error(`Erro ao carregar períodos de trabalho: ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Estatísticas de Entregas</h2>
      
      {/* Date filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Data Inicial
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Data Final
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded-md"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={loadStats}
            disabled={loading}
            className={`bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Carregando...' : 'Filtrar'}
          </button>
        </div>
      </div>
      
      {/* Stats summary */}
      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <div className="text-2xl font-bold text-center">
          <Layers className="inline-block mr-2" />
          Total de Entregas: {stats.totalDeliveries}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deliveries by motoboy */}
        <div>
          <h3 className="font-bold text-lg mb-2 flex items-center">
            <Clock className="mr-2" />
            Entregas por Motoboy
          </h3>
          <div className="bg-gray-50 p-3 rounded-md">
            {stats.deliveriesByMotoboy.length > 0 ? (
              <ul>
                {stats.deliveriesByMotoboy.map((item, index) => (
                  <li key={index} className="mb-2 flex justify-between items-center">
                    <span>{item.motoboy_nome}</span>
                    <span className="font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                      {item.count} entregas
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">Nenhuma entrega encontrada</p>
            )}
          </div>
        </div>
        
        {/* Deliveries by neighborhood */}
        <div>
          <h3 className="font-bold text-lg mb-2 flex items-center">
            <MapPin className="mr-2" />
            Entregas por Bairro
          </h3>
          <div className="bg-gray-50 p-3 rounded-md">
            {stats.deliveriesByBairro.length > 0 ? (
              <ul>
                {stats.deliveriesByBairro.map((item, index) => (
                  <li key={index} className="mb-2 flex justify-between items-center">
                    <span>{item.bairro}</span>
                    <span className="font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                      {item.count} entregas
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">Nenhuma entrega encontrada</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Work periods */}
      <div className="mt-6">
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <Clock className="mr-2" />
          Períodos de Trabalho
        </h3>
        <div className="bg-gray-50 p-3 rounded-md">
          {workSessions.length > 0 ? (
            <ul>
              {workSessions.map((session, index) => (
                <li key={index} className="mb-3 p-2 border-b">
                  <div className="font-semibold">{session.motoboy_nome}</div>
                  <div className="text-sm">
                    <span className="text-gray-600">Início:</span> {session.start_time}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Fim:</span> {session.end_time || 'Em andamento'}
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    Duração: {session.duration}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">Nenhum período de trabalho encontrado</p>
          )}
        </div>
      </div>
    </div>
  );
}
