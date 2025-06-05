
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu, Sun, Moon, Settings, LogOut, User } from "lucide-react"
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useTheme } from 'next-themes';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setTheme, theme } = useTheme();

  const handleSignOut = async () => {
    // Add your sign out logic here
    navigate('/login');
  };

  const navItems = [
    { href: '/', label: 'Início' },
    { href: '/products', label: 'Produtos' },
    { href: '/orders', label: 'Pedidos' },
    { href: '/orders-by-day', label: 'Pedidos por Dia' },
    { href: '/delivery', label: 'Delivery' },
    { href: '/motoboys', label: 'Motoboys' },
    { href: '/bairros', label: 'Bairros' },
    { href: '/admin/notifications', label: 'Notificações' },
    { href: '/settings', label: 'Configurações' }
  ];

  return (
    <header className="bg-background border-b border-border relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <button onClick={() => navigate('/')} className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-primary rounded" />
              <span className="font-bold">Admin Panel</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  location.pathname === item.href ? 'bg-accent text-accent-foreground' : ''
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            <NotificationBell />
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="Avatar" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  Usuário Admin
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle>Admin Panel</SheetTitle>
                  <SheetDescription>
                    Gerencie sua loja de forma eficiente.
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="my-4">
                  <div className="grid gap-4">
                    {navItems.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => {
                          navigate(item.href);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          location.pathname === item.href ? 'bg-accent text-accent-foreground' : ''
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
