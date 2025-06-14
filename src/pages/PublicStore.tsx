
// Página pública da loja online (catálogo simples inicial)
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
// Adapte para catálogo real na próxima etapa!
export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Busca perfil pela slug
      const { data: p } = await supabase.from("profiles").select("*").eq("loja_online_slug", slug).maybeSingle()
      setProfile(p);
      // Busca produtos do usuário (apenas exemplo, refine para online depois)
      if (p?.id) {
        const { data: prods } = await supabase.from("produtos").select("*").eq("user_id", p.id)
        setProdutos(prods || []);
      }
      setLoading(false);
    }
    if (slug) load()
  }, [slug]);

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!profile) return <div className="p-8">Loja não encontrada.</div>;
  if (!profile.loja_online_ativa) return <div className="p-8">Loja offline.</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold">{profile.store_name}</h1>
      <div className="mb-4 text-muted-foreground">{profile.loja_online_descricao || ""}</div>
      <div className="grid gap-4">
        {produtos.map(prod => (
          <div key={prod.id} className="border rounded-md p-3 flex flex-col">
            <span className="font-semibold">{prod.nome}</span>
            <span className="text-muted-foreground">R$ {Number(prod.valor).toFixed(2)}</span>
            {/* Formatação futura para adicionar ao carrinho */}
          </div>
        ))}
      </div>
    </div>
  );
}
