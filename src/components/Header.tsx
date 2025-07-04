
import { Fragment, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Profile } from '../types/database';
import ShopStatusButton from './header/ShopStatusButton';
import ProfileMenu from './header/ProfileMenu';
import NavLink from './header/NavLink';
import MobileMenu from './header/MobileMenu';
import ThemeSelector from './ThemeSelector';
import NotificationBell from './NotificationBell';
import { useTheme } from '../hooks/useTheme';

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
  setShowProfileMenu,
}: HeaderProps) {
  const location = useLocation();
  const { isDark, theme } = useTheme();
  const isSupabase = theme === 'supabase';

  useEffect(() => {
    setShowProfileMenu(false);
  }, [location.pathname, setShowProfileMenu]);

  return (
    <header className={`
      sticky top-0 z-50 w-full border-b border-border/50 shadow-sm transition-colors duration-300
      ${isSupabase ? 'backdrop-blur-lg bg-background/80' : 'backdrop-blur-lg bg-background/90'}
    `}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-8 lg:px-12">
        {/* Logo e Navegação */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: 0.1,
              }}
            >
              <span className={`
                font-bold text-2xl tracking-tight 
                ${isSupabase ? 'bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent' : 'text-foreground'}
              `}>
                {profile?.store_name || 'Dom Luiz Bebidas'}
              </span>
            </motion.div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex gap-8">
            <NavLink
              to="/delivery"
              pathname={location.pathname}
              className={`
                relative text-sm font-medium transition-colors duration-300
                ${isSupabase ? 'text-foreground/80 hover:text-primary' : 'text-foreground/80 hover:text-primary'}
              `}
            >
              Delivery
              {location.pathname === '/delivery' && (
                <motion.div
                  className={`absolute -bottom-1 left-0 w-full h-0.5 ${isSupabase ? 'bg-primary' : 'bg-primary'}`}
                  layoutId="underline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </NavLink>
            <NavLink
              to="/products"
              pathname={location.pathname}
              className={`
                relative text-sm font-medium transition-colors duration-300
                ${isSupabase ? 'text-foreground/80 hover:text-primary' : 'text-foreground/80 hover:text-primary'}
              `}
            >
              Produtos
              {location.pathname === '/products' && (
                <motion.div
                  className={`absolute -bottom-1 left-0 w-full h-0.5 ${isSupabase ? 'bg-primary' : 'bg-primary'}`}
                  layoutId="underline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </NavLink>
            <NavLink
              to="/delivery-rates"
              pathname={location.pathname}
              className={`
                relative text-sm font-medium transition-colors duration-300
                ${isSupabase ? 'text-foreground/80 hover:text-primary' : 'text-foreground/80 hover:text-primary'}
              `}
            >
              Bairros
              {location.pathname === '/delivery-rates' && (
                <motion.div
                  className={`absolute -bottom-1 left-0 w-full h-0.5 ${isSupabase ? 'bg-primary' : 'bg-primary'}`}
                  layoutId="underline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </NavLink>
            <NavLink
              to="/orders-by-day"
              pathname={location.pathname}
              className={`
                relative text-sm font-medium transition-colors duration-300
                ${isSupabase ? 'text-foreground/80 hover:text-primary' : 'text-foreground/80 hover:text-primary'}
              `}
            >
              Relatórios
              {location.pathname === '/orders-by-day' && (
                <motion.div
                  className={`absolute -bottom-1 left-0 w-full h-0.5 ${isSupabase ? 'bg-primary' : 'bg-primary'}`}
                  layoutId="underline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </NavLink>
            <NavLink
              to="/analytics"
              pathname={location.pathname}
              className={`
                relative text-sm font-medium transition-colors duration-300
                ${isSupabase ? 'text-foreground/80 hover:text-primary' : 'text-foreground/80 hover:text-primary'}
              `}
            >
              Analytics
              {location.pathname === '/analytics' && (
                <motion.div
                  className={`absolute -bottom-1 left-0 w-full h-0.5 ${isSupabase ? 'bg-primary' : 'bg-primary'}`}
                  layoutId="underline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </NavLink>
          </nav>
        </div>

        {/* Ações e Menu */}
        <div className="flex items-center gap-4">
          <NotificationBell />
          <ThemeSelector
            className={`
              mr-2 rounded-full p-2 transition-colors duration-200
              ${isSupabase ? 'hover:bg-primary/10 hover:text-primary' : 'hover:bg-accent'}
            `}
          />
          <ShopStatusButton className={`
            rounded-full px-4 py-2 text-primary-foreground transition-all duration-300 shadow-sm
            ${isSupabase ? 'bg-primary hover:bg-primary/90' : 'bg-primary hover:bg-primary/90'}
          `} />
          <ProfileMenu
            profile={profile}
            onSignOut={onSignOut}
            showMenu={showProfileMenu}
            setShowMenu={setShowProfileMenu}
            className={`
              rounded-full p-2 transition-colors duration-200
              ${isSupabase ? 'hover:bg-primary/10 hover:text-primary' : 'hover:bg-accent'}
            `}
          />
          <MobileMenu
            pathname={location.pathname}
            className={`
              md:hidden rounded-full p-2 transition-colors duration-200
              ${isSupabase ? 'hover:bg-primary/10 hover:text-primary' : 'hover:bg-accent'}
            `}
          />
        </div>
      </div>
    </header>
  );
}
