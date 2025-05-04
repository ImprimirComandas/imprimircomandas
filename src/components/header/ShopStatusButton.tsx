
import { FC, useEffect } from 'react';
import { useShopIsOpen } from '../../hooks/useShopIsOpen';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { cn } from '../../lib/utils';

export interface ShopStatusButtonProps {
  className?: string;
}

const ShopStatusButton: FC<ShopStatusButtonProps> = ({ className }) => {
  const { isShopOpen, setIsShopOpen, isLoading, currentSessionId } = useShopIsOpen();
  
  const handleStatusChange = (checked: boolean) => {
    console.log(`Attempting to set shop status to: ${checked ? 'open' : 'closed'}`);
    setIsShopOpen(checked);
  };
  
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
        onCheckedChange={handleStatusChange}
        disabled={isLoading}
        aria-label="Alternar status da loja"
      />
    </div>
  );
};

export default ShopStatusButton;
