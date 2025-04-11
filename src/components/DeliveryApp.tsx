
import { useComandas } from '../hooks/useComandas';
import { useComandaForm } from '../hooks/useComandaForm';
import { useAuth } from '../hooks/useAuth';
import { useProfileMenu } from '../hooks/useProfileMenu';
import type { Profile } from '../types/database';
import Header from './Header';
import ComandaForm from './ComandaForm';
import TrocoModal from './TrocoModal';
import TotaisPorFormaPagamento from './TotaisPorFormaPagamento';
import ComandasAnteriores from './ComandasAnteriores';
import { getUltimos8Digitos } from '../utils/printService';

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
    totais 
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
    handleBairroChange, 
    adicionarProduto, 
    removerProduto, 
    handleFormaPagamentoChange, 
    handleChange, 
    handleTrocoConfirm, 
    closeTrocoModal, 
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

          {/* Totais por Forma de Pagamento */}
          <TotaisPorFormaPagamento totais={totais} />

          {/* Comandas Anteriores */}
          <ComandasAnteriores
            comandas={comandasAnteriores}
            expandedComandas={expandedComandas}
            carregando={carregando}
            onReimprimir={reimprimirComanda}
            onExcluir={excluirComanda}
            onToggleExpand={toggleExpandComanda}
            getUltimos8Digitos={getUltimos8Digitos}
          />
        </div>
      </main>
    </div>
  );
}
