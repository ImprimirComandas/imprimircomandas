
import { Fragment, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Profile } from '../types/database';
import ShopStatusButton from './header/ShopStatusButton';
import ProfileMenu from './header/ProfileMenu';
import NavLink from './header/NavLink';
import MobileMenu from './header/MobileMenu';
import ThemeSelector from './ThemeSelector';

interface HeaderProps {
  profile: Profile | null;
  onSignOut: () => Promise<void>;
  showProfileMenu: boolean;
  setShowProfileMenu: (show: boolean) => void;
}

export default function Header({
  profile,
  onSignOut,
  showProfileMenu,
  setShowProfileMenu
}: HeaderProps) {
  const location = useLocation();
  
  useEffect(() => {
    setShowProfileMenu(false);
  }, [location.pathname, setShowProfileMenu]);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/70 border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20 
              }}
            >
              <span className="font-semibold text-lg">DeliveryApp</span>
            </motion.div>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            
            <NavLink to="/delivery" pathname={location.pathname}>
              Delivery
            </NavLink>
            <NavLink to="/products" pathname={location.pathname}>
              Produtos
            </NavLink>
            <NavLink to="/orders-by-day" pathname={location.pathname}>
              Relatórios
            </NavLink>
        
         
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeSelector className="mr-2" />
          <ShopStatusButton />
          <ProfileMenu 
            profile={profile}
            onSignOut={onSignOut}
            showMenu={showProfileMenu}
            setShowMenu={setShowProfileMenu}
          />
          <MobileMenu pathname={location.pathname} />
        </div>
      </div>
    </header>
  );
}
