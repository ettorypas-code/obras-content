import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowRight, FileText, BarChart2, Hash, Layers } from 'lucide-react';
import { getLibrary, getCalendar } from '../api';
import PotentialBadge from '../components/PotentialBadge';
import { usePostNotifications } from '../hooks/usePostNotifications';
import { SkeletonCard, SkeletonStat } from '../components/Skeleton';

function getStreak() {
  const today = new Date().toISOString().split('T')[0];
  const last = localStorage.getItem('obras_last_activity');
  let streak = parseInt(localStorage.getItem('obras_streak') || '0');
  if (!last) return streak;
  const diffDays = Math.floor((new Date(today) - new Date(last)) / 86400000);
  if (diffDays === 0) return streak;
  if (diffDays === 1) return streak; // ainda válido
  return 0; // quebrou o streak
}

function updateStreak() {
  const today = new Date().toISOString().split('T')[0];
  const last = localStorage.getItem('obras_last_activity');
  let streak = parseInt(localStorage.getItem('obras_streak') || '0');
  if (!last) {
    localStorage.setItem('obras_streak', '1');
    localStorage.setItem('obras_last_activity', today);
    return 1;
  }
  const diffDays = Math.floor((new Date(today) - new Date(last)) / 86400000);
  if (diffDays === 0) return streak;
  if (diffDays === 1) { streak++; }
  else { streak = 1; }
  localStorage.setItem('obras_streak', String(streak));
  localStorage.setItem('obras_last_activity', today);
  return streak;
}

