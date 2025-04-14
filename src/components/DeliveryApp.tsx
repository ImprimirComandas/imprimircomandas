
import { useEffect } from 'react';
import ComandasAnterioresModificado from './ComandasAnterioresModificado';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import TotaisPorStatusPagamento from './TotaisPorStatusPagamento';
import TrocoModal from './TrocoModal';
import PagamentoMistoModal from './PagamentoMistoModal';
import CadastroProdutoForm from './CadastroProdutoForm';
import ComandaFormComponent from './ComandaFormComponent';
import { useComandas } from '../hooks/useComandas';
import { useComandaForm } from '../hooks/useComandaForm';
import type { Profile } from '../types/database';

// DeliveryApp Component
interface DeliveryAppProps {
  profile: Profile | null;
}

const DeliveryApp = ({ profile }: DeliveryAppProps) => {
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

  useEffect(() => {
    carregarComandas();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <CadastroProdutoForm
            onSaveProduto={salvarProduto}
            onEditProduto={editarProduto}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
          />
          
          <ComandaFormComponent
            comanda={comanda}
            pesquisaProduto={pesquisaProduto}
            produtosFiltrados={produtosFiltrados}
            salvando={salvando}
            totalComTaxa={totalComTaxa}
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
        
        <div>
          <TotaisPorStatusPagamento 
            confirmados={Number(totais.confirmados)} 
            naoConfirmados={Number(totais.naoConfirmados)} 
            total={Number(totais.geral)} 
          />
          
          <ComandasAnterioresModificado
            comandas={comandasAnteriores}
            expandedComandas={expandedComandas}
            carregando={carregando}
            onToggleExpand={toggleExpandComanda}
            onReimprimir={reimprimirComanda}
            onExcluir={excluirComanda}
            getUltimos8Digitos={(id) => {
              if (!id) return '';
              return id.substring(Math.max(0, id.length - 8));
            }}
            onConfirmPayment={(comanda) => {
              setComandaSelecionada(comanda);
              setShowPaymentConfirmation(true);
            }}
          />
        </div>
      </div>

      {showTrocoModal && (
        <TrocoModal
          show={showTrocoModal}
          needsTroco={needsTroco}
          quantiapagaInput={quantiapagaInput}
          totalComTaxa={totalComTaxa}
          onClose={closeTrocoModal}
          onConfirm={handleTrocoConfirm}
          onChange={onChange}
        />
      )}

      {showPagamentoMistoModal && (
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
      )}

      {showPaymentConfirmation && comandaSelecionada && (
        <PaymentConfirmationModal
          show={showPaymentConfirmation}
          comanda={comandaSelecionada}
          onClose={() => setShowPaymentConfirmation(false)}
          onConfirm={confirmarPagamento}
        />
      )}
    </div>
  );
};

export default DeliveryApp;
