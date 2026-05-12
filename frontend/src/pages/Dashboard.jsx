import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowRight, Flame, CalendarDays } from 'lucide-react';
import { getLibrary, getCalendar } from '../api';
import PotentialBadge from '../components/PotentialBadge';

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
  const profile = JSON.parse(localStorage.getItem('obras_profile') || '{}');

  useEffect(() => {
    getLibrary().then(r => setLibrary(r.data.slice(0, 4))).catch(() => {});
    getCalendar().then(r => setEvents(r.data.slice(0, 4))).catch(() => {});
  }, []);

  const weekEvents = events.filter(e => {
    const d = new Date(e.date + 'T12:00:00');
    const now = new Date();
    return (d - now) / 86400000 >= -1 && (d - now) / 86400000 <= 7;
  });

  return (
    <div className="p-4 space-y-6 fade-up">
      {/* Header */}
      <div className="pt-6 flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--label2)' }}>Olá, {profile.name || 'bem-vindo'} 👋</p>
          <h1 className="text-3xl font-bold mt-0.5 tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>ObrasContent</h1>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'var(--bg3)' }}>
          🏗️
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Conteúdos gerados', value: library.length, icon: '✦', color: '#BF5AF2' },
          { label: 'Posts esta semana', value: weekEvents.length, icon: '◆', color: '#0A84FF' }
        ].map(s => (
          <div key={s.label} className="card">
            <p className="text-2xl mb-1" style={{ color: s.color }}>{s.icon}</p>
            <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--label)' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--label2)' }}>{s.label}</p>
          </div>
        ))}
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
      {library.length > 0 && (
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
                  <img src={item.image_url} alt="" className="w-full h-full object-cover" />
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
      )}

      {library.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">📸</p>
          <p className="font-semibold" style={{ color: 'var(--label)' }}>Nenhum conteúdo ainda</p>
          <p className="text-sm mt-1" style={{ color: 'var(--label2)' }}>Envie sua primeira foto de obra</p>
        </div>
      )}
    </div>
  );
}