const PILLARS = {
  educativo: { label: 'Educativo', color: '#0A84FF' },
  autoridade: { label: 'Autoridade', color: '#BF5AF2' },
  bastidores: { label: 'Bastidores', color: '#FF9F0A' },
  opiniao: { label: 'Opinião', color: '#FF453A' }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [library, setLibrary] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingLib, setLoadingLib] = useState(true);
  const [loadingEv, setLoadingEv] = useState(true);
  const profile = JSON.parse(localStorage.getItem('obras_profile') || '{}');
  const streak = getStreak();
  usePostNotifications();

  useEffect(() => {
    updateStreak();
    getLibrary()
      .then(r => setLibrary(r.data.slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoadingLib(false));
    getCalendar()
      .then(r => setEvents(r.data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoadingEv(false));
  }, []);

  const now = new Date();
  const thisMonth = library.filter(i => {
    const d = new Date(i.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const weekEvents = events.filter(e => {
    const d = new Date(e.date + 'T12:00:00');
    const diff = (d - now) / 86400000;
    return diff >= -1 && diff <= 7;
  });

  return (
    <div className="p-4 space-y-5 fade-up">
      {/* Header */}
      <div className="pt-6 flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--label2)' }}>Olá, {profile.name || 'bem-vindo'} 👋</p>
          <h1 className="text-3xl font-bold mt-0.5 tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>ObrasContent</h1>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'var(--bg3)' }}>
            🏗️
          </div>
          {streak > 1 && (
            <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--orange)' }}>🔥{streak}d</p>
          )}
        </div>
      </div>

      {/* CTA */}
      <button onClick={() => navigate('/upload')}
        className="w-full flex items-center gap-4 p-5 rounded-3xl text-left transition-all active:scale-[0.98]"
        style={{ background: 'var(--orange)', boxShadow: '0 4px 24px rgba(255,159,10,0.35)' }}>
        <div className="bg-black/20 rounded-2xl p-3">
          <Camera size={26} color="white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-lg text-black leading-tight">Analisar imagem</p>
          <p className="text-black/60 text-sm mt-0.5">Tire uma foto da obra</p>
        </div>
        <ArrowRight color="rgba(0,0,0,0.5)" size={20} />
      </button>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: FileText, label: 'Sem foto', desc: 'Só descreva', color: '#30D158', bg: 'rgba(48,209,88,0.15)', path: '/text' },
          { icon: BarChart2, label: 'Métricas', desc: 'Ver performance', color: '#0A84FF', bg: 'rgba(10,132,255,0.15)', path: '/metrics' },
          { icon: Hash, label: 'Hashtags', desc: 'Banco por tema', color: '#BF5AF2', bg: 'rgba(191,90,242,0.15)', path: '/hashtags' },
          { icon: Layers, label: 'Carrossel', desc: 'Gerar slides', color: '#FF9F0A', bg: 'rgba(255,159,10,0.15)', path: '/carousel' },
        ].map(({ icon: Icon, label, desc, color, bg, path }) => (
          <button key={path} onClick={() => navigate(path)}
            className="flex items-center gap-3 p-4 rounded-3xl text-left transition-all active:scale-[0.97]"
            style={{ background: 'var(--bg2)', border: '1.5px solid var(--bg4)' }}>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0" style={{ background: bg }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--label)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--label3)' }}>{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {loadingLib || loadingEv ? (
          [0,1,2].map(i => <SkeletonStat key={i} />)
        ) : (
          [
            { label: 'Total gerados', value: library.length, icon: '✦', color: '#BF5AF2' },
            { label: 'Este mês', value: thisMonth, icon: '◆', color: '#0A84FF' },
            { label: 'Esta semana', value: weekEvents.length, icon: '●', color: '#30D158' },
          ].map(s => (
            <div key={s.label} className="card py-3">
              <p className="text-lg mb-0.5" style={{ color: s.color }}>{s.icon}</p>
              <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--label)' }}>{s.value}</p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'var(--label2)' }}>{s.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Esta semana */}
      {weekEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="font-semibold" style={{ color: 'var(--label)' }}>Esta semana</p>
            <button onClick={() => navigate('/calendar')} className="text-sm font-medium" style={{ color: 'var(--orange)' }}>Ver tudo</button>
          </div>
          <div className="list-group">
            {weekEvents.map(ev => {
              const pillar = PILLARS[ev.pillar] || PILLARS.educativo;
              const statusColor = ev.status === 'publicado' ? '#30D158' : ev.status === 'rascunho' ? '#FF9F0A' : 'var(--label3)';
              return (
                <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="text-center w-10">
                    <p className="text-[10px] uppercase" style={{ color: 'var(--label3)' }}>
                      {new Date(ev.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </p>
                    <p className="text-lg font-bold leading-none" style={{ color: 'var(--label)' }}>
                      {new Date(ev.date + 'T12:00:00').getDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--label)' }}>{ev.title || 'Post'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-medium" style={{ color: pillar.color }}>{pillar.label}</span>
                      <span className="text-xs" style={{ color: statusColor }}>● {ev.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Últimos gerados */}
      {loadingLib ? (
        <SkeletonCard />
      ) : library.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="font-semibold" style={{ color: 'var(--label)' }}>Últimos gerados</p>
            <button onClick={() => navigate('/library')} className="text-sm font-medium" style={{ color: 'var(--orange)' }}>Ver todos</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {library.map(item => (
              <div key={item.id} onClick={() => navigate('/result', { state: { result: item, fromLibrary: true } })}
                className="min-w-[130px] cursor-pointer active:scale-95 transition-transform">
                <div className="w-[130px] h-[96px] rounded-2xl overflow-hidden relative" style={{ background: 'var(--bg3)' }}>
                  {item.image_url
                    ? <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">📝</div>
                  }
                  <div className="absolute bottom-2 left-2">
                    <PotentialBadge value={item.potential} showLabel={false} />
                  </div>
                </div>
                <p className="text-xs mt-1.5 px-0.5 line-clamp-2 leading-snug" style={{ color: 'var(--label2)' }}>
                  {item.context?.slice(0, 50)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">📸</p>
          <p className="font-semibold" style={{ color: 'var(--label)' }}>Nenhum conteúdo ainda</p>
          <p className="text-sm mt-1" style={{ color: 'var(--label2)' }}>Envie sua primeira foto de obra</p>
        </div>
      )}
    </div>
  );
}
