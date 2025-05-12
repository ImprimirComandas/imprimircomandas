
import { useEffect } from 'react';
import { useComandaForm } from '../hooks/useComandaForm';
import { useComandas } from '../hooks/useComandas';
import { useChartData } from '../hooks/useChartData';
import { useVisibilityPreference } from '../hooks/useVisibilityPreference';
import type { Profile } from '../types/database';
import LeftColumn from './delivery/LeftColumn';
import RightColumn from './delivery/RightColumn';
import TrocoModalComponent from './TrocoModalComponent';
import PagamentoMistoModal from './PagamentoMistoModal';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import { useTheme } from '../hooks/useTheme';
import { PageContainer } from './layouts/PageContainer';
import { PageTitle } from './ui/page-title';

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
    loading,
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
    bairrosDisponiveis,
    onBairroChange,
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
  const chartData = useChartData();
  
  // Estado para visibilidade dos valores
  const { showValues, toggleShowValues } = useVisibilityPreference();
  
  // Tema
  const { theme, isDark } = useTheme();

  // Carregar comandas iniciais
  useEffect(() => {
    carregarComandas();
  }, []);

  // Helper function to format IDs
  const getUltimos8Digitos = (id: string | undefined): string => {
    if (!id) return 'N/A';
    return id.slice(-8);
  };

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto w-full px-4">
        <PageTitle 
          title="Sistema de Delivery" 
          description="Gerencie pedidos, entregas e pagamentos" 
          className="mt-6"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Formulário de Comanda - Changed to 6 columns */}
          <div className="lg:col-span-6">
            <LeftColumn 
              comanda={comanda}
              pesquisaProduto={pesquisaProduto}
              produtosFiltrados={produtosFiltrados}
              salvando={salvando}
              totalComTaxa={totalComTaxa}
              bairrosDisponiveis={bairrosDisponiveis}
              loading={loading}
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

          {/* Coluna Direita: Totais e Comandas Pendentes - Changed to 6 columns */}
          <div className="lg:col-span-6">
            <RightColumn 
              totais={totais}
              showValues={showValues}
              toggleShowValues={toggleShowValues}
              comandasAnteriores={comandasAnteriores}
              expandedComandas={expandedComandas}
              carregando={carregando}
              reimprimirComanda={reimprimirComanda}
              excluirComanda={excluirComanda}
              toggleExpandComanda={toggleExpandComanda}
              getUltimos8Digitos={getUltimos8Digitos}
              onConfirmPayment={(comanda) => {
                setComandaSelecionada(comanda);
                setShowPaymentConfirmation(true);
              }}
              chartData={chartData}
            />
          </div>
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
    </PageContainer>
  );
}
