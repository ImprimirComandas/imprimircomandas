// Painel de configuração Mercado Pago
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function MercadoPagoConfigPanel({ showApplicationId = false }: { showApplicationId?: boolean }) {
  const { user } = useAuth();
  const [accessToken, setAccessToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [productionMode, setProductionMode] = useState(false);
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationId, setApplicationId] = useState("");

  useEffect(() => {
    // Carrega config existente
    if (user?.id) {
      supabase.from("mercado_pago_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle().then(({ data }) => {
          if (!data) return;
          setAccessToken(data.access_token || "");
          setPublicKey(data.public_key || "");
          setWebhookUrl(data.webhook_url || "");
          setProductionMode(!!data.production_mode);
          setAtivo(!!data.ativo);
          setApplicationId(data.application_id || "");
        })
    }
  }, [user]);

  async function salvar() {
    if (!user?.id) return;
    setSaving(true);
    await supabase.from("mercado_pago_settings")
      .upsert({
        user_id: user.id,
        access_token: accessToken,
        public_key: publicKey,
        webhook_url: webhookUrl,
        production_mode: productionMode,
        ativo,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    setSaving(false);
    alert("Configuração salva");
  }

  return (
    <div className="bg-card border rounded-md p-4 space-y-4">
      <h2 className="text-lg font-bold mb-2">Mercado Pago</h2>
      <div className="mb-2">
        <label className="block mb-1">Access Token</label>
        <Input value={accessToken} onChange={e => setAccessToken(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Public Key</label>
        <Input value={publicKey} onChange={e => setPublicKey(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Webhook URL</label>
        <Input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
      </div>
      <div className="flex items-center gap-3 mb-2">
        <Switch checked={productionMode} onCheckedChange={setProductionMode} />
        <span>Modo produção</span>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <Switch checked={ativo} onCheckedChange={setAtivo} />
        <span>Configuração ativa</span>
      </div>
      {showApplicationId && (
        <div className="mb-2">
          <label className="block mb-1">Application ID</label>
          <Input value={applicationId} readOnly />
          <p className="text-xs text-muted-foreground">Use este Application ID ao criar integrações Mercado Pago.</p>
        </div>
      )}
      <Button onClick={salvar} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
    </div>
  );
}
