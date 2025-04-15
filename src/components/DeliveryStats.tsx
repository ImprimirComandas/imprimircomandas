import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Layers, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

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
    deliveriesByBairro: [],
  });
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<{ name: string; Entregas: number }[]>([]);

  useEffect(() => {
    loadStats();
  }, [startDate, endDate]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const start = new Date(`${startDate}T00:00:00`);
      const end = new Date(`${endDate}T23:59:59`);

      // Carregar entregas
      const { data: entregas, error: entregasError } = await supabase
        .from('entregas')
        .select('id, motoboy_id, bairro, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (entregasError) throw entregasError;

      // Carregar nomes dos motoboys
      const { data: motoboys, error: motoboyError } = await supabase
        .from('motoboys')
        .select('id, nome');

      if (motoboyError) throw motoboyError;

      const motoboyMap = new Map(motoboys?.map(motoboy => [motoboy.id, motoboy.nome]) || []);

      // Contar entregas por motoboy
      const deliveriesByMotoboy = entregas?.reduce((acc: { motoboy_id: string; motoboy_nome: string; count: number }[], entrega: { motoboy_id: string }) => {
        const motoboyId = entrega.motoboy_id;
        const exists = acc.find((item: { motoboy_id: string; motoboy_nome: string; count: number }) => item.motoboy_id === motoboyId);

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

      // Contar entregas por bairro
      const deliveriesByBairro = entregas?.reduce((acc: { bairro: string; count: number }[], entrega: { bairro: string }) => {
        const bairro = entrega.bairro;
        const exists = acc.find((item: { bairro: string; count: number }) => item.bairro === bairro);

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

      // Carregar dados para o gráfico
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

      // Carregar períodos de trabalho
      await loadWorkSessions(start, end, motoboyMap);
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

  const loadWorkSessions = async (start: Date, end: Date, motoboyMap: Map<string, string>) => {
    try {
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
          const durationMs = lastDelivery.getTime() - firstDelivery.getTime();
          const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;

          sessions.push({
            motoboy_id: motoboyStats.motoboy_id,
            motoboy_nome: motoboyMap.get(motoboyStats.motoboy_id) || 'Desconhecido',
            start_time: firstDelivery.toLocaleString(),
            end_time: lastDelivery.toLocaleString(),
            duration: `${durationHours} horas`,
          });
        }
      }
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

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Estatísticas de Entregas
        </h2>

        {/* Filtros de Data */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Data Inicial
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Data Final
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadStats}
              disabled={loading}
              className={`flex items-center px-4 py-2 rounded-lg text-white transition-colors duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Carregando...
                </>
              ) : (
                'Filtrar'
              )}
            </button>
          </div>
        </div>

        {/* Gráfico de Entregas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Crescimento das Entregas
          </h3>
          {chartData.length > 0 && chartData.some(d => d.Entregas > 0) ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#374151" />
                  <YAxis stroke="#374151" label={{ value: 'Entregas', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value: number) => `${value} entregas`}
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Entregas"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-600 text-center">Nenhum dado disponível para o período selecionado.</p>
          )}
        </motion.div>

        {/* Resumo de Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8 bg-gray-50 p-6 rounded-lg"
        >
          <div className="flex items-center justify-center text-2xl font-bold text-gray-800">
            <Layers className="h-6 w-6 mr-2 text-blue-600" />
            Total de Entregas: {stats.totalDeliveries}
          </div>
        </motion.div>

        {/* Entregas por Motoboy e Bairro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Entregas por Motoboy
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {stats.deliveriesByMotoboy.length > 0 ? (
                <ul className="space-y-2">
                  <AnimatePresence>
                    {stats.deliveriesByMotoboy.map((item, index) => (
                      <motion.li
                        key={item.motoboy_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm"
                      >
                        <span className="text-gray-700">{item.motoboy_nome}</span>
                        <span className="font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {item.count} entregas
                        </span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              ) : (
                <p className="text-gray-600 text-center">Nenhuma entrega encontrada</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Entregas por Bairro
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {stats.deliveriesByBairro.length > 0 ? (
                <ul className="space-y-2">
                  <AnimatePresence>
                    {stats.deliveriesByBairro.map((item, index) => (
                      <motion.li
                        key={item.bairro}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="p-2 bg-white rounded-lg shadow-sm"
                      >
                        <li>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">{item.bairro}</span>
                            <span className="font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {item.count} entregas
                            </span>
                          </div>
                        </li>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              ) : (
                <p className="text-gray-600 text-center">Nenhuma entrega encontrada</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Períodos de Trabalho */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Períodos de Trabalho
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {workSessions.length > 0 ? (
              <ul className="space-y-4">
                <AnimatePresence>
                  {workSessions.map((session, index) => (
                    <motion.li
                      key={`${session.motoboy_id}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 bg-white rounded-lg shadow-sm"
                    >
                      <div className="font-semibold text-gray-800">{session.motoboy_nome}</div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Início:</span> {session.start_time}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Fim:</span>{' '}
                        {session.end_time || 'Em andamento'}
                      </div>
                      <div className="text-sm font-medium text-blue-600">
                        Duração: {session.duration}
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <p className="text-gray-600 text-center">Nenhum período de trabalho encontrado</p>
            )}
          </div>
        </motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-600"></div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}