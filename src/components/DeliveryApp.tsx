
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
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
