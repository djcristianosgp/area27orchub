import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { Button, Input, Alert } from '@components/ui';
import { Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setLocalError(err.response?.data?.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-accent-600 to-primary-800 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  OH
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white text-center">OrçHub</h1>
            <p className="text-primary-100 text-center mt-2 text-sm">
              Orçamentos Virtuais & Marketplace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {(error || localError) && (
              <Alert
                variant="danger"
                title="Erro no Login"
                message={error || localError}
                closable={true}
                onClose={() => {
                  setLocalError('');
                }}
              />
            )}

            <Input
              type="email"
              label="Email"
              icon={<Mail className="h-5 w-5" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={isLoading}
            />

            <Input
              type="password"
              label="Senha"
              icon={<Lock className="h-5 w-5" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="border-t border-secondary-200 pt-6">
              <p className="text-center text-secondary-600 text-sm">
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  Criar conta agora
                </button>
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-secondary-50 px-8 py-4 border-t border-secondary-200 text-center">
            <p className="text-xs text-secondary-500">
              Ao fazer login, você concorda com nossos termos de uso
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
