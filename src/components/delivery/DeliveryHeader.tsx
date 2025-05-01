
import { motion } from 'framer-motion';
import { useShopIsOpen } from '../../hooks/useShopIsOpen';
import { useEffect, useState } from 'react';

export default function DeliveryHeader() {
  const { isShopOpen } = useShopIsOpen();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formattedTime = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const formattedDate = currentTime.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
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
        
        <div className="mt-4 sm:mt-0 flex flex-col items-end">
          <div className={`px-4 py-2 rounded-lg font-medium text-white mb-2 ${
            isShopOpen ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {isShopOpen ? 'Loja Aberta' : 'Loja Fechada'}
          </div>
          
          <div className="text-gray-600 text-sm">
            <span className="font-semibold">{formattedTime}</span> • {formattedDate}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
