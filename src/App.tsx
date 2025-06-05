import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Delivery } from './pages/Delivery';
import { Motoboys } from './pages/Motoboys';
import { Bairros } from './pages/Bairros';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SystemLogs } from './pages/SystemLogs';
import { UserManagement } from './pages/UserManagement';
import OrdersByDay from './pages/OrdersByDay';
import AdminNotifications from '@/pages/AdminNotifications';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="pt-4">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/orders-by-day" element={<ProtectedRoute><OrdersByDay /></ProtectedRoute>} />
                <Route path="/delivery" element={<ProtectedRoute><Delivery /></ProtectedRoute>} />
                <Route path="/motoboys" element={<ProtectedRoute><Motoboys /></ProtectedRoute>} />
                <Route path="/bairros" element={<ProtectedRoute><Bairros /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/system-logs" element={<ProtectedRoute><SystemLogs /></ProtectedRoute>} />
                <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                <Route path="/admin/notifications" element={<ProtectedRoute><AdminNotifications /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Toaster />
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
