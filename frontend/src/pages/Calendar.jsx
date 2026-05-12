import { useEffect, useState } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { getCalendar, createEvent, updateEvent, deleteEvent } from '../api';

const PILLARS = [
  { value: 'educativo', label: 'Educativo', color: '#0A84FF' },
  { value: 'autoridade', label: 'Autoridade', color: '#BF5AF2' },
  { value: 'bastidores', label: 'Bastidores', color: '#FF9F0A' },
  { value: 'opiniao', label: 'Opinião', color: '#FF453A' }
];

const STATUS_NEXT = { pendente: 'rascunho', rascunho: 'publicado', publicado: 'pendente' };
const STATUS_COLOR = { pendente: 'var(--label3)', rascunho: '#FF9F0A', publicado: '#30D158' };

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
    await updateEvent(ev.id, { status: STATUS_NEXT[ev.status] });
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
    <div className="p-4 space-y-5 fade-up">
      <div className="pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>Calendário</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--label2)' }}>
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm">
          <Plus size={16} /> Agendar
        </button>
      </div>

      {/* Mini calendário semanal */}
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map(date => {
          const isToday = date.toDateString() === new Date().toDateString();
          const dayEvents = eventsForDate(date);
          return (
            <div key={date.toISOString()} className="text-center">
              <p className="text-[10px] uppercase mb-1" style={{ color: 'var(--label3)' }}>{WEEKDAYS[date.getDay()]}</p>
              <div className="rounded-xl p-1.5 min-h-[38px]" style={{
                background: isToday ? 'rgba(255,159,10,0.15)' : 'var(--bg3)',
                border: isToday ? '1.5px solid var(--orange)' : '1.5px solid transparent'
              }}>
                <p className="text-sm font-bold" style={{ color: isToday ? 'var(--orange)' : 'var(--label)' }}>
                  {date.getDate()}
                </p>
                {dayEvents.length > 0 && (
                  <div className="flex justify-center mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--orange)' }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pilares */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider px-1 mb-2" style={{ color: 'var(--label3)' }}>Pilares de conteúdo</p>
        <div className="grid grid-cols-2 gap-2">
          {PILLARS.map(p => (
            <div key={p.value} className="rounded-xl px-3 py-2 text-xs font-medium"
              style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30` }}>
              {p.label}
            </div>
          ))}
        </div>
      </div>

      {/* Lista de eventos */}
      <div>
        <p className="text-sm font-semibold px-1 mb-2" style={{ color: 'var(--label)' }}>
          Todos os posts agendados
        </p>
        {events.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-semibold" style={{ color: 'var(--label)' }}>Nenhum post agendado</p>
            <button onClick={() => setShowForm(true)} className="text-sm font-medium mt-2" style={{ color: 'var(--orange)' }}>
              Agendar primeiro post
            </button>
          </div>
        ) : (
          <div className="list-group">
            {events.map(ev => {
              const pillar = PILLARS.find(p => p.value === ev.pillar) || PILLARS[0];
              return (
                <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => toggleStatus(ev)} className="shrink-0">
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{
                        background: ev.status === 'publicado' ? '#30D158' : 'transparent',
                        borderColor: STATUS_COLOR[ev.status]
                      }}>
                      {ev.status === 'publicado' && <Check size={11} color="white" />}
                    </div>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--label)' }}>{ev.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: 'var(--label3)' }}>
                        {new Date(ev.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-xs font-medium" style={{ color: pillar.color }}>{pillar.label}</span>
                      <span className="text-xs" style={{ color: STATUS_COLOR[ev.status] }}>● {ev.status}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(ev.id)} className="p-1 transition-all active:scale-90" style={{ color: 'var(--label3)' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom sheet formulário */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowForm(false)}>
          <div
            className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-4"
            style={{ background: 'var(--bg2)', borderTop: '1px solid var(--bg4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold" style={{ color: 'var(--label)' }}>Novo post</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
                <X size={16} style={{ color: 'var(--label2)' }} />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--label2)' }}>Título do post</label>
              <input
                className="input"
                placeholder="Ex: O erro no contrapiso que custa R$3k"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--label2)' }}>Data</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>

            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--label2)' }}>Pilar</label>
              <div className="grid grid-cols-2 gap-2">
                {PILLARS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setForm({ ...form, pillar: p.value })}
                    className="rounded-xl py-2 text-sm font-medium transition-all"
                    style={{
                      background: form.pillar === p.value ? `${p.color}20` : 'var(--bg3)',
                      border: `1.5px solid ${form.pillar === p.value ? p.color : 'transparent'}`,
                      color: form.pillar === p.value ? p.color : 'var(--label2)'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--label2)' }}>Plataforma</label>
              <div className="flex p-1 rounded-xl" style={{ background: 'var(--bg3)' }}>
                {['instagram', 'tiktok'].map(p => (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, platform: p })}
                    className="flex-1 py-1.5 text-sm rounded-lg font-medium transition-all"
                    style={{
                      background: form.platform === p ? 'var(--bg4)' : 'transparent',
                      color: form.platform === p ? 'var(--label)' : 'var(--label3)'
                    }}
                  >
                    {p === 'instagram' ? '📸 Instagram' : '🎵 TikTok'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={submit}
              disabled={loading || !form.title || !form.date}
              className="btn-primary w-full"
            >
              {loading ? 'Salvando...' : 'Agendar post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
