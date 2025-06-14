
// Mercado Pago Webhook - Recebe e processa notificações de pagamento
import { serve } from 'std/server'
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  let body: any = {}
  try {
    body = await req.json()
  } catch {}

  // Para logs
  await supabase.from('webhook_logs').insert({
    webhook_event: req.headers.get('x-mp-signature') || req.headers.get('x-signature') || 'unknown',
    payload: body,
    received_at: new Date().toISOString(),
  })

  // Atualização de status de pagamento de pedidos online
  if (body?.data?.id && body?.type?.startsWith('payment.')) {
    const paymentId = String(body.data.id)
    const status = body.data.status || 'unknown'
    await supabase.from('online_orders').update({ 
      mercado_pago_status: status 
    }).eq('mercado_pago_payment_id', paymentId)
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})
