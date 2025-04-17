
import { motion } from 'framer-motion';
import ComandaForm from '../ComandaForm';
import type { Comanda } from '../../types/database';

interface LeftColumnProps {
  comanda: Comanda;
  pesquisaProduto: string;
  produtosFiltrados: { id: string; nome: string; valor: number; numero?: number }[];
  salvando: boolean;
  totalComTaxa: number;
  bairrosDisponiveis: string[];
  onRemoveProduto: (index: number) => void;
  onUpdateQuantidade: (index: number, quantidade: number) => void;
  onSaveComanda: () => void;
  onChange: (field: string, value: any) => void;
  onBairroChange: (bairro: string) => void;
  onFormaPagamentoChange: (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => void;
  selecionarProdutoCadastrado: (produto: { id: string; nome: string; valor: number }) => void;
  startEditingProduct: (produto: { id: string; nome: string; valor: number }) => void;
}

export default function LeftColumn({
  comanda,
  pesquisaProduto,
  produtosFiltrados,
  salvando,
  totalComTaxa,
  bairrosDisponiveis,
  onRemoveProduto,
  onUpdateQuantidade,
  onSaveComanda,
  onChange,
  onBairroChange,
  onFormaPagamentoChange,
  selecionarProdutoCadastrado,
  startEditingProduct,
}: LeftColumnProps) {
  return (
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
          onRemoveProduto={onRemoveProduto}
          onUpdateQuantidade={onUpdateQuantidade}
          onSaveComanda={onSaveComanda}
          onChange={onChange}
          onBairroChange={onBairroChange}
          onFormaPagamentoChange={onFormaPagamentoChange}
          selecionarProdutoCadastrado={selecionarProdutoCadastrado}
          startEditingProduct={startEditingProduct}
        />
      </div>
    </motion.div>
  );
}
