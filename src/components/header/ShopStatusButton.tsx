
import { FC } from 'react';
import { useShopIsOpen } from '../../hooks/useShopIsOpen';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { cn } from '../../lib/utils';

export interface ShopStatusButtonProps {
  isShopOpen?: boolean;
  setIsShopOpen?: (isOpen: boolean) => void;
  isLoading?: boolean;
  setIsLoading?: (isLoading: boolean) => void;
  className?: string;
}

const ShopStatusButton: FC<ShopStatusButtonProps> = ({ className }) => {
  const { isShopOpen, setIsShopOpen, isLoading, currentSessionId } = useShopIsOpen();
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant={isShopOpen ? "success" : "destructive"}
        className={`whitespace-nowrap ${isLoading ? 'opacity-50' : ''}`}
      >
        {isShopOpen ? 'Loja Aberta' : 'Loja Fechada'}
      </Badge>
      
      <Switch 
        checked={isShopOpen} 
        onCheckedChange={(checked) => {
          console.log(`Attempting to set shop status to: ${checked ? 'open' : 'closed'}`);
          setIsShopOpen(checked);
        }}
        disabled={isLoading}
        aria-label="Alternar status da loja"
      />
    </div>
  );
};

export default ShopStatusButton;
