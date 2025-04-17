
import { AnimatePresence, motion } from 'framer-motion';
import { DoorOpen, DoorClosed, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Profile } from '../../types/database';

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  profile: Profile | null;
  isShopOpen: boolean;
  isLoading: boolean;
  toggleShopStatus: () => void;
  navLinks: { to: string; label: string; icon: React.ElementType }[];
  onSignOut: () => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function MobileMenu({
  isMobileMenuOpen,
  profile,
  isShopOpen,
  isLoading,
  toggleShopStatus,
  navLinks,
  onSignOut,
  setIsMobileMenuOpen
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-blue-700"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2">
            <button
              onClick={toggleShopStatus}
              disabled={isLoading}
              className={`flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isShopOpen
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isShopOpen ? (
                <DoorOpen className="h-5 w-5 mr-2" />
              ) : (
                <DoorClosed className="h-5 w-5 mr-2" />
              )}
              <span>{isShopOpen ? 'Loja Aberta' : 'Loja Fechada'}</span>
            </button>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200"
              >
                <Icon className="h-5 w-5 mr-2" />
                <span>{label}</span>
              </Link>
            ))}
            <div className="border-t border-blue-600 pt-2">
              <div className="px-4 py-2">
                <p className="font-medium text-white">{profile?.full_name || 'Usuário'}</p>
                <p className="text-xs text-blue-200 truncate">{profile?.email || ''}</p>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onSignOut();
                }}
                className="flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
