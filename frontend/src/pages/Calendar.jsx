import { useEffect, useState } from 'react';
import { Plus, Trash2, Check, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { getCalendar, createEvent, updateEvent, deleteEvent } from '../api';

const PILLARS = [
  { value: 'educativo', label: 'Educativo', color: '#0A84FF' },
  { value: 'autoridade', label: 'Autoridade', color: '#BF5AF2' },
  { value: 'bastidores', label: 'Bastidores', color: '#FF9F0A' },
  { value: 'opiniao', label: 'Opinião', color: '#FF453A' }
];

const STATUS_NEXT = { pendente: 'rascunho', rascunho: 'publicado', publicado: 'pendente' };
const STATUS_COLOR = { pendente: 'var(--label3)', rascunho: '#FF9F0A', publicado: '#30D158' };
const WEEKDAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function getMonthDates(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function exportICS(events) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ObrasContent//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  events.forEach(ev => {
    const d = ev.date.replace(/-/g, '');
    lines.push('BEGIN:VEVENT');
    lines.push(`DTSTART;VALUE=DATE:${d}`);
    lines.push(`DTEND;VALUE=DATE:${d}`);
    lines.push(`SUMMARY:${ev.title || 'Post'}`);
    lines.push(`DESCRIPTION:${ev.pillar || ''} - ${ev.platform || ''} - ${ev.status || ''}`);
    lines.push(`UID:obras-${ev.id}`);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'obrescontent-calendario.ics';
  a.click();
  URL.revokeObjectURL(url);
}

export default function Calendar() {
  const today = new Date();
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month'); // 'month' | 'list'
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', pillar: 'educativo', platform: 'instagram', title: '', series: '', episode: '' });
  const [loading, setLoading] = useState(false);

  const load = () => getCalendar().then(r => setEvents(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.date || !form.title) return;
    setLoading(true);
    await createEvent(form);
    setShowForm(false);
    setForm({ date: '', pillar: 'educativo', platform: 'instagram', title: '', series: '', episode: '' });
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
    if (!date) return [];
    const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    return events.filter(e => e.date === key);
  };

  const monthDates = getMonthDates(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : [];

  const openFormForDate = (date) => {
    const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    setForm(f => ({ ...f, date: key }));
    setShowForm(true);
  };

  return (
    <div className="p-4 space-y-4 fade-up">
      {/* Header */}
      <div className="pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>Calendário</h1>
        </div>
        <div className="flex items-center gap-2">
          {events.length > 0 && (
            <button onClick={() => exportICS(events)}
              className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}
              title="Exportar para Google Calendar">
              <Download size={16} style={{ color: 'var(--label2)' }} />
            </button>
          )}
          <div className="flex p-1 rounded-xl" style={{ background: 'var(--bg3)' }}>
            {['month', 'list'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: view === v ? 'var(--bg4)' : 'transparent',
                  color: view === v ? 'var(--label)' : 'var(--label3)'
                }}>
                {v === 'month' ? 'Mês' : 'Lista'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1 px-3 py-2 text-sm">
            <Plus size={15} /> Novo
          </button>
        </div>
      </div>

      {/* Month view */}
      {view === 'month' && (
        <div className="space-y-3">
          {/* Nav mês */}
          <div className="flex items-center justify-between">
            <button onClick={() => {
              if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
              else setCurrentMonth(m => m - 1);
            }} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
              <ChevronLeft size={16} style={{ color: 'var(--label)' }} />
            </button>
            <p className="font-semibold capitalize" style={{ color: 'var(--label)' }}>{monthName}</p>
            <button onClick={() => {
              if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
              else setCurrentMonth(m => m + 1);
            }} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
              <ChevronRight size={16} style={{ color: 'var(--label)' }} />
            </button>
          </div>

          {/* Grid cabeçalho */}
          <div className="grid grid-cols-7 gap-px">
            {WEEKDAYS_SHORT.map((d, i) => (
              <div key={i} className="text-center py-1">
                <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--label3)' }}>{d}</span>
              </div>
            ))}
          </div>

          {/* Grid dias */}
          <div className="grid grid-cols-7 gap-1">
            {monthDates.map((date, i) => {
              if (!date) return <div key={i} />;
              const isToday = date.toDateString() === today.toDateString();
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              const dayEvts = eventsForDate(date);
              return (
                <button key={i} onClick={() => setSelectedDate(isSelected ? null : date)}
                  className="aspect-square rounded-xl flex flex-col items-center justify-start pt-1.5 transition-all active:scale-95"
                  style={{
                    background: isSelected ? 'rgba(255,159,10,0.2)' : isToday ? 'rgba(255,159,10,0.1)' : 'var(--bg2)',
                    border: `1.5px solid ${isSelected ? 'var(--orange)' : isToday ? 'rgba(255,159,10,0.5)' : 'transparent'}`
                  }}>
                  <span className="text-xs font-semibold leading-none"
                    style={{ color: isToday ? 'var(--orange)' : 'var(--label)' }}>
                    {date.getDate()}
                  </span>
                  {dayEvts.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayEvts.slice(0, 3).map((ev, j) => {
                        const p = PILLARS.find(p => p.value === ev.pillar);
                        return <span key={j} className="w-1.5 h-1.5 rounded-full"
                          style={{ background: p?.color || 'var(--orange)' }} />;
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Eventos do dia selecionado */}
          {selectedDate && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--label)' }}>
                  {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </p>
                <button onClick={() => openFormForDate(selectedDate)}
                  className="text-xs font-medium" style={{ color: 'var(--orange)' }}>+ Adicionar</button>
              </div>
              {selectedEvents.length === 0 ? (
                <div className="card text-center py-6">
                  <p className="text-sm" style={{ color: 'var(--label3)' }}>Nenhum post neste dia</p>
                </div>
              ) : (
                <div className="list-group">
                  {selectedEvents.map(ev => {
                    const pillar = PILLARS.find(p => p.value === ev.pillar) || PILLARS[0];
                    return (
                      <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                        <button onClick={() => toggleStatus(ev)} className="shrink-0">
                          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            style={{ background: ev.status === 'publicado' ? '#30D158' : 'transparent', borderColor: STATUS_COLOR[ev.status] }}>
                            {ev.status === 'publicado' && <Check size={11} color="white" />}
                          </div>
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--label)' }}>{ev.title}</p>
                          <span className="text-xs font-medium" style={{ color: pillar.color }}>{pillar.label}</span>
                        </div>
                        <button onClick={() => remove(ev.id)} style={{ color: 'var(--label3)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--label)' }}>
              {events.length} post{events.length !== 1 ? 's' : ''} agendado{events.length !== 1 ? 's' : ''}
            </p>
          </div>
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
                        style={{ background: ev.status === 'publicado' ? '#30D158' : 'transparent', borderColor: STATUS_COLOR[ev.status] }}>
                        {ev.status === 'publicado' && <Check size={11} color="white" />}
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--label)' }}>{ev.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs" style={{ color: 'var(--label3)' }}>
                          {new Date(ev.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="text-xs font-medium" style={{ color: pillar.color }}>{pillar.label}</span>
                        <span className="text-xs" style={{ color: STATUS_COLOR[ev.status] }}>● {ev.status}</span>
                        {ev.series && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                            style={{ background: 'rgba(191,90,242,0.15)', color: '#BF5AF2' }}>
                            {ev.series}{ev.episode ? ` Ep.${ev.episode}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => remove(ev.id)} className="p-1" style={{ color: 'var(--label3)' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Bottom sheet formulário */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-4 overflow-y-auto"
            style={{ background: 'var(--bg2)', borderTop: '1px solid var(--bg4)', maxHeight: '85vh', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: 'var(--label)' }}>Novo post</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
                <X size={16} style={{ color: 'var(--label2)' }} />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--label2)' }}>Título do post</label>
              <input className="input" placeholder="Ex: O erro no contrapiso que custa R$3k"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--label2)' }}>Data</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--label2)' }}>Pilar</label>
              <div className="grid grid-cols-2 gap-2">
                {PILLARS.map(p => (
                  <button key={p.value} onClick={() => setForm({ ...form, pillar: p.value })}
                    className="rounded-xl py-2 text-sm font-medium transition-all"
                    style={{
                      background: form.pillar === p.value ? `${p.color}20` : 'var(--bg3)',
                      border: `1.5px solid ${form.pillar === p.value ? p.color : 'transparent'}`,
                      color: form.pillar === p.value ? p.color : 'var(--label2)'
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--label2)' }}>Plataforma</label>
              <div className="flex p-1 rounded-xl" style={{ background: 'var(--bg3)' }}>
                {['instagram', 'tiktok'].map(p => (
                  <button key={p} onClick={() => setForm({ ...form, platform: p })}
                    className="flex-1 py-1.5 text-sm rounded-lg font-medium transition-all"
                    style={{ background: form.platform === p ? 'var(--bg4)' : 'transparent', color: form.platform === p ? 'var(--label)' : 'var(--label3)' }}>
                    {p === 'instagram' ? '📸 Instagram' : '🎵 TikTok'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--label2)' }}>Série (opcional)</label>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Nome da série" value={form.series} onChange={e => setForm({ ...form, series: e.target.value })} />
                <input className="input w-20 text-center" placeholder="Ep." type="number" min="1" value={form.episode} onChange={e => setForm({ ...form, episode: e.target.value })} />
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
