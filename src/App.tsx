
import { useEffect, useState } from 'react';
import { Auth } from './pages/Auth';
import { ResetPassword } from './pages/ResetPassword';
import { supabase } from './lib/supabase';
import DeliveryApp from './components/DeliveryApp';
import type { Profile } from './types/database';
import { Products } from './pages/Products';
import StoreSettings from './pages/StoreSettings';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './components/Header';
import { useProfileMenu } from './hooks/useProfileMenu';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { showProfileMenu, setShowProfileMenu, handleSignOut } = useProfileMenu();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Use setTimeout to avoid potential deadlocks with Supabase client
      if (session?.user) {
        setTimeout(() => {
          getProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // THEN check for existing session
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
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const isResetPassword = window.location.hash === '#reset-password';

  return (
    <>
      <Toaster position="top-right" richColors />
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
            <Route path="/products" element={<Products />} />
            <Route path="/store-settings" element={<StoreSettings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      )}
    </>
  );
}

export default App;
