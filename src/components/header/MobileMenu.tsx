
import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Package, BarChart2, Settings, MapPin, Truck } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

export interface MobileMenuProps {
  pathname: string;
}

const MobileMenu: FC<MobileMenuProps> = ({ pathname }) => {
  const [open, setOpen] = useState(false);
  
  const links = [
    { to: "/delivery", icon: <Truck className="mr-2 h-5 w-5" />, label: "Delivery" },
    { to: "/products", icon: <Package className="mr-2 h-5 w-5" />, label: "Produtos" },
    { to: "/orders-by-day", icon: <BarChart2 className="mr-2 h-5 w-5" />, label: "Relatórios" },
    { to: "/delivery-rates", icon: <MapPin className="mr-2 h-5 w-5" />, label: "Taxas" },
    { to: "/store-settings", icon: <Settings className="mr-2 h-5 w-5" />, label: "Configurações" },
  ];
  
  const closeMenu = () => setOpen(false);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px] sm:w-[300px]">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <span className="font-semibold text-lg">Menu</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>
          
          <nav className="flex flex-col space-y-3 mb-auto">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-3 py-2 rounded-md ${
                  pathname === link.to 
                    ? 'bg-accent text-accent-foreground font-medium' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                onClick={closeMenu}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto pt-4 text-center text-xs text-muted-foreground">
            DeliveryApp © {new Date().getFullYear()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
