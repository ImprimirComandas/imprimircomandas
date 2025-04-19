import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { format, parseISO, startOfDay, endOfDay, subDays, addDays } from 'date-fns';
import { Search, X, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { Comanda } from '../types/database';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

// Componente para cada comanda
const OrderCard = ({
  comanda,
  onTogglePayment,
  onReprint,
  onDelete,
}: {
  comanda: Comanda;
  onTogglePayment: (comanda: Comanda) => void;
  onReprint: (comanda: Comanda) => void;
  onDelete: (id: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Função para garantir que produtos seja um array válido
  const getProdutos = () => {
    try {
      if (Array.isArray(comanda.produtos)) {
        return comanda.produtos;
      }
      if (typeof comanda.produtos === 'string') {
        return JSON.parse(comanda.produtos);
      }
      return [];
    } catch (error) {
      console.error('Erro ao processar produtos:', error);
      return [];
    }
  };

  const produtos = getProdutos();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-5 mb-4 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Pedido #{comanda.id.slice(-6)}</h3>
          <p className="text-sm text-gray-500">
            {comanda.created_at ? format(parseISO(comanda.created_at), 'HH:mm') : 'Data indisponível'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              comanda.pago ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
            }`}
          >
            {comanda.pago ? 'Pago' : 'Pendente'}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {isExpanded ? 'Ocultar' : 'Ver Detalhes'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <div className="border-t pt-4">
              {produtos.length > 0 ? (
                produtos.map((produto: { nome: string; quantidade: number; preco: number }, index: number) => (
                  <div key={index} className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>
                      {(produto.nome || 'Produto desconhecido')} (x{(produto.quantidade || 1)})
                    </span>
                    <span>R$ {((produto.preco || 0) * (produto.quantidade || 1)).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum produto registrado</p>
              )}
              <div className="mt-3 font-bold text-gray-800 text-lg">
                Total: R$ {(comanda.total || 0).toFixed(2)}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Pagamento: {comanda.forma_pagamento || 'Não especificado'}
              </div>
            </div>
            <div className="mt-5 flex gap-3 flex-wrap">
              <button
                onClick={() => onTogglePayment(comanda)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  comanda.pago ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                } text-white transition-colors duration-200`}
              >
                {comanda.pago ? <XCircle size={18} /> : <CheckCircle size={18} />}
                {comanda.pago ? 'Desmarcar' : 'Confirmar'}
              </button>
              <button
                onClick={() => onReprint(comanda)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              >
                Reimprimir
              </button>
              <button
                onClick={() => onDelete(comanda.id)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function OrdersByDay() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');

  // Buscar comandas para o dia selecionado
  const fetchOrdersByDate = useCallback(async (date: Date) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Usuário não autenticado');
        return;
      }

      const startDate = startOfDay(date).toISOString();
      const endDate = endOfDay(date).toISOString();

      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar pedidos');
        return;
      }

      const comandasFormatadas = data?.map(comanda => ({
        ...comanda,
        produtos: Array.isArray(comanda.produtos)
          ? comanda.produtos
          : typeof comanda.produtos === 'string'
          ? JSON.parse(comanda.produtos)
          : [],
      })) || [];

      setComandas(comandasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar comandas:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar comandas para o gráfico (últimos 7 dias)
  const fetchOrdersForChart = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log('Usuário não autenticado para fetchOrdersForChart');
        return [];
      }

      const endDate = endOfDay(selectedDate).toISOString();
      const startDate = startOfDay(subDays(selectedDate, 6)).toISOString(); // Últimos 7 dias

      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) {
        console.error('Erro ao carregar dados do gráfico:', error);
        return [];
      }

      const formattedData = data?.map(comanda => ({
        ...comanda,
        produtos: Array.isArray(comanda.produtos)
          ? comanda.produtos
          : typeof comanda.produtos === 'string'
          ? JSON.parse(comanda.produtos)
          : [],
      })) || [];
      console.log('Dados brutos do fetchOrdersForChart:', formattedData);
      return formattedData;
    } catch (error) {
      console.error('Erro ao carregar comandas para o gráfico:', error);
      return [];
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchOrdersByDate(selectedDate);
  }, [selectedDate, fetchOrdersByDate]);

  // Manipulação de data
  const changeDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => (direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1)));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
    }
  };

  // Ações
  const togglePayment = async (comanda: Comanda) => {
    try {
      const { error } = await supabase
        .from('comandas')
        .update({ pago: !comanda.pago })
        .eq('id', comanda.id);

      if (error) {
        toast.error('Erro ao atualizar pagamento');
        return;
      }

      fetchOrdersByDate(selectedDate);
      toast.success(`Pagamento ${!comanda.pago ? 'confirmado' : 'desmarcado'}!`);
    } catch (error) {
      toast.error('Erro ao atualizar pagamento');
    }
  };

  const reprintOrder = async (comanda: Comanda) => {
    try {
      const { imprimirComanda } = await import('../utils/printService');
      imprimirComanda(comanda);
      toast.success('Comanda enviada para impressão');
    } catch (error) {
      toast.error('Erro ao reimprimir comanda');
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Erro ao excluir pedido');
        return;
      }

      fetchOrdersByDate(selectedDate);
      toast.success('Pedido excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir pedido');
    }
  };

  // Filtragem
  const filteredComandas = useMemo(() => {
    return comandas.filter(comanda => {
      const matchesSearch = searchTerm
        ? comanda.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (comanda.produtos || []).some((p: { nome: string }) =>
            (p.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
        : true;

      const matchesStatus =
        filterStatus === 'all' ? true : filterStatus === 'paid' ? comanda.pago : !comanda.pago;

      return matchesSearch && matchesStatus;
    });
  }, [comandas, searchTerm, filterStatus]);

  // Totais
  const totais = useMemo(() => {
    const result = {
      pix: 0,
      dinheiro: 0,
      cartao: 0,
      geral: 0,
      confirmados: 0,
      naoConfirmados: 0,
    };
    filteredComandas.forEach(comanda => {
      const total = comanda.total || 0;
      if (comanda.pago) result.confirmados += total;
      else result.naoConfirmados += total;
      result.geral += total;
      if (comanda.forma_pagamento === 'pix') result.pix += total;
      else if (comanda.forma_pagamento === 'dinheiro') result.dinheiro += total;
      else if (comanda.forma_pagamento === 'cartao') result.cartao += total;
    });
    return result;
  }, [filteredComandas]);

  // Dados para o gráfico de linha
  const [chartData, setChartData] = useState<{ name: string; Pedidos: number; Valor: number; date: string }[]>([]);

  useEffect(() => {
    const loadChartData = async () => {
      const orders = await fetchOrdersForChart();
      console.log('Pedidos retornados para o gráfico:', orders);
      const data = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(selectedDate, 6 - i); // De 6 dias atrás até hoje
        const ordersForDay = orders.filter(order => {
          const orderDate = parseISO(order.created_at);
          return (
            orderDate >= startOfDay(date) && orderDate <= endOfDay(date)
          );
        });
        const entry = {
          name: format(date, 'dd/MM'),
          Pedidos: ordersForDay.length,
          Valor: ordersForDay.reduce((sum, order) => sum + (order.total || 0), 0),
          date: date.toISOString(), // Para clique
        };
        console.log(`Dados para ${entry.name}:`, entry);
        return entry;
      });
      console.log('chartData final:', data);
      setChartData(data);
    };
    loadChartData();
  }, [selectedDate, fetchOrdersForChart]);

  // Função para mudar a data ao clicar no gráfico
  const handlePointClick = (data: { activePayload?: { payload: { date: string } }[] }) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedDate = new Date(data.activePayload[0].payload.date);
      setSelectedDate(clickedDate);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 text-center sm:text-left">
            Controle de Pedidos
          </h1>
          <p className="mt-2 text-gray-600 text-center sm:text-left">
            Gerencie seus pedidos diários de forma simples e eficiente
          </p>
        </motion.div>

        {/* Filtros e Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Navegação de Data */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => changeDate('prev')}
                className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                aria-label="Dia anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                placeholder="Select a date"
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={() => changeDate('next')}
                className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                aria-label="Próximo dia"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Busca */}
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar pedido ou produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-10 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filtros de Status */}
          <div className="mt-4 flex gap-2 justify-center sm:justify-start">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors duration-200`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'paid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors duration-200`}
            >
              Pagos
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterStatus === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors duration-200`}
            >
              Pendentes
            </button>
          </div>
        </motion.div>

        {/* Gráfico de Linha */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Crescimento dos Pedidos (Últimos 7 Dias)
          </h2>
          {chartData.length > 0 && chartData.some(d => d.Pedidos > 0 || d.Valor > 0) ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                  onClick={handlePointClick}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#000000"
                    tick={{ fontSize: 12, fill: '#000000' }}
                    tickLine={false}
                    axisLine={{ stroke: '#000000' }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#000000"
                    tick={{ fontSize: 12, fill: '#000000' }}
                    tickLine={false}
                    axisLine={{ stroke: '#000000' }}
                    label={{
                      value: 'Pedidos',
                      angle: -90,
                      position: 'insideLeft',
                      offset: -5,
                      fill: '#000000',
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#000000"
                    tick={{ fontSize: 12, fill: '#000000' }}
                    tickLine={false}
                    axisLine={{ stroke: '#000000' }}
                    label={{
                      value: 'Vendas (R$)',
                      angle: 90,
                      position: 'insideRight',
                      offset: -5,
                      fill: '#000000',
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === 'Pedidos' ? `${value} pedidos` : `R$ ${value.toFixed(2)}`
                    }
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '6px',
                      border: '1px solid #000000',
                      padding: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#000000', fontSize: '12px' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', color: '#000000' }}
                    verticalAlign="bottom"
                    height={24}
                  />
                  {/* Linhas verticais tracejadas para Pedidos */}
                  {chartData.map((entry, index) => (
                    <ReferenceLine
                      key={`pedidos-${index}`}
                      x={entry.name}
                      stroke="#1E90FF"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      yAxisId="left"
                      y={0}
                      ifOverflow="extendDomain"
                    />
                  ))}
                  {/* Linhas verticais tracejadas para Valor */}
                  {chartData.map((entry, index) => (
                    <ReferenceLine
                      key={`valor-${index}`}
                      x={entry.name}
                      stroke="#000000"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      yAxisId="right"
                      y={0}
                      ifOverflow="extendDomain"
                    />
                  ))}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="Pedidos"
                    stroke="#1E90FF"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#1E90FF', stroke: '#1E90FF' }}
                    activeDot={{ r: 6, fill: '#1E90FF', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="Valor"
                    stroke="#000000"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#000000', stroke: '#000000' }}
                    activeDot={{ r: 6, fill: '#000000', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-600 text-center">Nenhum dado disponível para o gráfico.</p>
          )}
        </motion.div>

        {/* Totais em Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-sm font-medium">Pagos</p>
            <p className="text-2xl font-bold">R$ {totais.confirmados.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-sm font-medium">Pendentes</p>
            <p className="text-2xl font-bold">R$ {totais.naoConfirmados.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-sm font-medium">Total</p>
            <p className="text-2xl font-bold">R$ {totais.geral.toFixed(2)}</p>
          </div>
        </motion.div>

        {/* Lista de Comandas */}
        <motion.div layout>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-600"></div>
            </div>
          ) : filteredComandas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >
              <p className="text-gray-600 text-lg font-medium">
                Nenhum pedido encontrado para esta data.
              </p>
            </motion.div>
          ) : (
            filteredComandas.map(comanda => (
              <OrderCard
                key={comanda.id}
                comanda={comanda}
                onTogglePayment={togglePayment}
                onReprint={reprintOrder}
                onDelete={deleteOrder}
              />
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}