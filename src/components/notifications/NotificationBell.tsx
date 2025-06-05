
import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    permissionGranted,
    requestNotificationPermission,
    markAsRead,
    clearAllNotifications,
    markAllAsRead
  } = useRealtimeNotifications();

  const handleRequestPermission = async () => {
    await requestNotificationPermission();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <Card className="w-80 max-h-96 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Notificações {unreadCount > 0 && `(${unreadCount})`}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {!permissionGranted && (
                <div className="text-xs text-muted-foreground">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRequestPermission}
                    className="w-full text-xs"
                  >
                    Permitir notificações do navegador
                  </Button>
                </div>
              )}
              
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs flex-1"
                  >
                    Marcar todas como lidas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="text-xs flex-1"
                  >
                    Limpar todas
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-60">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Nenhuma notificação
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div
                          className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                            !notification.lida ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-medium ${
                                !notification.lida ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {notification.titulo}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.mensagem}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </span>
                            </div>
                            {!notification.lida && (
                              <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </div>
                        {index < notifications.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
