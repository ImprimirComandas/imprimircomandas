
import { motion } from 'framer-motion';
import { useShopIsOpen } from '../../hooks/useShopIsOpen';
import { useTheme } from '../../hooks/useTheme';
import { getThemeClasses } from '../../lib/theme';

export default function DeliveryHeader() {
  const { isShopOpen } = useShopIsOpen();
  const { theme } = useTheme();
  
  const titleClasses = getThemeClasses(theme, {
    light: "text-gray-900",
    dark: "text-gray-100",
    lightBlue: "text-blue-900", 
    darkPurple: "text-purple-100"
  });
  
  const descriptionClasses = getThemeClasses(theme, {
    light: "text-gray-600",
    dark: "text-gray-400",
    lightBlue: "text-blue-700",
    darkPurple: "text-purple-300"
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
          <h1 className={`text-4xl font-extrabold ${titleClasses}`}>
            Gerenciamento de Delivery
          </h1>
          <p className={`mt-2 ${descriptionClasses}`}>
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
};
