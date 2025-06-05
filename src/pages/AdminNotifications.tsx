
import React, { useState } from 'react';
import { PageContainer } from '@/components/layouts/PageContainer';
import { AdminNotificationSender } from '@/components/admin/AdminNotificationSender';
import { NotificationDashboard } from '@/components/orders/NotificationDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, BarChart3 } from 'lucide-react';

export default function AdminNotifications() {
  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-foreground">
            Gerenciar Notificações
          </h1>
          <p className="mt-2 text-muted-foreground">
            Envie notificações para todos os usuários e acompanhe as estatísticas
          </p>
        </div>

        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Enviar Notificações
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard & Estatísticas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="send" className="mt-6">
            <AdminNotificationSender />
          </TabsContent>
          
          <TabsContent value="dashboard" className="mt-6">
            <NotificationDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
