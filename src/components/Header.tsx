import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu } from "lucide-react"
import { MainNav } from '@/components/MainNav';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Icons } from './icons';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="bg-background border-b border-border relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Icons.logo className="h-6 w-6" />
              <span className="font-bold">{siteConfig.name}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <MainNav className="mx-6" />
            <Link href="/orders" className={cn("flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground", router.pathname === '/orders' ? 'bg-accent text-accent-foreground' : '')}>
              Pedidos
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            <NotificationBell />
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'Avatar'} />
                    <AvatarFallback>
                      {session?.user?.name ? session.user.name[0].toUpperCase() : '?'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  {session?.user?.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  <SheetTitle>{siteConfig.name}</SheetTitle>
                  <SheetDescription>
                    Gerencie sua loja de forma eficiente.
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="my-4">
                  <MainNav className="grid gap-4" />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>

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
              <SheetTitle>{siteConfig.name}</SheetTitle>
              <SheetDescription>
                Gerencie sua loja de forma eficiente.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="my-4">
              <MainNav className="grid gap-4" />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
