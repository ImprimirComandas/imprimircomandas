
import React from 'react';
import { useShopIsOpen } from '../hooks/useShopIsOpen';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import type { Comanda } from '../types/database';
import { ProductSearch } from './comanda/ProductSearch';
import { ProductList } from './comanda/ProductList';
import { AddressForm } from './comanda/AddressForm';
import { PaymentSection } from './comanda/PaymentSection';
import { toast } from 'sonner';
import { useComandaValidation } from '../hooks/useComandaValidation';
import { useTheme } from '@/hooks/useTheme';

interface ComandaFormProps {
  comanda: Comanda;
  pesquisaProduto: string;
  produtosFiltrados?: { id: string; nome: string; valor: number; numero?: number }[];
  loading?: boolean;
  salvando: boolean;
  totalComTaxa: number;
  bairrosDisponiveis: string[];
  onRemoveProduto: (index: number) => void;
  onUpdateQuantidade: (index: number, quantidade: number) => void;
  onSaveComanda: () => void;
  onChange: (field: string, value: string | number | boolean) => void;
  onBairroChange: (bairro: string) => void;
  onFormaPagamentoChange: (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => void;
  selecionarProdutoCadastrado: (produto: { id: string; nome: string; valor: number }) => void;
  startEditingProduct: (produto: { id: string; nome: string; valor: number }) => void;
}

const ComandaForm: React.FC<ComandaFormProps> = ({
  comanda,
  pesquisaProduto,
  produtosFiltrados = [],
  loading = false,
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
}) => {
  const { isShopOpen } = useShopIsOpen();
  const { validateComanda } = useComandaValidation();
  const { isDark } = useTheme();

  const handleSaveComanda = () => {
    if (validateComanda(comanda, isShopOpen)) {
      onSaveComanda();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-4 md:p-6"
    >
      <ProductSearch
        pesquisaProduto={pesquisaProduto}
        loading={loading}
        produtosFiltrados={produtosFiltrados}
        onChange={onChange}
        onSelectProduct={selecionarProdutoCadastrado}
      />

      <ProductList
        produtos={comanda.produtos}
        onRemoveProduto={onRemoveProduto}
        onUpdateQuantidade={onUpdateQuantidade}
      />

      <AddressForm
        endereco={comanda.endereco}
        bairro={comanda.bairro}
        bairrosDisponiveis={bairrosDisponiveis}
        taxaentrega={comanda.taxaentrega}
        onChange={onChange}
        onBairroChange={onBairroChange}
      />

      <PaymentSection
        subtotal={comanda.total}
        taxaentrega={comanda.taxaentrega}
        totalComTaxa={totalComTaxa}
        forma_pagamento={comanda.forma_pagamento}
        pago={comanda.pago}
        isShopOpen={isShopOpen}
        onFormaPagamentoChange={onFormaPagamentoChange}
        onChange={onChange}
      />

      <div className="flex justify-end">
        <button
          onClick={handleSaveComanda}
          disabled={salvando || !isShopOpen}
          className={`bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded flex items-center gap-2 text-sm ${
            salvando || !isShopOpen ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save size={18} />
          {salvando ? 'Salvando...' : 'Salvar e Imprimir'}
        </button>
      </div>
    </motion.div>
  );
};

export default ComandaForm;
