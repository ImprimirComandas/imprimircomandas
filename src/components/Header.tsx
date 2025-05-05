
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
  setShowProfileMenu,
}: HeaderProps) {
  const location = useLocation();

  useEffect(() => {
    setShowProfileMenu(false);
  }, [location.pathname, setShowProfileMenu]);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/90 border-b border-border/50 shadow-sm">
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
              <span className="font-bold text-2xl tracking-tight text-foreground bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {profile?.store_name || 'Dom Luiz Bebidas'}
              </span>
            </motion.div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex gap-8">
            <NavLink
              to="/delivery"
              pathname={location.pathname}
              style={{
                position: 'relative',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--foreground-80)',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                const target = e.currentTarget as HTMLAnchorElement;
                target.style.color = 'var(--primary)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                const target = e.currentTarget as HTMLAnchorElement;
                target.style.color = 'var(--foreground-80)';
              }}
            >
              Delivery
              {location.pathname === '/delivery' && (
                <motion.div
                  className=" "
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
              style={{
                position: 'relative',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--foreground-80)',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                const target = e.currentTarget as HTMLAnchorElement;
                target.style.color = 'var(--primary)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                const target = e.currentTarget as HTMLAnchorElement;
                target.style.color = 'var(--foreground-80)';
              }}
            >
              Produtos
              {location.pathname === '/products' && (
                <motion.div
                  className=" "
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
              className="relative text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-300"
            >
              Bairros
              {location.pathname === '/delivery-rates' && (
                <motion.div
                  className=" "
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
              className="relative text-sm font-medium text-foreground/80 hover:text-primary transition-colors duration-300"
            >
              Relatórios
              {location.pathname === '/orders-by-day' && (
                <motion.div
                  className=" "
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
          <ThemeSelector
            className="mr-2 rounded-full p-2 hover:bg-accent transition-colors duration-200"
          />
          <ShopStatusButton className="rounded-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-sm" />
          <ProfileMenu
            profile={profile}
            onSignOut={onSignOut}
            showMenu={showProfileMenu}
            setShowMenu={setShowProfileMenu}
            className="rounded-full p-2 hover:bg-accent transition-colors duration-200"
          />
          <MobileMenu
            pathname={location.pathname}
            className="md:hidden rounded-full p-2 hover:bg-accent transition-colors duration-200"
          />
        </div>
      </div>
    </header>
  );
}
