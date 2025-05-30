
import { FC } from 'react';
import ComandaForm from '../comanda/ComandaForm';
import type { Comanda } from '../../types/database';

interface LeftColumnProps {
  comanda: Comanda;
  pesquisaProduto: string;
  produtosFiltrados: { id: string; nome: string; valor: number; numero?: number }[];
  salvando: boolean;
  totalComTaxa: number;
  bairrosDisponiveis: string[];
  loading: boolean;
  onRemoveProduto: (index: number) => void;
  onUpdateQuantidade: (index: number, quantidade: number) => void;
  onSaveComanda: () => void;
  onChange: (field: string, value: string | number | boolean) => void;
  onBairroChange: (bairro: string) => void;
  onFormaPagamentoChange: (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => void;
  selecionarProdutoCadastrado: (produto: { id: string; nome: string; valor: number }) => void;
  startEditingProduct: (produto: { id: string; nome: string; valor: number }) => void;
}

const LeftColumn: FC<LeftColumnProps> = ({
  comanda,
  pesquisaProduto,
  produtosFiltrados,
  salvando,
  totalComTaxa,
  bairrosDisponiveis,
  loading,
  onRemoveProduto,
  onUpdateQuantidade,
  onSaveComanda,
  onChange,
  onBairroChange,
  onFormaPagamentoChange,
  selecionarProdutoCadastrado,
  startEditingProduct,
}) => {
  return (
    <ComandaForm
      comanda={comanda}
      pesquisaProduto={pesquisaProduto}
      produtosFiltrados={produtosFiltrados}
      loading={loading}
      salvando={salvando}
      totalComTaxa={totalComTaxa}
      bairrosDisponiveis={bairrosDisponiveis}
      onRemoveProduto={onRemoveProduto}
      onUpdateQuantidade={onUpdateQuantidade}
      onSaveComanda={onSaveComanda}
      onChange={onChange}
      onBairroChange={onBairroChange}
      onFormaPagamentoChange={onFormaPagamentoChange}
      selecionarProdutoCadastrado={selecionarProdutoCadastrado}
      startEditingProduct={startEditingProduct}
    />
  );
};

export default LeftColumn;
