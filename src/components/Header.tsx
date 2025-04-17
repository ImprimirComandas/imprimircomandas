
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, ShoppingBag, Settings, Calendar, MapPin, Menu, X } from 'lucide-react';
import type { Profile } from '../types/database';
import { supabase } from '../lib/supabase';
import NavLink from './header/NavLink';
import ShopStatusButton from './header/ShopStatusButton';
import ProfileMenu from './header/ProfileMenu';
import MobileMenu from './header/MobileMenu';

interface HeaderProps {
  profile: Profile | null;
  onSignOut: () => void;
  showProfileMenu: boolean;
  setShowProfileMenu: (show: boolean) => void;
}

export default function Header({ profile, onSignOut, showProfileMenu, setShowProfileMenu }: HeaderProps) {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkShopStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('shop_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .is('end_time', null)
          .order('start_time', { ascending: false })
          .limit(1);

        if (error) throw error;
        setIsShopOpen(data && data.length > 0);
      } catch (error) {
        console.error('Erro ao verificar status da loja:', error);
      }
    };

    checkShopStatus();
  }, []);

  const navLinks = [
    { to: '/products', label: 'Produtos', icon: ShoppingBag },
    { to: '/orders-by-day', label: 'Pedidos', icon: Calendar },

    { to: '/test', label: 'Delivery', icon: Store },
    { to: '/store-settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Store className="h-8 w-8 mr-2" />
              <span className="font-semibold text-xl tracking-tight">
                {profile?.store_name || 'Dom Luiz Bebidas'}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ShopStatusButton 
              isShopOpen={isShopOpen} 
              setIsShopOpen={setIsShopOpen}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
            
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink 
                key={to} 
                to={to} 
                icon={<Icon className="h-5 w-5 mr-1" />} 
                label={label} 
              />
            ))}
            
            <ProfileMenu 
              profile={profile}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onSignOut={onSignOut}
            />
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        profile={profile}
        isShopOpen={isShopOpen}
        isLoading={isLoading}
        toggleShopStatus={() => {
          const button = document.createElement('button');
          const shopStatusButton = document.querySelector("[data-testid='shop-status-button']");
          if (shopStatusButton) {
            shopStatusButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
        }}
        navLinks={navLinks}
        onSignOut={onSignOut}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
    </header>
  );
}
