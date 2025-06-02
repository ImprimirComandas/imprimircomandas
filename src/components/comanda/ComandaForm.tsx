
import React from 'react';
import { useShopIsOpen } from '../../hooks/useShopIsOpen';
import { motion } from 'framer-motion';
import { Save, ShoppingBag, Edit, Printer } from 'lucide-react';
import type { Comanda } from '../../types/database';
import { ProductSearch } from './ProductSearch';
import { ProductList } from './ProductList';
import { AddressForm } from './AddressForm';
import { PaymentSection } from './PaymentSection';
import { useComandaValidation } from '../../hooks/useComandaValidation';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '../ui/card';

interface ComandaFormProps {
  comanda: Comanda;
  pesquisaProduto: string;
  produtosFiltrados: { id: string; nome: string; valor: number; numero?: number }[];
  loading: boolean;
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
  mode?: 'create' | 'edit';
  onSaveAndReprint?: () => void;
  layout?: 'vertical' | 'horizontal';
}

const ComandaForm: React.FC<ComandaFormProps> = ({
  comanda,
  pesquisaProduto,
  produtosFiltrados,
  loading,
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
  mode = 'create',
  onSaveAndReprint,
  layout = 'vertical',
}) => {
  const { isShopOpen } = useShopIsOpen();
  const { validateComanda } = useComandaValidation();
  const { theme, isDark } = useTheme();

  const handleSaveComanda = () => {
    if (mode === 'edit' || validateComanda(comanda, isShopOpen)) {
      onSaveComanda();
    }
  };

  const handleSaveAndReprint = () => {
    if (onSaveAndReprint) {
      onSaveAndReprint();
    }
  };

  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';
  const isHorizontal = layout === 'horizontal';

  if (isHorizontal) {
    return (
      <Card className="p-5 border-border">
        <h3 className="font-semibold text-lg mb-4 flex items-center">
          {isEditMode ? (
            <Edit className="h-5 w-5 text-primary mr-2" />
          ) : (
            <ShoppingBag className="h-5 w-5 text-primary mr-2" />
          )}
          {isEditMode ? 'Editar Pedido' : 'Novo Pedido'}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Products */}
          <div className="space-y-5">
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
          </div>

          {/* Right Column - Address & Payment */}
          <div className="space-y-5">
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
          </div>
        </div>

        {isCreateMode && (
          <div className="flex justify-end mt-6">
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
        )}

        {isEditMode && (
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={handleSaveComanda}
              disabled={salvando}
              className={`bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded flex items-center gap-2 text-sm ${
                salvando ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save size={18} />
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            
            {onSaveAndReprint && (
              <button
                onClick={handleSaveAndReprint}
                disabled={salvando}
                className={`bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded flex items-center gap-2 text-sm ${
                  salvando ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Printer size={18} />
                {salvando ? 'Salvando...' : 'Salvar e Reimprimir'}
              </button>
            )}
          </div>
        )}
      </Card>
    );
  }

  // Vertical layout (original)
  return (
    <Card className="p-5 border-border">
      <h3 className="font-semibold text-lg mb-4 flex items-center">
        {isEditMode ? (
          <Edit className="h-5 w-5 text-primary mr-2" />
        ) : (
          <ShoppingBag className="h-5 w-5 text-primary mr-2" />
        )}
        {isEditMode ? 'Editar Pedido' : 'Novo Pedido'}
      </h3>
      
      <div className="space-y-5">
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

        {isCreateMode && (
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
        )}

        {isEditMode && (
          <div className="flex justify-end gap-2">
            <button
              onClick={handleSaveComanda}
              disabled={salvando}
              className={`bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded flex items-center gap-2 text-sm ${
                salvando ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save size={18} />
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            
            {onSaveAndReprint && (
              <button
                onClick={handleSaveAndReprint}
                disabled={salvando}
                className={`bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded flex items-center gap-2 text-sm ${
                  salvando ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Printer size={18} />
                {salvando ? 'Salvando...' : 'Salvar e Reimprimir'}
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ComandaForm;
