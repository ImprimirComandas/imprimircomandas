
import { motion } from 'framer-motion';
import { useShopIsOpen } from '../../hooks/useShopIsOpen';

export default function DeliveryHeader() {
  const { isShopOpen } = useShopIsOpen();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Gerenciamento de Delivery
          </h1>
          <p className="mt-2 text-gray-600">
            Crie pedidos, gerencie motoboys e acompanhe entregas
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <div className={`px-4 py-2 rounded-lg font-medium text-white ${
            isShopOpen ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {isShopOpen ? 'Loja Aberta' : 'Loja Fechada'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
