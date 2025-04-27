
import { motion } from 'framer-motion';
import { Comanda, Produto } from '@/types';

interface ExtendedProduto extends Produto {
  observacao?: string;
}

interface ExtendedComanda extends Comanda {
  observacoes?: string;
}

interface OrderExpandedViewProps {
  comanda: ExtendedComanda;
  isEditing: boolean;
}

export function OrderExpandedView({ comanda, isEditing }: OrderExpandedViewProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="mt-4 space-y-4"
    >
      <div className="border-t pt-4">
        <h4 className="text-md font-medium mb-2">Detalhes do Pedido</h4>
        <div className="space-y-2">
          {comanda.produtos?.map((produto, index) => {
            const extendedProduto = produto as ExtendedProduto;
            return (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">
                  {produto.quantidade}x {produto.nome}
                  {extendedProduto.observacao && (
                    <span className="text-gray-500 text-xs block ml-4">
                      Obs: {extendedProduto.observacao}
                    </span>
                  )}
                </span>
                <span className="text-sm font-medium">
                  R$ {(produto.valor * produto.quantidade).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {comanda.observacoes && (
        <div className="text-sm text-gray-600">
          <p className="font-medium">Observações:</p>
          <p>{comanda.observacoes}</p>
        </div>
      )}
      
      {comanda.endereco && (
        <div className="text-sm text-gray-600">
          <p className="font-medium">Endereço de Entrega:</p>
          <p>{comanda.endereco}</p>
        </div>
      )}
    </motion.div>
  );
}
