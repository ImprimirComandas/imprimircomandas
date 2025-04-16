
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, ShoppingBag, Settings, LogOut, Calendar, MapPin, DoorOpen, DoorClosed, Menu, X, Clock } from 'lucide-react';
import type { Profile } from '../types/database';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [openDuration, setOpenDuration] = useState<string>('');

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
        
        if (data && data.length > 0) {
          setIsShopOpen(true);
          setSessionStartTime(data[0].start_time);
          
          // Update the duration every minute
          updateOpenDuration(data[0].start_time);
          const intervalId = setInterval(() => {
            updateOpenDuration(data[0].start_time);
          }, 60000); // Every minute
          
          return () => clearInterval(intervalId);
        } else {
          setIsShopOpen(false);
          setSessionStartTime(null);
          setOpenDuration('');
        }
      } catch (error) {
        console.error('Erro ao verificar status da loja:', error);
      }
    };

    checkShopStatus();
  }, []);
  
  // Function to update the open duration string
  const updateOpenDuration = (startTimeStr: string) => {
    try {
      const duration = formatDistanceToNow(new Date(startTimeStr), { 
        locale: ptBR, 
        addSuffix: false
      });
      setOpenDuration(duration);
    } catch (error) {
      console.error('Error calculating duration:', error);
      setOpenDuration('');
    }
  };

  const toggleShopStatus = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      if (isShopOpen) {
        const { data: sessions, error: fetchError } = await supabase
          .from('shop_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .is('end_time', null)
          .order('start_time', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        if (sessions && sessions.length > 0) {
          const { error: updateError } = await supabase
            .from('shop_sessions')
            .update({ end_time: new Date().toISOString() })
            .eq('id', sessions[0].id);

          if (updateError) throw updateError;
          
          const duration = formatDistanceToNow(new Date(sessions[0].start_time), { 
            locale: ptBR, 
            addSuffix: false
          });
          
          toast.success(`Loja fechada com sucesso! Tempo aberta: ${duration}`);
          setSessionStartTime(null);
          setOpenDuration('');
        }
      } else {
        const startTime = new Date().toISOString();
        const { error } = await supabase
          .from('shop_sessions')
          .insert([
            {
              user_id: session.user.id,
              start_time: startTime,
              end_time: null,
            },
          ]);

        if (error) throw error;
        toast.success('Loja aberta com sucesso');
        setSessionStartTime(startTime);
        updateOpenDuration(startTime);
      }

      setIsShopOpen(!isShopOpen);
    } catch (error: any) {
      if (error instanceof Error) {
        toast.error(`Erro ao alterar status da loja: ${error.message}`);
      } else {
        toast.error('Erro ao alterar status da loja');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navLinks = [
    { to: '/products', label: 'Produtos', icon: ShoppingBag },
    { to: '/orders-by-day', label: 'Pedidos', icon: Calendar },
    { to: '/delivery-rates', label: 'Taxas', icon: MapPin },
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
            <button
              onClick={toggleShopStatus}
              disabled={isLoading}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isShopOpen
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isShopOpen ? (
                <>
                  <DoorOpen className="h-5 w-5 mr-1" />
                  <span>Loja Aberta</span>
                  {openDuration && (
                    <div className="ml-2 flex items-center text-xs bg-green-700 px-2 py-0.5 rounded">
                      <Clock className="h-3 w-3 mr-1" />
                      {openDuration}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <DoorClosed className="h-5 w-5 mr-1" />
                  <span>Loja Fechada</span>
                </>
              )}
            </button>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                <Icon className="h-5 w-5 mr-1" />
                <span>{label}</span>
              </Link>
            ))}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center rounded-full border-2 border-blue-400 p-1 hover:border-white focus:outline-none focus:border-white transition-colors duration-200"
              >
                <div className="h-8 w-8 rounded-full bg-blue-300 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Usuário'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-blue-700">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
              </button>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-medium text-gray-900">{profile?.full_name || 'Usuário'}</p>
                      <p className="text-xs text-gray-500 truncate">{profile?.email || ''}</p>
                    </div>
                    <button
                      onClick={onSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
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
                  <>
                    <DoorOpen className="h-5 w-5 mr-2" />
                    <div>
                      <span>Loja Aberta</span>
                      {openDuration && (
                        <div className="mt-1 flex items-center text-xs bg-green-700 px-2 py-0.5 rounded w-max">
                          <Clock className="h-3 w-3 mr-1" />
                          {openDuration}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <DoorClosed className="h-5 w-5 mr-2" />
                    <span>Loja Fechada</span>
                  </>
                )}
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
    </header>
  );
}
