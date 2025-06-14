import React, { useEffect, useState } from 'react';
import { Auth } from './pages/Auth';
import { ResetPassword } from './pages/ResetPassword';
import { supabase } from './lib/supabase';
import DeliveryApp from './components/DeliveryApp';
import type { Profile } from './types/database';
import { Products } from './pages/Products';
import StoreSettings from './pages/StoreSettings';
import OrdersByDay from './pages/OrdersByDay';
import DeliveryRates from './pages/DeliveryRates';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import { useProfileMenu } from './hooks/useProfileMenu';
import DeliveryManagement from './components/delivery/DeliveryManagement';
import { useTheme } from './hooks/useTheme';
import { Toaster } from 'sonner';
import PublicStore from "@/pages/PublicStore";

function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { showProfileMenu, setShowProfileMenu, handleSignOut } = useProfileMenu();
  const { theme, changeTheme } = useTheme();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setTimeout(() => {
          getProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        getProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      
      // Set the user's preferred theme if available
      if (data?.theme) {
        changeTheme(data.theme);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isResetPassword = window.location.hash === '#reset-password';

  return (
    <>
      {!session ? (
        isResetPassword ? <ResetPassword /> : <Auth />
      ) : (
        <>
          <Header 
            profile={profile} 
            onSignOut={handleSignOut} 
            showProfileMenu={showProfileMenu}
            setShowProfileMenu={setShowProfileMenu}
          />
          <Routes>
            <Route path="/" element={<DeliveryApp profile={profile} />} />
            <Route path="/delivery" element={<DeliveryManagement />} />
            <Route path="/products" element={<Products />} />
            <Route path="/store-settings" element={<StoreSettings />} />
            <Route path="/orders-by-day" element={<OrdersByDay />} />
            <Route path="/delivery-rates" element={<DeliveryRates />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/loja/:slug" element={<PublicStore />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      )}
      <Toaster position="bottom-right" theme={theme === 'dark' ? 'dark' : 'light'} />
    </>
  );
}

export default App;
