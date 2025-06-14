
// Função para criar uma preferência de pagamento Mercado Pago
import { serve } from 'std/server'
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { orderId } = await req.json();
  if (!orderId) return new Response(JSON.stringify({ error: 'orderId required' }), { headers: corsHeaders, status: 400 });

  // Busca pedido (online_orders)
  const { data: order } = await supabase.from('online_orders').select('*').eq('id', orderId).maybeSingle();
  if (!order) return new Response(JSON.stringify({ error: 'order not found' }), { headers: corsHeaders, status: 404 });

  // Busca config do Mercado Pago (mercado_pago_settings)
  const { data: mp } = await supabase.from('mercado_pago_settings').select('*').eq('user_id', order.store_id).eq('ativo', true).maybeSingle()
  if (!mp) return new Response(JSON.stringify({ error: 'mercado pago config not found' }), { headers: corsHeaders, status: 400 });

  // Chamada à API Mercado Pago
  const pref = {
    items: [{
      title: `Pedido #${order.id}`,
      quantity: 1,
      currency_id: "BRL",
      unit_price: Number(order.valor_total),
    }],
    payer: {
      name: order.cliente_nome || "",
      email: order.cliente_email || "",
    },
    notification_url: mp.webhook_url,
    external_reference: order.id,
  };
  const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${mp.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pref)
  })
  const result = await r.json()
  if (!r.ok) {
    return new Response(JSON.stringify({ error: result }), { headers: corsHeaders, status: 400 });
  }
  // Salva ID do pagamento no pedido
  await supabase.from('online_orders').update({ mercado_pago_payment_id: result.id ?? null }).eq('id', order.id);
  return new Response(JSON.stringify({ mp: result }), { headers: corsHeaders, status: 200 });
})
