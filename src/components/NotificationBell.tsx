
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import NotificationModal from './NotificationModal';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    setIsOpen(false);
    
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <motion.div
              animate={unreadCount > 0 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: unreadCount > 0 ? Infinity : 0, duration: 2 }}
            >
              <Bell className="h-5 w-5" />
            </motion.div>
            
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notificações</span>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} novas</Badge>
            )}
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <ScrollArea className="h-96">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Carregando notificações...
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start p-4 cursor-pointer hover:bg-accent"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="w-full">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className={`text-sm font-medium line-clamp-1 ${!notification.read ? 'font-bold' : ''}`}>
                        {notification.titulo}
                      </h4>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {notification.mensagem}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {notification.tipo && (
                        <Badge variant="outline" className="text-xs">
                          {notification.tipo}
                        </Badge>
                      )}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full ml-auto"></div>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </ScrollArea>
          
          {notifications.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link 
                  to="/notifications" 
                  className="text-center justify-center w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-sm text-muted-foreground">
                    Ver todas as notificações
                  </span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
        onMarkAsRead={markAsRead}
      />
    </>
  );
}
