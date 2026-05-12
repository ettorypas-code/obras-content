import { useEffect, useState } from 'react';
import { Plus, Trash2, Check, Edit3, X } from 'lucide-react';
import { getCalendar, createEvent, updateEvent, deleteEvent } from '../api';

const PILLARS = [
  { value: 'educativo', label: 'Educativo', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'autoridade', label: 'Autoridade', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'bastidores', label: 'Bastidores', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'opiniao', label: 'Opinião', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' }
];

const STATUS_COLORS = {
  pendente: 'text-stone-400',
  rascunho: 'text-yellow-400',
  publicado: 'text-emerald-400'
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getWeekDates() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', pillar: 'educativo', platform: 'instagram', title: '' });
  const [loading, setLoading] = useState(false);
  const weekDates = getWeekDates();

  const load = () => getCalendar().then(r => setEvents(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.date || !form.title) return;
    setLoading(true);
    await createEvent(form);
    setShowForm(false);
    setForm({ date: '', pillar: 'educativo', platform: 'instagram', title: '' });
    await load();
    setLoading(false);
  };

  const toggleStatus = async (ev) => {
    const next = { pendente: 'rascunho', rascunho: 'publicado', publicado: 'pendente' };
    await updateEvent(ev.id, { status: next[ev.status] });
    load();
  };

  const remove = async (id) => {
    await deleteEvent(id);
    load();
  };

  const eventsForDate = (date) => {
    const key = date.toISOString().split('T')[0];
    return events.filter(e => e.date === key);
  };

  return (
    <div className="p-4 space-y-5">
      <div className="pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendário</h1>
          <p className="text-stone-400 text-sm mt-0.5">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm">
          <Plus size={16} /> Agendar
        </button>
      </div>

      {/* Semana atual */}
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map(date => {
          const isToday = date.toDateString() === new Date().toDateString();
          const dayEvents = eventsForDate(date);
          return (
            <div key={date.toISOString()} className="text-center">
              <p className="text-xs text-stone-500 mb-1">{WEEKDAYS[date.getDay()]}</p>
              <div className={`rounded-lg p-1.5 min-h-[36px] ${isToday ? 'bg-brand-500/20 border border-brand-500/40' : 'bg-stone-800/40'}`}>
                <p className={`text-sm font-semibold ${isToday ? 'text-brand-400' : 'text-white'}`}>{date.getDate()}</p>
                {dayEvents.length > 0 && (
                  <div className="flex justify-center mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pilares de conteúdo */}
      <div>
        <p className="text-xs text-stone-500 font-medium mb-2 uppercase tracking-wide">Pilares</p>
        <div className="grid grid-cols-2 gap-2">
          {PILLARS.map(p => (
            <div key={p.value} className={`border rounded-xl px-3 py-2 text-xs font-medium ${p.color}`}>
              {p.label}
            </div>
          ))}
        </div>
      </div>

      {/* Lista de eventos */}
      <div>
        <p className="text-sm font-semibold text-white mb-3">Todos os posts agendados</p>
        {events.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-stone-500">Nenhum post agendado ainda.</p>
            <button onClick={() => setShowForm(true)} className="text-brand-500 text-sm mt-2">Agendar primeiro post</button>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map(ev => {
              const pillar = PILLARS.find(p => p.value === ev.pillar) || PILLARS[0];
              return (
                <div key={ev.id} className="card flex items-center gap-3">
                  <button onClick={() => toggleStatus(ev)} className="shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      ev.status === 'publicado' ? 'bg-emerald-500 border-emerald-500' :
                      ev.status === 'rascunho' ? 'border-yellow-400' : 'border-stone-600'
                    }`}>
                      {ev.status === 'publicado' && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{ev.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-stone-500">
                        {new Date(ev.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className={`text-xs border rounded-full px-2 py-0.5 ${pillar.color}`}>{pillar.label}</span>
                      <span className={`text-xs capitalize ${STATUS_COLORS[ev.status]}`}>● {ev.status}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(ev.id)} className="text-stone-600 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end" onClick={() => setShowForm(false)}>
          <div className="bg-stone-900 border border-stone-700 rounded-t-3xl p-6 w-full max-w-lg mx-auto space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Novo post</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-stone-400" /></button>
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Título do post</label>
              <input
                className="input"
                placeholder="Ex: O erro no contrapiso que custa R$3k"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Data</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Pilar</label>
              <div className="grid grid-cols-2 gap-2">
                {PILLARS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setForm({ ...form, pillar: p.value })}
                    className={`border rounded-xl py-2 text-sm font-medium transition-colors ${
                      form.pillar === p.value ? p.color : 'border-stone-700 text-stone-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Plataforma</label>
              <div className="flex gap-2">
                {['instagram', 'tiktok'].map(p => (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, platform: p })}
                    className={`flex-1 py-2 text-sm rounded-xl font-medium border transition-colors capitalize ${
                      form.platform === p ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-stone-700 text-stone-400'
                    }`}
                  >
                    {p === 'instagram' ? '📸 Instagram' : '🎵 TikTok'}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={submit} disabled={loading || !form.title || !form.date} className="btn-primary w-full">
              {loading ? 'Salvando...' : 'Agendar post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
