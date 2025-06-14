
-- 1. Mercado Pago por lojista
CREATE TABLE public.mercado_pago_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  public_key TEXT NOT NULL,
  production_mode BOOLEAN NOT NULL DEFAULT FALSE,
  webhook_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.mercado_pago_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RLS: only owner can manage mercado pago settings"
  ON public.mercado_pago_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Tabela para pedidos online
CREATE TABLE public.online_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL, -- referencia user_id da loja
  cliente_nome TEXT,
  cliente_email TEXT,
  cliente_telefone TEXT,
  cliente_endereco TEXT,
  carrinho JSONB, -- Produtos do pedido
  valor_total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'aguardando_pagamento',
  mercado_pago_payment_id TEXT,
  mercado_pago_status TEXT,
  pagamento_metodo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.online_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RLS: loja vê seus próprios pedidos"
  ON public.online_orders
  FOR ALL
  USING (auth.uid() = store_id)
  WITH CHECK (auth.uid() = store_id);

-- 3. Webhook logs
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID,
  order_id UUID,
  webhook_event TEXT,
  payload JSONB,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RLS: lojista vê logs próprios"
  ON public.webhook_logs
  FOR ALL
  USING (store_id IS NULL OR auth.uid() = store_id)
  WITH CHECK (store_id IS NULL OR auth.uid() = store_id);

-- 4. Campos na tabela profiles para ativar loja e configurar url pública
ALTER TABLE public.profiles
  ADD COLUMN loja_online_ativa BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN loja_online_slug TEXT,
  ADD COLUMN loja_online_descricao TEXT,
  ADD COLUMN loja_online_mensagem_publica TEXT,
  ADD COLUMN loja_online_horario TEXT;

