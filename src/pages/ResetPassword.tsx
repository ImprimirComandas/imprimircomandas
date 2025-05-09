
import { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';

export function ResetPassword() {
  const { updatePassword, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { isDark } = useTheme();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (password.length <= 8) {
        throw new Error('A senha deve ter mais de 8 caracteres');
      }
      
      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }

      const { success, error } = await updatePassword(password);
      
      if (!success && error) {
        throw new Error(error);
      }
      
      setSuccess(true);
      toast.success('Senha atualizada com sucesso!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-primary mb-4">
            <KeyRound className="mx-auto h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Senha Atualizada com Sucesso</h2>
          <p className="text-muted-foreground">Sua senha foi redefinida com sucesso. Agora você pode entrar com sua nova senha.</p>
          <Button
            onClick={() => window.location.href = '/'}
            className="mt-6 w-full"
          >
            Voltar para o Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center">
          <KeyRound className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">Redefinir sua senha</h2>
        </div>

        {error && (
          <div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleReset}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Nova Senha
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="block w-full px-3 py-2 border border-input bg-background rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
              Confirmar Nova Senha
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processando...' : 'Redefinir Senha'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
