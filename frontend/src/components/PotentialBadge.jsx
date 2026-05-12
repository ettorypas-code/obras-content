const config = {
  alto:  { label: 'Alto potencial', color: '#30D158', bg: 'rgba(48,209,88,0.12)' },
  medio: { label: 'Médio potencial', color: '#FF9F0A', bg: 'rgba(255,159,10,0.12)' },
  baixo: { label: 'Baixo potencial', color: '#8E8E93', bg: 'rgba(142,142,147,0.12)' }
};

export default function PotentialBadge({ value, showLabel = true }) {
  const c = config[value] || config.medio;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
      {showLabel && c.label}
    </span>
  );
}
