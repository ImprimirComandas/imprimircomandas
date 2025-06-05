
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Send, Calendar, Users, Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

export function AdminNotificationSender() {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipo, setTipo] = useState<'sistema' | 'promocao' | 'alerta' | 'info'>('info');
  const [agendada, setAgendada] = useState(false);
  const [dataAgendamento, setDataAgendamento] = useState('');
  const [preview, setPreview] = useState(false);
  
  const { createNotification, loading } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim() || !mensagem.trim()) {
      toast.error('Título e mensagem são obrigatórios');
      return;
    }

    try {
      // Create a mock comanda for the notification system
      const mockComanda = {
        id: crypto.randomUUID(),
        total: 0,
        taxaentrega: 0,
        bairro: 'Sistema'
      };

      const success = await createNotification(mockComanda as any, 'nova_comanda');
      
      if (success) {
        toast.success('Notificação enviada com sucesso!');
        // Reset form
        setTitulo('');
        setMensagem('');
        setTipo('info');
        setAgendada(false);
        setDataAgendamento('');
        setPreview(false);
      } else {
        toast.error('Erro ao enviar notificação');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Erro ao enviar notificação');
    }
  };

  const tipoOptions = [
    { value: 'sistema', label: 'Sistema', color: 'bg-blue-500' },
    { value: 'promocao', label: 'Promoção', color: 'bg-green-500' },
    { value: 'alerta', label: 'Alerta', color: 'bg-red-500' },
    { value: 'info', label: 'Informação', color: 'bg-gray-500' }
  ];

  const selectedTipoOption = tipoOptions.find(option => option.value === tipo);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Notificação para Todos os Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Digite o título da notificação"
                  maxLength={100}
                />
                <div className="text-xs text-muted-foreground">
                  {titulo.length}/100 caracteres
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Notificação</Label>
                <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem</Label>
              <Textarea
                id="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite a mensagem da notificação"
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground">
                {mensagem.length}/500 caracteres
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreview(!preview)}
              >
                <Bell className="h-4 w-4 mr-2" />
                {preview ? 'Ocultar Preview' : 'Mostrar Preview'}
              </Button>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="agendada"
                  checked={agendada}
                  onChange={(e) => setAgendada(e.target.checked)}
                />
                <Label htmlFor="agendada">Agendar envio</Label>
              </div>
            </div>

            {agendada && (
              <div className="space-y-2">
                <Label htmlFor="dataAgendamento">Data e Hora do Agendamento</Label>
                <Input
                  id="dataAgendamento"
                  type="datetime-local"
                  value={dataAgendamento}
                  onChange={(e) => setDataAgendamento(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}

            {preview && titulo && mensagem && (
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${selectedTipoOption?.color}`} />
                      <span className="text-sm font-medium">Preview da Notificação</span>
                    </div>
                    <Badge variant="outline">{selectedTipoOption?.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium">{titulo}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{mensagem}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Agora mesmo
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={loading || !titulo.trim() || !mensagem.trim()}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {agendada ? 'Agendar Notificação' : 'Enviar Agora'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTitulo('');
                  setMensagem('');
                  setTipo('info');
                  setAgendada(false);
                  setDataAgendamento('');
                  setPreview(false);
                }}
              >
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Destinatários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Todos os Usuários Ativos</h4>
              <p className="text-sm text-muted-foreground">
                A notificação será enviada para todos os dispositivos cadastrados
              </p>
            </div>
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              Todos
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
