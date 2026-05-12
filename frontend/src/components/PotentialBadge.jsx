const config = {
  alto:  { label: 'Alto', bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400', flame: '🔥' },
  medio: { label: 'Médio', bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400', flame: '🟡' },
  baixo: { label: 'Baixo', bg: 'bg-stone-700/60', text: 'text-stone-400', dot: 'bg-stone-400', flame: '⚪' }
};

export default function PotentialBadge({ value, showLabel = true }) {
  const c = config[value] || config.medio;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {showLabel && `${c.flame} Potencial ${c.label}`}
    </span>
  );
}
