import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HardHat, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSuccess('Conta criada! Verifique seu e-mail para confirmar.');
      }
    } catch (err) {
      const msgs = {
        'Invalid login credentials': 'E-mail ou senha incorretos.',
        'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
        'User already registered': 'Este e-mail já está cadastrado.',
        'Password should be at least 6 characters': 'A senha precisa ter pelo menos 6 caracteres.'
      };
      setError(msgs[err.message] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-4 inline-flex mb-4">
          <HardHat size={40} className="text-brand-500" />
        </div>
        <h1 className="text-3xl font-bold text-white">ObrasContent</h1>
        <p className="text-stone-400 mt-1.5 text-sm">Conteúdo profissional para construção civil</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm">
        {/* Tabs */}
        <div className="flex bg-stone-900 rounded-2xl p-1 mb-6 border border-stone-800">
          {[
            { id: 'login', label: 'Entrar' },
            { id: 'register', label: 'Criar conta' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-stone-400 font-medium mb-1.5 block">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="email"
                required
                className="input pl-10"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-stone-400 font-medium mb-1.5 block">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                className="input pl-10 pr-10"
                placeholder={tab === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-3">
              <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-emerald-400 text-sm">{success}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Aguarde...</>
            ) : tab === 'login' ? 'Entrar' : 'Criar minha conta'}
          </button>
        </form>

        <p className="text-center text-stone-600 text-xs mt-6">
          Seus dados são protegidos e nunca compartilhados.
        </p>
      </div>
    </div>
  );
}
