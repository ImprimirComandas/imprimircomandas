
import { FC } from 'react';
import { useShopIsOpen } from '../../hooks/useShopIsOpen';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';

export interface ShopStatusButtonProps {
  isShopOpen?: boolean;
  setIsShopOpen?: (isOpen: boolean) => void;
  isLoading?: boolean;
  setIsLoading?: (isLoading: boolean) => void;
}

const ShopStatusButton: FC<ShopStatusButtonProps> = () => {
  const { isShopOpen, setIsShopOpen, isLoading } = useShopIsOpen();
  
  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isShopOpen ? "success" : "destructive"}
        className={`whitespace-nowrap ${isLoading ? 'opacity-50' : ''}`}
      >
        {isShopOpen ? 'Loja Aberta' : 'Loja Fechada'}
      </Badge>
      
      <Switch 
        checked={isShopOpen} 
        onCheckedChange={setIsShopOpen} 
        disabled={isLoading}
        aria-label="Alternar status da loja"
      />
    </div>
  );
};

export default ShopStatusButton;
