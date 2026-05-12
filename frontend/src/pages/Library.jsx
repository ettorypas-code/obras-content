import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookmarkCheck, Trash2, Search, Filter } from 'lucide-react';
import { getLibrary, deleteContent } from '../api';
import PotentialBadge from '../components/PotentialBadge';

export default function Library() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('todos');
  const [search, setSearch] = useState('');

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
    <div className="p-4 space-y-4">
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-white">Biblioteca</h1>
        <p className="text-stone-400 text-sm mt-0.5">{items.length} conteúdo{items.length !== 1 ? 's' : ''} gerado{items.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
        <input
          className="input pl-9"
          placeholder="Buscar conteúdo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: 'todos', label: 'Todos' },
          { value: 'alto', label: '🔥 Alto' },
          { value: 'medio', label: '🟡 Médio' },
          { value: 'baixo', label: '⚪ Baixo' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`whitespace-nowrap text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${
              filter === f.value ? 'bg-brand-500 text-white' : 'bg-stone-800 text-stone-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <BookmarkCheck size={36} className="text-stone-600 mx-auto mb-3" />
          <p className="text-stone-400 font-medium">
            {items.length === 0 ? 'Nenhum conteúdo ainda' : 'Nenhum resultado'}
          </p>
          {items.length === 0 && (
            <button onClick={() => navigate('/upload')} className="btn-primary mt-4">
              Gerar primeiro conteúdo
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const ideas = Array.isArray(item.ideas) ? item.ideas : JSON.parse(item.ideas || '[]');
            return (
              <div
                key={item.id}
                onClick={() => navigate('/result', { state: { result: item, fromLibrary: true } })}
                className="card flex gap-3 cursor-pointer hover:border-stone-700 transition-colors active:scale-[0.99]"
              >
                <img
                  src={item.image_url}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm font-medium leading-snug line-clamp-2">
                      {ideas[0]?.title || item.context}
                    </p>
                    <button
                      onClick={(e) => remove(item.id, e)}
                      className="text-stone-600 hover:text-red-400 transition-colors shrink-0 p-0.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-stone-500 text-xs mt-1 line-clamp-1">{item.context}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <PotentialBadge value={item.potential} />
                    <span className="text-stone-600 text-xs">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
