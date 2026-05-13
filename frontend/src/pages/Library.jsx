import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Search, BarChart2, X, Check } from 'lucide-react';
import { getLibrary, deleteContent, saveMetrics } from '../api';
import PotentialBadge from '../components/PotentialBadge';

const FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'alto', label: '🔥 Alto' },
  { value: 'medio', label: '🟡 Médio' },
  { value: 'baixo', label: '⚪ Baixo' }
];

function MetricsModal({ item, onClose }) {
  const storageKey = `metrics_${item.id}`;
  const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
  const [form, setForm] = useState({ views: saved.views || '', likes: saved.likes || '', comments: saved.comments || '', saves: saved.saves || '' });
  const [done, setDone] = useState(false);

  const submit = async () => {
    const data = { views: +form.views || 0, likes: +form.likes || 0, comments: +form.comments || 0, saves: +form.saves || 0, platform: 'instagram', posted_at: new Date().toISOString() };
    localStorage.setItem(storageKey, JSON.stringify(data));
    try { await saveMetrics(item.id, data); } catch {}
    setDone(true);
    setTimeout(onClose, 1200);
  };

  const fields = [
    { key: 'views', label: 'Visualizações', emoji: '👁️' },
    { key: 'likes', label: 'Curtidas', emoji: '❤️' },
    { key: 'comments', label: 'Comentários', emoji: '💬' },
    { key: 'saves', label: 'Salvamentos', emoji: '🔖' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-4 overflow-y-auto"
        style={{ background: 'var(--bg2)', borderTop: '1px solid var(--bg4)', maxHeight: '85vh', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: 'var(--label)' }}>Registrar métricas</h2>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
            <X size={16} style={{ color: 'var(--label2)' }} />
          </button>
        </div>

        <p className="text-sm line-clamp-1" style={{ color: 'var(--label2)' }}>{item.context}</p>

        <div className="grid grid-cols-2 gap-3">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: 'var(--label2)' }}>
                <span>{f.emoji}</span> {f.label}
              </label>
              <input
                type="number"
                className="input text-center"
                placeholder="0"
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <button onClick={submit} disabled={done} className="btn-primary w-full flex items-center justify-center gap-2">
          {done ? <><Check size={16} /> Salvo!</> : 'Salvar métricas'}
        </button>
      </div>
    </div>
  );
}

export default function Library() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('todos');
  const [search, setSearch] = useState('');
  const [metricsItem, setMetricsItem] = useState(null);

  const load = () => getLibrary().then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const remove = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Remover este conteúdo?')) return;
    await deleteContent(id);
    load();
  };

  const filtered = items.filter(item => {
    const matchPotential = filter === 'todos' || item.potential === filter;
    const matchSearch = !search || item.context?.toLowerCase().includes(search.toLowerCase());
    return matchPotential && matchSearch;
  });

  return (
    <div className="p-4 space-y-4 fade-up">
      <div className="pt-4">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>Biblioteca</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--label2)' }}>
          {items.length} conteúdo{items.length !== 1 ? 's' : ''} gerado{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--label3)' }} />
        <input className="input pl-9" placeholder="Buscar conteúdo..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className="whitespace-nowrap text-sm px-4 py-1.5 rounded-full font-medium transition-all"
            style={{ background: filter === f.value ? 'var(--orange)' : 'var(--bg3)', color: filter === f.value ? 'black' : 'var(--label2)' }}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-semibold" style={{ color: 'var(--label)' }}>
            {items.length === 0 ? 'Nenhum conteúdo ainda' : 'Nenhum resultado'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--label2)' }}>
            {items.length === 0 ? 'Envie sua primeira foto de obra' : 'Tente outro filtro'}
          </p>
          {items.length === 0 && (
            <button onClick={() => navigate('/upload')} className="btn-primary mt-4">Gerar primeiro conteúdo</button>
          )}
        </div>
      ) : (
        <div className="list-group">
          {filtered.map(item => {
            const ideas = Array.isArray(item.ideas) ? item.ideas : JSON.parse(item.ideas || '[]');
            const hasMetrics = !!localStorage.getItem(`metrics_${item.id}`);
            return (
              <div key={item.id} onClick={() => navigate('/result', { state: { result: item, fromLibrary: true } })}
                className="flex gap-3 px-4 py-3 cursor-pointer transition-all active:scale-[0.99]">
                {item.image_url
                  ? <img src={item.image_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  : <div className="w-16 h-16 rounded-xl shrink-0 flex items-center justify-center text-2xl"
                      style={{ background: 'var(--bg3)' }}>📝</div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: 'var(--label)' }}>
                      {ideas[0]?.title || item.context}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={e => { e.stopPropagation(); setMetricsItem(item); }}
                        className="p-1 transition-all active:scale-90"
                        style={{ color: hasMetrics ? '#30D158' : 'var(--label3)' }}>
                        <BarChart2 size={14} />
                      </button>
                      <button onClick={e => remove(item.id, e)} className="p-1 transition-all active:scale-90" style={{ color: 'var(--label3)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--label3)' }}>{item.context}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <PotentialBadge value={item.potential} />
                    <span className="text-xs" style={{ color: 'var(--label3)' }}>
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    {hasMetrics && <span className="text-xs" style={{ color: '#30D158' }}>● métricas</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {metricsItem && <MetricsModal item={metricsItem} onClose={() => setMetricsItem(null)} />}
    </div>
  );
}
