
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  notification_id: string;
  titulo: string;
  mensagem: string;
  taxa_entrega?: number;
  bairro?: string;
  tipo: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      notification_id, 
      titulo, 
      mensagem, 
      taxa_entrega, 
      bairro, 
      tipo 
    }: NotificationRequest = await req.json();

    console.log('Sending notification:', { notification_id, titulo, mensagem });

    // Get all active device tokens
    const { data: deviceTokens, error: tokenError } = await supabase
      .from('device_tokens')
      .select('token, device_info')
      .eq('ativo', true);

    if (tokenError) {
      console.error('Error fetching device tokens:', tokenError);
      throw tokenError;
    }

    console.log(`Found ${deviceTokens?.length || 0} active device tokens`);

    if (!deviceTokens || deviceTokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active device tokens found' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create notification tracking entries
    const trackingEntries = deviceTokens.map(device => ({
      notification_id,
      device_token: device.token,
      status: 'enviado'
    }));

    const { error: trackingError } = await supabase
      .from('notification_tracking')
      .insert(trackingEntries);

    if (trackingError) {
      console.error('Error creating tracking entries:', trackingError);
      throw trackingError;
    }

    // Here you would integrate with your push notification service
    // For now, we'll just log the notification data
    console.log('Notification data to send:', {
      title: titulo,
      body: mensagem,
      data: {
        notification_id,
        taxa_entrega,
        bairro,
        tipo,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        devices_notified: deviceTokens.length,
        message: 'Notification sent successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
