import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, BookOpen, CalendarDays, TrendingUp, ArrowRight } from 'lucide-react';
import { getLibrary, getCalendar } from '../api';
import PotentialBadge from '../components/PotentialBadge';

const PILLARS = {
  educativo: { label: 'Educativo', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  autoridade: { label: 'Autoridade', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  bastidores: { label: 'Bastidores', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  opiniao: { label: 'Opinião', color: 'text-rose-400', bg: 'bg-rose-500/10' }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [library, setLibrary] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getLibrary().then(r => setLibrary(r.data.slice(0, 3))).catch(() => {});
    getCalendar().then(r => setEvents(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const weekEvents = events.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    const diff = (d - now) / 86400000;
    return diff >= -1 && diff <= 7;
  });

  const stats = [
    { label: 'Conteúdos gerados', value: library.length, icon: TrendingUp },
    { label: 'Posts na semana', value: weekEvents.length, icon: CalendarDays }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="pt-4">
        <p className="text-stone-400 text-sm">Bem-vindo de volta 👷</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">ObrasContent</h1>
      </div>

      {/* CTA Principal */}
      <button
        onClick={() => navigate('/upload')}
        className="w-full bg-brand-500 hover:bg-brand-600 active:scale-95 transition-all rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-brand-500/20"
      >
        <div className="bg-white/20 rounded-xl p-3">
          <Camera size={28} className="text-white" />
        </div>
        <div className="text-left flex-1">
          <p className="text-white font-bold text-lg leading-tight">Analisar nova imagem</p>
          <p className="text-white/70 text-sm mt-0.5">Tire uma foto da obra e gere conteúdo</p>
        </div>
        <ArrowRight className="text-white/60" size={20} />
      </button>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card">
            <Icon size={18} className="text-brand-500 mb-2" />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-stone-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Próximos posts */}
      {weekEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Esta semana</h2>
            <button onClick={() => navigate('/calendar')} className="text-brand-500 text-sm">Ver tudo</button>
          </div>
          <div className="space-y-2">
            {weekEvents.map(ev => {
              const pillar = PILLARS[ev.pillar] || PILLARS.educativo;
              const statusColor = ev.status === 'publicado' ? 'text-emerald-400' : ev.status === 'rascunho' ? 'text-yellow-400' : 'text-stone-500';
              return (
                <div key={ev.id} className="card flex items-center gap-3">
                  <div className="text-center min-w-[44px]">
                    <p className="text-xs text-stone-500 uppercase">{new Date(ev.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                    <p className="text-lg font-bold text-white leading-none">{new Date(ev.date + 'T12:00:00').getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ev.title || 'Post sem título'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pillar.bg} ${pillar.color}`}>
                        {pillar.label}
                      </span>
                      <span className={`text-xs capitalize ${statusColor}`}>● {ev.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Últimos conteúdos */}
      {library.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Últimos gerados</h2>
            <button onClick={() => navigate('/library')} className="text-brand-500 text-sm">Ver todos</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {library.map(item => (
              <div
                key={item.id}
                onClick={() => navigate('/result', { state: { result: item, fromLibrary: true } })}
                className="min-w-[140px] cursor-pointer"
              >
                <div className="w-[140px] h-[100px] rounded-xl overflow-hidden bg-stone-800 relative">
                  <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute bottom-1 right-1">
                    <PotentialBadge value={item.potential} showLabel={false} />
                  </div>
                </div>
                <p className="text-xs text-stone-400 mt-1.5 truncate">{item.context?.slice(0, 40)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {library.length === 0 && (
        <div className="card text-center py-8">
          <BookOpen size={36} className="text-stone-600 mx-auto mb-3" />
          <p className="text-stone-400 font-medium">Nenhum conteúdo ainda</p>
          <p className="text-stone-600 text-sm mt-1">Envie sua primeira foto de obra para começar</p>
        </div>
      )}
    </div>
  );
}
