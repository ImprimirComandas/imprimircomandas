import React, { useState } from 'react';
import { Eye, EyeOff, Store } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

export function Auth() {
  const { signIn, signUp, resetPassword, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    storeName: '',
  });

  // Função para formatar o telefone no padrão brasileiro (XX) XXXXX-XXXX
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return `(${cleaned}`;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formattedPhone });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (formData.password.length <= 8 && !isLogin) {
        throw new Error('A senha deve ter mais de 8 caracteres');
      }

      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (isLogin) {
        const { success, error } = await signIn(formData.email, formData.password);
        if (!success && error) throw new Error(error);
        toast.success('Login realizado com sucesso!');
      } else {
        const cleanedPhone = formData.phone.replace(/\D/g, '');
        if (cleanedPhone.length !== 11) {
          throw new Error('O telefone deve estar no formato (XX) XXXXX-XXXX');
        }

        const { success, error } = await signUp(
          formData.email,
          formData.password,
          {
            full_name: formData.fullName,
            phone: formData.phone,
            store_name: formData.storeName,
          }
        );

        if (!success && error) throw new Error(error);
        toast.success('Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Por favor, insira seu endereço de e-mail');
      return;
    }

    try {
      const { success, error } = await resetPassword(formData.email);
      if (!success && error) throw new Error(error);
      setPasswordResetSent(true);
      toast.success('Instruções para redefinir a senha foram enviadas para o seu e-mail');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    }
  };

  const isDarkTheme = theme.includes('dark');

  if (passwordResetSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full p-8 text-center transition-all duration-300">
          <Store className="mx-auto h-12 w-12 text-primary animate-pulse" />
          <h2 className="mt-6 text-2xl font-bold text-foreground">Verifique seu e-mail</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            Enviamos instruções para redefinir sua senha para{' '}
            <span className="font-semibold">{formData.email}</span>. Por favor, verifique sua caixa
            de entrada.
          </p>
          <Button
            onClick={() => setPasswordResetSent(false)}
            className="mt-6 w-full py-3"
            aria-label="Voltar para o login"
          >
            Voltar para o login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8 transition-all duration-300">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 text-primary animate-pulse" />
          <h2 className="mt-6 text-3xl font-bold text-foreground tracking-tight">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin ? 'Entre para acessar sua loja' : 'Comece agora e gerencie sua loja com facilidade'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground px-4 py-3 rounded-lg"
            role="alert"
          >
            {error}
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-foreground"
                >
                  Nome Completo
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-input rounded-lg shadow-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                  Telefone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-input rounded-lg shadow-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(XX) XXXXX-XXXX"
                  maxLength={15}
                  aria-required="true"
                />
              </div>

              <div>
                <label
                  htmlFor="storeName"
                  className="block text-sm font-medium text-foreground"
                >
                  Nome da Loja
                </label>
                <input
                  id="storeName"
                  name="storeName"
                  type="text"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-input rounded-lg shadow-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  aria-required="true"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Endereço de E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-4 py-3 border border-input rounded-lg shadow-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              aria-required="true"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Senha
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="block w-full px-4 py-3 border border-input rounded-lg shadow-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                aria-required="true"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground"
              >
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                className="mt-1 block w-full px-4 py-3 border border-input rounded-lg shadow-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                aria-required="true"
              />
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="font-medium text-primary hover:text-primary/80 transition-colors duration-200"
              onClick={() => setIsLogin(!isLogin)}
              aria-label={isLogin ? 'Ir para cadastro' : 'Ir para login'}
            >
              {isLogin ? 'Criar uma conta' : 'Já tem uma conta? Entrar'}
            </button>
            {isLogin && (
              <button
                type="button"
                className="font-medium text-primary hover:text-primary/80 transition-colors duration-200"
                onClick={handleForgotPassword}
                aria-label="Recuperar senha"
              >
                Esqueceu sua senha?
              </button>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            aria-label={isLogin ? 'Entrar na conta' : 'Criar conta'}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Processando...
              </span>
            ) : isLogin ? (
              'Entrar'
            ) : (
              'Cadastrar'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
