import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Store, Upload, ArrowLeft, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import type { Profile } from '../types/database';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageContainer } from '@/components/layouts/PageContainer';
import { Section } from '@/components/layouts/Section';
import MercadoPagoConfigPanel from "@/components/settings/MercadoPagoConfigPanel";

export default function StoreSettings() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [printSize, setPrintSize] = useState<'80mm' | '58mm'>('80mm');
  const [descricao, setDescricao] = useState('');
  const [mensagemPublica, setMensagemPublica] = useState('');
  const [slug, setSlug] = useState('');
  const [horario, setHorario] = useState('');
  const [lojaOnlineAtiva, setLojaOnlineAtiva] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setStoreName(data.store_name || '');
        setAvatarUrl(data.avatar_url);
        if (data.print_size) {
          setPrintSize(data.print_size);
        }
        setDescricao(data.loja_online_descricao || '');
        setMensagemPublica(data.loja_online_mensagem_publica || '');
        setSlug(data.loja_online_slug || '');
        setHorario(data.loja_online_horario || '');
        setLojaOnlineAtiva(!!data.loja_online_ativa);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar dados da loja');
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const updates: any = {
        id: session.user.id,
        store_name: storeName,
        avatar_url: avatarUrl,
        print_size: printSize,
        updated_at: new Date().toISOString(),
        loja_online_descricao: descricao,
        loja_online_mensagem_publica: mensagemPublica,
        loja_online_slug: slug,
        loja_online_horario: horario,
        loja_online_ativa: lojaOnlineAtiva,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id);

      if (error) throw error;

      toast.success('Dados da loja atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar dados da loja');
    } finally {
      setLoading(false);
      getProfile();
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autorizado');

      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');

      if (!avatarBucketExists) {
        await supabase.storage.createBucket('avatars', {
          public: true,
        });
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (data) {
        setAvatarUrl(data.publicUrl);
        toast.success('Logo enviado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao enviar avatar:', error);
      toast.error('Erro ao enviar logo. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-extrabold text-foreground">
                Configurações da Loja
              </h1>
              <p className="mt-2 text-muted-foreground">
                Personalize o nome e a logo da sua loja
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </button>
          </motion.div>

          <Section>
            {loading && !profile ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col items-center">
                  <div className="mb-4 h-32 w-32 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Logo da loja"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store size={64} className="text-muted-foreground" />
                    )}
                  </div>
                  <label
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-primary-foreground transition-colors duration-200 ${
                      uploading
                        ? 'bg-muted cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90 cursor-pointer'
                    }`}
                  >
                    <Upload size={18} />
                    {uploading ? 'Enviando...' : 'Enviar Logo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="store-name"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Nome da Loja
                  </label>
                  <input
                    id="store-name"
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Digite o nome da sua loja"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Printer className="w-4 h-4" />
                    Tamanho da Impressão
                  </label>
                  <Select
                    value={printSize}
                    onValueChange={(value: '80mm' | '58mm') => setPrintSize(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tamanho da impressão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="80mm">80mm (Padrão)</SelectItem>
                      <SelectItem value="58mm">58mm (Compacto)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Escolha o tamanho do papel da sua impressora térmica
                  </p>
                </div>

                {/* Campos extras para configuração da loja online */}
                <div>
                  <label
                    htmlFor="loja-online-ativa"
                    className="flex items-center gap-2 mb-2 text-sm font-medium text-foreground"
                  >
                    <input
                      id="loja-online-ativa"
                      type="checkbox"
                      checked={lojaOnlineAtiva}
                      onChange={(e) => setLojaOnlineAtiva(e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    Ativar loja online
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Slug da loja pública (Endereço da página)
                  </label>
                  <div className="flex gap-2">
                    <span className="py-2 px-2 text-muted-foreground rounded-l bg-muted min-w-[100px]">{window.location.origin}/loja/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={e => setSlug(e.target.value.replace(/[^\w\-]/g, '').toLowerCase())}
                      placeholder="ex: minha-loja"
                      className="flex-1 px-3 py-2 border border-input rounded-r bg-background"
                      maxLength={32}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Link público da loja:{" "}
                    <a 
                      className="underline text-primary" 
                      target="_blank" 
                      rel="noopener"
                      href={slug ? `/loja/${slug}` : "#"}
                    >
                      {window.location.origin}/loja/{slug || "<slug>"}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Descrição da loja (aparece no topo da loja)
                  </label>
                  <textarea
                    rows={2}
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    placeholder="Ex: Pizzas artesanais, lanches e bebidas."
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    maxLength={128}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mensagem pública (opcional, rodapé da loja)
                  </label>
                  <input
                    type="text"
                    value={mensagemPublica}
                    onChange={e => setMensagemPublica(e.target.value)}
                    placeholder="Ex: Entregas até as 23h. Aceitamos Pix!"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    maxLength={80}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Horário de funcionamento exibido na loja (opcional)
                  </label>
                  <input
                    type="text"
                    value={horario}
                    onChange={e => setHorario(e.target.value)}
                    placeholder="Ex: Seg-Sáb 18h às 23h"
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    maxLength={64}
                  />
                </div>

                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    'Salvar Configurações'
                  )}
                </button>
              </div>
            )}
          </Section>

          {/* NOVA SEÇÃO: Atalhos de configuração */}
          <Section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🛠️</span> Gerencie sua loja
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/produtos')}
                className="bg-secondary hover:bg-secondary/90 rounded-lg px-4 py-3 flex items-center flex-col gap-2 border"
              >
                <span className="font-bold text-lg">Produtos</span>
                <span className="text-muted-foreground text-xs text-center">
                  Adicione, edite ou remova produtos do seu catálogo.
                </span>
              </button>
              <button
                onClick={() => navigate('/delivery-rates')}
                className="bg-secondary hover:bg-secondary/90 rounded-lg px-4 py-3 flex items-center flex-col gap-2 border"
              >
                <span className="font-bold text-lg">Bairros & Taxas</span>
                <span className="text-muted-foreground text-xs text-center">
                  Configure bairros atendidos e taxas de entrega.
                </span>
              </button>
            </div>
          </Section>
        </div>
      </PageContainer>

      <section className="my-8">
        <MercadoPagoConfigPanel />
      </section>
    </div>
  );
}
