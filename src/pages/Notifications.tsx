
import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import NotificationModal from '../components/NotificationModal';
import { Bell, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Notifications() {
  const { notifications, unreadCount, loading, markAsRead } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Notificações</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} não lidas</Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Gerencie todas as suas notificações em um só lugar
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todas ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          <EyeOff className="h-4 w-4 mr-1" />
          Não lidas ({unreadCount})
        </Button>
        <Button
          variant={filter === 'read' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('read')}
        >
          <Eye className="h-4 w-4 mr-1" />
          Lidas ({notifications.length - unreadCount})
        </Button>
      </div>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {filter === 'all' ? 'Nenhuma notificação' : 
               filter === 'unread' ? 'Nenhuma notificação não lida' : 
               'Nenhuma notificação lida'}
            </h3>
            <p className="text-muted-foreground text-center">
              {filter === 'all' ? 'Quando você receber notificações, elas aparecerão aqui.' :
               filter === 'unread' ? 'Todas as suas notificações foram lidas.' :
               'Você não leu nenhuma notificação ainda.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.read ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className={`text-base ${!notification.read ? 'font-bold' : 'font-medium'}`}>
                        {notification.titulo}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {formatDateTime(notification.created_at)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.tipo && (
                        <Badge variant="outline" className="text-xs">
                          {notification.tipo}
                        </Badge>
                      )}
                      {!notification.read ? (
                        <Badge variant="destructive" className="text-xs">
                          Nova
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Lida
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {notification.mensagem}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <NotificationModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
        onMarkAsRead={markAsRead}
      />
    </div>
  );
}
