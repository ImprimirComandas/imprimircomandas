// Página pública da loja online: catálogo, carrinho e checkout
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, DollarSign, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeOrderStatus } from "../hooks/useRealtimeOrderStatus";
import { Button } from "@/components/ui/button";

// Tipos simples
interface Produto {
  id: string;
  nome: string;
  valor: number;
}
interface BairroTaxa {
  nome: string;
  taxa: number;
}
interface MercadoPagoConfig {
  public_key: string;
  ativo: boolean;
}

export default function PublicStore() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [bairros, setBairros] = useState<BairroTaxa[]>([]);
  const [mpConf, setMpConf] = useState<MercadoPagoConfig | null>(null);

  // Carrinho
  const [cart, setCart] = useState<{ produto: Produto; quantidade: number }[]>([]);
  const [bairroSelecionado, setBairroSelecionado] = useState<BairroTaxa | null>(null);

  // Cliente
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");

  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Dados checkout
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Carrega tudo da loja no load
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // 1. Perfil via slug
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("loja_online_slug", slug)
          .maybeSingle();
        setProfile(p);

        if (p?.id) {
          // 2. Produtos cadastrados
          const { data: prods } = await supabase
            .from("produtos")
            .select("id, nome, valor")
            .eq("user_id", p.id)
            .order("nome");
          setProdutos(prods || []);

          // 3. Bairros e taxas de entrega
          const { data: bairrosDb } = await supabase
            .from("bairros_taxas")
            .select("nome, taxa")
            .eq("user_id", p.id)
            .order("nome");
          setBairros(bairrosDb || []);

          // 4. Config Mercado Pago ativa
          const { data: mp } = await supabase
            .from("mercado_pago_settings")
            .select("public_key, ativo")
            .eq("user_id", p.id)
            .eq("ativo", true)
            .maybeSingle();
          setMpConf(mp);
        }
      } catch (e) {
        toast.error("Erro ao carregar loja online.");
      }
      setLoading(false);
    }
    if (slug) load();
  }, [slug]);

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!profile) return <div className="p-8">Loja não encontrada.</div>;
  if (!profile.loja_online_ativa) return <div className="p-8">Loja offline.</div>;

  // Adicionar/remover produto carrinho
  function addToCart(produto: Produto) {
    setCart(prev => {
      const found = prev.find(x => x.produto.id === produto.id);
      if (found) {
        return prev.map(x =>
          x.produto.id === produto.id
            ? { ...x, quantidade: x.quantidade + 1 }
            : x
        );
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  }

  function removeFromCart(produto: Produto) {
    setCart(prev => {
      const found = prev.find(x => x.produto.id === produto.id);
      if (found && found.quantidade > 1) {
        return prev.map(x =>
          x.produto.id === produto.id
            ? { ...x, quantidade: x.quantidade - 1 }
            : x
        );
      }
      return prev.filter(x => x.produto.id !== produto.id);
    });
  }

  function cartTotal() {
    return cart.reduce((s, item) => s + item.produto.valor * item.quantidade, 0);
  }
  function totalComTaxa() {
    return cartTotal() + (bairroSelecionado?.taxa ?? 0);
  }

  // Track current orderId for realtime updates (set after order created)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  // New state for order status (used for instant updates)
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  // Hooks: Listen for real-time order status with Supabase Realtime
  useRealtimeOrderStatus({
    orderId: currentOrderId,
    onStatusChange: (status) => {
      setOrderStatus(status);
      // Show toast if order is approved or rejected
      if (status === "aprovado") {
        toast.success("Pedido aprovado! Seu pedido está sendo preparado.");
      }
      if (status === "recusado") {
        toast.error("Seu pedido foi recusado, entre em contato.");
      }
      if (status === "pago") {
        toast.success("Pagamento confirmado pelo Mercado Pago!");
      }
    },
  });

  // Registro de pedido e checkout Mercado Pago
  async function fazerPedidoOnline() {
    if (!bairroSelecionado) { toast.error("Selecione o bairro de entrega."); return; }
    if (!clienteNome || !clienteTelefone || !clienteEndereco) {
      toast.error("Preencha os dados do cliente!");
      return;
    }
    if (cart.length === 0) {
      toast.error("Carrinho vazio.");
      return;
    }
    setCheckoutLoading(true);
    try {
      // 1. Cria pedido na tabela online_orders
      const { data, error } = await supabase.from("online_orders").insert({
        store_id: profile.id,
        cliente_nome: clienteNome,
        cliente_email: "", // pode adicionar email no futuro
        cliente_telefone: clienteTelefone,
        cliente_endereco: clienteEndereco,
        carrinho: cart.map(x => ({
          id: x.produto.id,
          nome: x.produto.nome,
          valor: x.produto.valor,
          quantidade: x.quantidade,
        })),
        valor_total: totalComTaxa(),
        status: "aguardando_pagamento",
        pagamento_metodo: "mercado_pago",
        created_at: new Date().toISOString()
      }).select("id").maybeSingle();

      if (error || !data) throw new Error("Erro ao registrar pedido. Tente novamente.");

      setCurrentOrderId(data.id); // Track order ID for live updates

      // 2. Chama função edge criar preferência Mercado Pago (transparent checkout)
      const { data: funcData, error: funcError } = await supabase.functions.invoke("create-mercado-pago-payment", {
        body: { orderId: data.id }
      });
      if (funcError) throw new Error("Erro ao iniciar checkout com Mercado Pago");
      const mpLink = funcData?.mp?.init_point || funcData?.mp?.sandbox_init_point;
      if (!mpLink) throw new Error("Não foi possível obter link do Mercado Pago");
      setCheckoutUrl(mpLink);
      toast.success("Pedido registrado! Faça o pagamento.");
    } catch (e: any) {
      toast.error(e.message || "Erro desconhecido");
    }
    setCheckoutLoading(false);
  }

  // Exibe o status em tempo real do pedido (client view)
  function mostrarStatus() {
    if (!orderStatus) return null;
    if (orderStatus === "aguardando_pagamento") return <div className="my-3 text-yellow-600">Aguardando pagamento...</div>;
    if (orderStatus === "aprovado") return <div className="my-3 text-green-700 font-semibold">Pedido aprovado!</div>;
    if (orderStatus === "recusado") return <div className="my-3 text-red-600 font-semibold">Pedido recusado</div>;
    if (orderStatus === "pago") return <div className="my-3 text-blue-700">Pagamento confirmado!</div>;
    return <div className="my-3 text-muted-foreground">Status: {orderStatus}</div>;
  }

  if (checkoutUrl) {
    return (
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-semibold text-green-700 mb-2">Pedido criado!</h1>
        <p className="mb-4">Para concluir, realize o pagamento via Mercado Pago:</p>
        <a href={checkoutUrl} target="_blank" rel="noopener"
          className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
          Pagar agora no Mercado Pago
        </a>
        <div className="mt-8">
          <button className="underline text-blue-600" onClick={() => { setCheckoutUrl(null); setCart([]); }}>
            Novo pedido
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* Título da loja */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <ShoppingCart className="w-7 h-7 inline" />
          {profile.store_name}
        </h1>
        {profile.loja_online_descricao && (
          <p className="text-muted-foreground mt-2">{profile.loja_online_descricao}</p>
        )}
      </div>

      {/* Produtos */}
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-2">Cardápio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {produtos.map(prod => (
            <div key={prod.id} className="border rounded-md p-3 flex flex-col">
              <span className="font-semibold">{prod.nome}</span>
              <span className="text-muted-foreground">R$ {Number(prod.valor).toFixed(2)}</span>
              <div className="flex gap-2 mt-2">
                <button
                  className="px-2 py-1 rounded border bg-secondary text-sm"
                  onClick={() => addToCart(prod)}
                >Adicionar</button>
                {cart.some(x => x.produto.id === prod.id) && (
                  <>
                    <button
                      className="px-2 py-1 rounded border text-sm"
                      onClick={() => removeFromCart(prod)}
                    >-</button>
                    <span className="inline-block px-2">{cart.find(x => x.produto.id === prod.id)?.quantidade}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bairros e taxas */}
      {bairros.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-1 flex items-center"><MapPin className="w-5 h-5 mr-1" />Selecione o bairro de entrega</h2>
          <select
            className="mt-1 w-full px-3 py-2 rounded border bg-background"
            value={bairroSelecionado?.nome || ""}
            onChange={e => {
              const bairro = bairros.find(b => b.nome === e.target.value);
              setBairroSelecionado(bairro || null);
            }}
          >
            <option value="">Selecione...</option>
            {bairros.map(b => (
              <option key={b.nome} value={b.nome}>
                {b.nome} - R$ {b.taxa.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Carrinho */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold mb-2 flex items-center"><DollarSign className="w-5 h-5 mr-1" />Resumo do Pedido</h2>
        <div className="bg-muted/40 p-3 rounded">
          {cart.length === 0
            ? <span className="text-muted-foreground">Nenhum produto adicionado</span>
            : <ul>
                {cart.map(item => (
                  <li key={item.produto.id} className="flex justify-between mb-1">
                    {item.produto.nome} x{item.quantidade}
                    <span>R$ {(item.produto.valor * item.quantidade).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
          }
          <div className="mt-2 flex justify-between border-t pt-2 text-foreground">
            <span>Subtotal:</span>
            <span>R$ {cartTotal().toFixed(2)}</span>
          </div>
          {bairroSelecionado && (
            <div className="flex justify-between">
              <span>Entrega ({bairroSelecionado.nome}):</span>
              <span>R$ {bairroSelecionado.taxa.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total:</span>
            <span>R$ {totalComTaxa().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Formulário do cliente */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold mb-2">Seus Dados</h2>
        <div className="space-y-2 mb-4">
          <input
            className="w-full px-3 py-2 rounded border bg-background"
            placeholder="Nome"
            value={clienteNome}
            onChange={e => setClienteNome(e.target.value)}
            maxLength={32}
          />
          <input
            className="w-full px-3 py-2 rounded border bg-background"
            placeholder="Telefone/WhatsApp"
            value={clienteTelefone}
            onChange={e => setClienteTelefone(e.target.value)}
            maxLength={16}
          />
          <input
            className="w-full px-3 py-2 rounded border bg-background"
            placeholder="Endereço"
            value={clienteEndereco}
            onChange={e => setClienteEndereco(e.target.value)}
            maxLength={48}
          />
        </div>
      </div>

      {/* Botão de pedido e pagamento */}
      <button
        className="w-full py-3 bg-primary text-white rounded font-bold text-lg mt-2"
        disabled={cart.length === 0 || !bairroSelecionado || checkoutLoading}
        onClick={fazerPedidoOnline}
      >
        {checkoutLoading ? "Aguarde..." : "Finalizar Pedido e Pagar"}
      </button>

      {/* Formas de pagamento configuradas */}
      {mpConf && mpConf.ativo && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><img alt="Mercado Pago" src="https://www.mercadopago.com/org-img/MP3/home/logomp3.gif" className="inline w-5 h-5 rounded" />Pagamento online Mercado Pago</span>
        </div>
      )}
    </div>
  );
}
