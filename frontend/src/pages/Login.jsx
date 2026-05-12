import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

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
    setError(''); setSuccess(''); setLoading(true);
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
        'Password should be at least 6 characters': 'Senha precisa ter pelo menos 6 caracteres.'
      };
      setError(msgs[err.message] || 'Algo deu errado. Tente novamente.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🏗️</div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>ObrasContent</h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--label2)' }}>Conteúdo para construção civil</p>
        </div>

        {/* Segmented control */}
        <div className="flex p-1 rounded-xl mb-6" style={{ background: 'var(--bg3)' }}>
          {[{ id: 'login', label: 'Entrar' }, { id: 'register', label: 'Criar conta' }].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setError(''); setSuccess(''); }}
              className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
              style={{
                background: tab === t.id ? 'var(--bg2)' : 'transparent',
                color: tab === t.id ? 'var(--label)' : 'var(--label2)',
                boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.4)' : 'none'
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="list-group">
            <div className="relative px-4 py-1">
              <div className="flex items-center gap-3">
                <Mail size={16} style={{ color: 'var(--label3)' }} className="shrink-0" />
                <input type="email" required className="input" style={{ background: 'transparent', padding: '12px 0', borderRadius: 0, border: 'none', fontSize: '15px' }}
                  placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="relative px-4 py-1">
              <div className="flex items-center gap-3">
                <Lock size={16} style={{ color: 'var(--label3)' }} className="shrink-0" />
                <input type={showPass ? 'text' : 'password'} required minLength={6}
                  className="input flex-1" style={{ background: 'transparent', padding: '12px 0', borderRadius: 0, border: 'none', fontSize: '15px' }}
                  placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ color: 'var(--label3)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,69,58,0.15)', color: '#FF453A' }}>
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(48,209,88,0.15)', color: '#30D158' }}>
              {success}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Aguarde...</> : tab === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--label3)' }}>
          Seus dados são protegidos e nunca compartilhados.
        </p>
      </div>
    </div>
  );
}
