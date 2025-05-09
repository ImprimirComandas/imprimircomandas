
import { useEffect } from 'react';
import { useComandaForm } from '../hooks/useComandaForm';
import { useComandas } from '../hooks/useComandas';
import { useChartData } from '../hooks/useChartData';
import { useVisibilityPreference } from '../hooks/useVisibilityPreference';
import type { Profile } from '../types/database';
import DeliveryHeader from './delivery/DeliveryHeader';
import LeftColumn from './delivery/LeftColumn';
import RightColumn from './delivery/RightColumn';
import TrocoModalComponent from './TrocoModalComponent';
import PagamentoMistoModal from './PagamentoMistoModal';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import { useTheme } from '../hooks/useTheme';
import { PageContainer } from './layouts/PageContainer';

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
    closeTrocoModal, // This now expects no parameters
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal, // This now expects no parameters
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
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <DeliveryHeader />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Coluna Esquerda: Formulário de Comanda */}
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

          {/* Coluna Direita: Totais, Gráfico e Comandas Anteriores */}
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

        {/* Modais */}
        <TrocoModalComponent
          show={showTrocoModal}
          needsTroco={needsTroco}
          quantiapagaInput={quantiapagaInput}
          totalComTaxa={totalComTaxa}
          onClose={closeTrocoModal} // No parameter needed now
          onConfirm={handleTrocoConfirm}
          onChange={onChange}
        />
        <PagamentoMistoModal
          show={showPagamentoMistoModal}
          totalComTaxa={totalComTaxa}
          valorCartaoInput={valorCartaoInput}
          valorDinheiroInput={valorDinheiroInput}
          valorPixInput={valorPixInput}
          onClose={closePagamentoMistoModal} // No parameter needed now
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
