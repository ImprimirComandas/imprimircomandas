
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

  // Load previous orders when component mounts
  useEffect(() => {
    carregarComandas();
  }, []);

  // Helper function to format IDs
  const getUltimos8Digitos = (id: string | undefined): string => {
    if (!id) return 'N/A';
    return id.slice(-8);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Fixed Comanda Form */}
          <div className="md:w-1/2 md:sticky md:top-6 md:self-start">
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

          {/* Right Column: Scrollable Content */}
          <div className="md:w-1/2 space-y-4">
            <CadastroProdutoForm
              onSaveProduto={salvarProduto}
              onEditProduto={editarProduto}
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
            />
            <TotaisPorStatusPagamento
              confirmados={totais.confirmados || 0}
              naoConfirmados={totais.naoConfirmados || 0}
              total={totais.geral || 0}
            />
            <TotaisPorFormaPagamento totais={totais} />
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
        </div>

        {/* Modals */}
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
      </main>
    </div>
  );
}
