import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, LogOut, ChevronRight, User, Sparkles } from 'lucide-react';

const ROLES = { engenheiro: 'Engenheiro Civil', consultor: 'Consultor de Obras', incorporador: 'Incorporador', mestre: 'Mestre de Obras', arquiteto: 'Arquiteto', outro: 'Outro' };
const GOALS = { clientes: 'Atrair clientes', autoridade: 'Ganhar autoridade', seguidores: 'Crescer seguidores', marca: 'Construir minha marca' };
const PLATFORMS = { instagram: 'Instagram', tiktok: 'TikTok', ambas: 'Instagram + TikTok' };

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const p = localStorage.getItem('obras_profile');
    if (p) setProfile(JSON.parse(p));
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const resetOnboarding = () => {
    localStorage.removeItem('obras_profile');
    navigate('/onboarding');
  };

  const rows = profile ? [
    { label: 'Nome', value: profile.name },
    { label: 'Profissão', value: ROLES[profile.role] || profile.role },
    { label: 'Objetivo', value: GOALS[profile.goal] || profile.goal },
    { label: 'Plataforma', value: PLATFORMS[profile.platform] || profile.platform },
  ] : [];

  return (
    <div className="p-4 pb-8 fade-up">
      <div className="flex items-center gap-3 pt-4 mb-8">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
          <ChevronLeft size={18} style={{ color: 'var(--label)' }} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--label)', letterSpacing: '-0.3px' }}>Perfil</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--bg3)' }}>
          <User size={36} style={{ color: 'var(--label2)' }} />
        </div>
        <p className="text-xl font-bold" style={{ color: 'var(--label)' }}>{profile?.name || 'Usuário'}</p>
        <p className="text-sm mt-0.5" style={{ color: 'var(--label2)' }}>{user?.email}</p>
      </div>

      {/* Info */}
      {rows.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider px-1 mb-2" style={{ color: 'var(--label3)' }}>Seu perfil</p>
          <div className="list-group">
            {rows.map(row => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm" style={{ color: 'var(--label2)' }}>{row.label}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--label)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ferramentas IA */}
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider px-1 mb-2" style={{ color: 'var(--label3)' }}>Ferramentas IA</p>
        <div className="list-group">
          <button onClick={() => navigate('/bio')} className="w-full flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Sparkles size={16} style={{ color: 'var(--orange)' }} />
              <span className="text-sm" style={{ color: 'var(--label)' }}>Gerar bio para Instagram/TikTok</span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--label3)' }} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider px-1 mb-2" style={{ color: 'var(--label3)' }}>Configurações</p>
        <div className="list-group">
          <button onClick={resetOnboarding} className="w-full flex items-center justify-between px-4 py-3.5">
            <span className="text-sm" style={{ color: 'var(--label)' }}>Refazer configuração inicial</span>
            <ChevronRight size={16} style={{ color: 'var(--label3)' }} />
          </button>
        </div>
      </div>

      <div className="list-group">
        <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-3.5">
          <span className="text-sm font-medium" style={{ color: '#FF453A' }}>Sair da conta</span>
          <LogOut size={16} style={{ color: '#FF453A' }} />
        </button>
      </div>

      <p className="text-center text-xs mt-8" style={{ color: 'var(--label3)' }}>ObrasContent v1.0</p>
    </div>
  );
}
