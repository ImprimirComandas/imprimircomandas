import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import ComandasAnterioresModificado from './ComandasAnterioresModificado';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import TotaisPorStatusPagamento from './TotaisPorStatusPagamento';
import TotaisPorFormaPagamento from './TotaisPorFormaPagamento';
import TrocoModalComponent from './TrocoModalComponent';
import PagamentoMistoModal from './PagamentoMistoModal';
import ComandaForm from './ComandaForm';
import CadastroProdutoForm from './CadastroProdutoForm';
import { useComandaForm } from '../hooks/useComandaForm';
import { useComandas } from '../hooks/useComandas';
import type { Profile } from '../types/database';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO, startOfDay, endOfDay, subDays } from 'date-fns';

interface DeliveryAppProps {
  profile: Profile | null;
}

export default function DeliveryApp({ profile }: DeliveryAppProps) {
  const {
    comandasAnteriores,
    carregando,
    expandedComandas,
    salvando,
    setSalvando,
    reimprimirComanda,
    excluirComanda,
    toggleExpandComanda,
    carregarComandas,
    totais,
    confirmarPagamento,
    comandaSelecionada,
    setComandaSelecionada,
    showPaymentConfirmation,
    setShowPaymentConfirmation,
  } = useComandas();

  const {
    comanda,
    pesquisaProduto,
    produtosFiltrados,
    editingProduct,
    setEditingProduct,
    showTrocoModal,
    needsTroco,
    quantiapagaInput,
    totalComTaxa,
    showPagamentoMistoModal,
    valorCartaoInput,
    valorDinheiroInput,
    valorPixInput,
    onBairroChange,
    bairrosDisponiveis,
    salvarProduto,
    editarProduto,
    removerProduto,
    atualizarQuantidadeProduto,
    onFormaPagamentoChange,
    onChange,
    handleTrocoConfirm,
    closeTrocoModal,
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    salvarComanda,
    selecionarProdutoCadastrado,
    startEditingProduct,
  } = useComandaForm(carregarComandas, setSalvando);

  // Estado para o gráfico
  const [chartData, setChartData] = useState<{ name: string; Pedidos: number; Valor: number }[]>([]);
  // Estado para visibilidade dos valores
  const [showValues, setShowValues] = useState<boolean>(false);

  // Carregar comandas iniciais
  useEffect(() => {
    carregarComandas();
  }, []);

  // Carregar preferência de visibilidade do perfil
  useEffect(() => {
    const fetchShowValuesPreference = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('show_values')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setShowValues(data?.show_values || false);
      } catch (error) {
        console.error('Erro ao carregar preferência de visibilidade:', error);
        toast.error('Erro ao carregar preferência de visibilidade');
      }
    };

    fetchShowValuesPreference();
  }, []);

  // Carregar dados para o gráfico (últimos 7 dias)
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

  // Função para alternar visibilidade e salvar no perfil
  const toggleShowValues = async () => {
    const newShowValues = !showValues;
    setShowValues(newShowValues);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ show_values: newShowValues })
        .eq('id', session.user.id);

      if (error) throw error;
      toast.success(`Valores ${newShowValues ? 'exibidos' : 'ocultos'} com sucesso`);
    } catch (error) {
      console.error('Erro ao salvar preferência de visibilidade:', error);
      toast.error('Erro ao salvar preferência de visibilidade');
      setShowValues(!newShowValues); // Reverter se falhar
    }
  };

  // Helper function to format IDs
  const getUltimos8Digitos = (id: string | undefined): string => {
    if (!id) return 'N/A';
    return id.slice(-8);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold text-gray-900">
            Gerenciamento de Delivery
          </h1>
          <p className="mt-2 text-gray-600">
            Crie e acompanhe pedidos com facilidade
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Coluna Esquerda: Formulário de Comanda */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:w-1/2"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              <ComandaForm
                comanda={comanda}
                pesquisaProduto={pesquisaProduto}
                produtosFiltrados={produtosFiltrados}
                salvando={salvando}
                totalComTaxa={totalComTaxa}
                bairrosDisponiveis={bairrosDisponiveis}
                onRemoveProduto={removerProduto}
                onUpdateQuantidade={atualizarQuantidadeProduto}
                onSaveComanda={salvarComanda}
                onChange={onChange}
                onBairroChange={onBairroChange}
                onFormaPagamentoChange={onFormaPagamentoChange}
                selecionarProdutoCadastrado={selecionarProdutoCadastrado}
                startEditingProduct={startEditingProduct}
              />
            </div>
          </motion.div>

          {/* Coluna Direita: Totais, Gráfico e Comandas Anteriores */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:w-1/2 space-y-6"
          >
            {/* Totais por Status */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <TotaisPorStatusPagamento
                confirmados={totais.confirmados || 0}
                naoConfirmados={totais.naoConfirmados || 0}
                total={totais.geral || 0}
                showValues={showValues}
                toggleShowValues={toggleShowValues}
              />
            </div>

            {/* Comandas Anteriores */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <ComandasAnterioresModificado
                comandas={comandasAnteriores}
                expandedComandas={expandedComandas}
                carregando={carregando}
                onReimprimir={reimprimirComanda}
                onExcluir={excluirComanda}
                onToggleExpand={toggleExpandComanda}
                getUltimos8Digitos={getUltimos8Digitos}
                onConfirmPayment={(comanda) => {
                  setComandaSelecionada(comanda);
                  setShowPaymentConfirmation(true);
                }}
              />
            </div>

            {/* Gráfico de Crescimento */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Crescimento dos Pedidos (Últimos 7 Dias)
              </h2>
              {chartData.length > 0 && chartData.some(d => d.Pedidos > 0 || d.Valor > 0) ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#374151" />
                      <YAxis
                        yAxisId="left"
                        stroke="#34D399"
                        label={{ value: 'Pedidos', angle: -90, position: 'insideLeft', offset: -10 }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#3B82F6"
                        label={{ value: 'Valor (R$)', angle: 90, position: 'insideRight', offset: -10 }}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) =>
                          name === 'Pedidos' ? `${value} pedidos` : `R$ ${value.toFixed(2)}`
                        }
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="Pedidos"
                        stroke="#34D399"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="Valor"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-600 text-center">Nenhum dado disponível para o gráfico.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Modais */}
        <TrocoModalComponent
          show={showTrocoModal}
          needsTroco={needsTroco}
          quantiapagaInput={quantiapagaInput}
          totalComTaxa={totalComTaxa}
          onClose={closeTrocoModal}
          onConfirm={handleTrocoConfirm}
          onChange={onChange}
        />
        <PagamentoMistoModal
          show={showPagamentoMistoModal}
          totalComTaxa={totalComTaxa}
          valorCartaoInput={valorCartaoInput}
          valorDinheiroInput={valorDinheiroInput}
          valorPixInput={valorPixInput}
          onClose={closePagamentoMistoModal}
          onConfirm={handlePagamentoMistoConfirm}
          onChange={onChange}
        />
        <PaymentConfirmationModal
          show={showPaymentConfirmation}
          comanda={comandaSelecionada}
          onClose={() => setShowPaymentConfirmation(false)}
          onConfirm={confirmarPagamento}
        />
      </div>
    </div>
  );
}