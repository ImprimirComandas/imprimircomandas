
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Notification } from '../hooks/useNotifications';

interface NotificationModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (id: string) => void;
}

export default function NotificationModal({ 
  notification, 
  isOpen, 
  onClose, 
  onMarkAsRead 
}: NotificationModalProps) {
  if (!notification) return null;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead && !notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{notification.titulo}</span>
            {notification.tipo && (
              <Badge variant="outline">{notification.tipo}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {formatDateTime(notification.created_at)}
            </p>
            <p className="text-sm">{notification.mensagem}</p>
          </div>
          
          {notification.dados_extras && Object.keys(notification.dados_extras).length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Dados adicionais:</h4>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(notification.dados_extras, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center gap-2">
              {!notification.read ? (
                <Badge variant="destructive">Não lida</Badge>
              ) : (
                <Badge variant="secondary">Lida</Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              {!notification.read && onMarkAsRead && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAsRead}
                >
                  Marcar como lida
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
