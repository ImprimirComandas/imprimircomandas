
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      // Mark notification as seen
      const { notification_id, device_token }: { 
        notification_id: string; 
        device_token: string; 
      } = await req.json();

      const { error } = await supabase
        .from('notification_tracking')
        .update({
          visto_em: new Date().toISOString(),
          status: 'visto'
        })
        .eq('notification_id', notification_id)
        .eq('device_token', device_token);

      if (error) {
        console.error('Error marking notification as seen:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (req.method === 'GET') {
      // Get notification statistics
      const url = new URL(req.url);
      const notificationId = url.searchParams.get('notification_id');

      let query = supabase
        .from('notification_tracking')
        .select(`
          *,
          notifications (
            titulo,
            mensagem,
            created_at,
            taxa_entrega,
            bairro
          )
        `);

      if (notificationId) {
        query = query.eq('notification_id', notificationId);
      }

      const { data, error } = await query.order('enviado_em', { ascending: false });

      if (error) {
        console.error('Error fetching notification tracking:', error);
        throw error;
      }

      // Calculate statistics
      const stats = {
        total: data?.length || 0,
        enviados: data?.filter(t => t.status === 'enviado').length || 0,
        vistos: data?.filter(t => t.status === 'visto').length || 0,
        erros: data?.filter(t => t.status === 'erro').length || 0,
        data: data || []
      };

      return new Response(
        JSON.stringify(stats),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in notification-tracking function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
