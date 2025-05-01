
import { FC, useEffect } from 'react';
import { useShopIsOpen } from '../../hooks/useShopIsOpen';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { cn } from '../../lib/utils';
import { useTheme } from '../../hooks/useTheme';
import { getThemeClasses } from '../../lib/theme';

export interface ShopStatusButtonProps {
  className?: string;
}

const ShopStatusButton: FC<ShopStatusButtonProps> = ({ className }) => {
  const { isShopOpen, setIsShopOpen, isLoading, currentSessionId } = useShopIsOpen();
  const { theme } = useTheme();
  
  const handleStatusChange = (checked: boolean) => {
    console.log(`Attempting to set shop status to: ${checked ? 'open' : 'closed'}`);
    setIsShopOpen(checked);
  };
  
  return (
    <div className={cn("flex items-center gap-2", className, getThemeClasses(theme, {
      light: "text-gray-900",
      dark: "text-gray-100",
      lightBlue: "text-blue-900",
      darkPurple: "text-gray-100"
    }))}>
      <Badge 
        variant={isShopOpen ? "success" : "destructive"}
        className={`whitespace-nowrap ${isLoading ? 'opacity-50' : ''} ${getThemeClasses(theme, {
          light: "border-gray-200",
          dark: "border-gray-700",
          lightBlue: "border-blue-200",
          darkPurple: "border-purple-700"
        })}`}
      >
        {isShopOpen ? 'Loja Aberta' : 'Loja Fechada'}
      </Badge>
      
      <Switch 
        checked={isShopOpen} 
        onCheckedChange={handleStatusChange}
        disabled={isLoading}
        aria-label="Alternar status da loja"
        className={getThemeClasses(theme, {
          light: "",
          dark: "bg-gray-700",
          lightBlue: "",
          darkPurple: "bg-purple-800"
        })}
      />
    </div>
  );
};

export default ShopStatusButton;
