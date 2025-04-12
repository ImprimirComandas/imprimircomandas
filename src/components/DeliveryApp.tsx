
import { useComandas } from '../hooks/useComandas';
import { useComandaForm } from '../hooks/useComandaForm';
import { useAuth } from '../hooks/useAuth';
import { useProfileMenu } from '../hooks/useProfileMenu';
import type { Profile } from '../types/database';
import Header from './Header';
import ComandaForm from './ComandaForm';
import TrocoModal from './TrocoModal';
import PagamentoMistoModal from './PagamentoMistoModal';
import TotaisPorFormaPagamento from './TotaisPorFormaPagamento';
import ComandasAnterioresModificado from './ComandasAnterioresModificado';
import { getUltimos8Digitos } from '../utils/printService';
import PaymentConfirmationModal from './PaymentConfirmationModal';

interface DeliveryAppProps {
  profile: Profile | null;
}

export default function DeliveryApp({ profile }: DeliveryAppProps) {
  const { showProfileMenu, setShowProfileMenu, handleSignOut } = useProfileMenu();
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
    setShowPaymentConfirmation
  } = useComandas();
  
  const { 
    comanda, 
    nomeProduto, 
    valorProduto, 
    quantidadeProduto, 
    pesquisaProduto,
    produtosFiltrados,
    showTrocoModal, 
    needsTroco, 
    quantiapagaInput, 
    totalComTaxa,
    showPagamentoMistoModal,
    valorCartaoInput,
    valorDinheiroInput,
    valorPixInput,
    handleBairroChange, 
    adicionarProduto, 
    removerProduto, 
    handleFormaPagamentoChange, 
    handleChange, 
    handleTrocoConfirm, 
    closeTrocoModal, 
    handlePagamentoMistoConfirm,
    closePagamentoMistoModal,
    salvarComanda,
    selecionarProdutoCadastrado
  } = useComandaForm(carregarComandas, setSalvando);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        profile={profile} 
        onSignOut={handleSignOut} 
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Formulário de Comanda */}
          <ComandaForm
            comanda={comanda}
            nomeProduto={nomeProduto}
            valorProduto={valorProduto}
            quantidadeProduto={quantidadeProduto}
            pesquisaProduto={pesquisaProduto}
            produtosFiltrados={produtosFiltrados}
            salvando={salvando}
            totalComTaxa={totalComTaxa}
            onAddProduto={adicionarProduto}
            onRemoveProduto={removerProduto}
            onSaveComanda={salvarComanda}
            onChange={handleChange}
            onBairroChange={handleBairroChange}
            onFormaPagamentoChange={handleFormaPagamentoChange}
            selecionarProdutoCadastrado={selecionarProdutoCadastrado}
          />

          {/* Modal de Troco */}
          <TrocoModal
            show={showTrocoModal}
            needsTroco={needsTroco}
            quantiapagaInput={quantiapagaInput}
            totalComTaxa={totalComTaxa}
            onClose={closeTrocoModal}
            onConfirm={handleTrocoConfirm}
            onChange={handleChange}
          />

          {/* Modal de Pagamento Misto */}
          <PagamentoMistoModal
            show={showPagamentoMistoModal}
            totalComTaxa={totalComTaxa}
            valorCartaoInput={valorCartaoInput}
            valorDinheiroInput={valorDinheiroInput}
            valorPixInput={valorPixInput}
            onClose={closePagamentoMistoModal}
            onConfirm={handlePagamentoMistoConfirm}
            onChange={handleChange}
          />

          {/* Modal de Confirmação de Pagamento */}
          <PaymentConfirmationModal 
            show={showPaymentConfirmation}
            comanda={comandaSelecionada}
            onClose={() => setShowPaymentConfirmation(false)}
            onConfirm={confirmarPagamento}
          />

          {/* Totais por Forma de Pagamento */}
          <TotaisPorFormaPagamento totais={totais} />

          {/* Comandas Anteriores */}
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
      </main>
    </div>
  );
}
