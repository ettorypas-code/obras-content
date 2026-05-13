import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, Eye, Heart, MessageCircle, Bookmark } from 'lucide-react';
import { getAllMetrics } from '../api';

const THEME_LABELS = {
  erros: '⚠️ Erros de Obra',
  dicas: '💡 Dicas Técnicas',
  corretor: '🏠 Corretores',
  engenheiro: '📐 Engenheiro',
  custo: '💰 Custos',
  seguranca: '🦺 Segurança',
  antes_depois: '✨ Antes/Depois',
  bastidores: '🎬 Bastidores',
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `${color}20` }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <p className="text-xl font-bold leading-none" style={{ color: 'var(--label)' }}>{value.toLocaleString('pt-BR')}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--label3)' }}>{label}</p>
      </div>
    </div>
  );
}

export default function MetricsDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllMetrics()
      .then(r => setData(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Totais globais
  const totals = data.reduce((acc, item) => {
    const ms = item.content_metrics || [];
    ms.forEach(m => {
      acc.views    += m.views    || 0;
      acc.likes    += m.likes    || 0;
      acc.comments += m.comments || 0;
      acc.saves    += m.saves    || 0;
    });
    return acc;
  }, { views: 0, likes: 0, comments: 0, saves: 0 });

  // Agrupamento por tema
  const byTheme = {};
  data.forEach(item => {
    const t = item.theme || 'dicas';
    if (!byTheme[t]) byTheme[t] = { count: 0, views: 0, likes: 0 };
    byTheme[t].count++;
    (item.content_metrics || []).forEach(m => {
      byTheme[t].views += m.views || 0;
      byTheme[t].likes += m.likes || 0;
    });
  });

  const themeRanking = Object.entries(byTheme)
    .sort((a, b) => (b[1].views + b[1].likes) - (a[1].views + a[1].likes));

  const maxEngagement = Math.max(...themeRanking.map(([, v]) => v.views + v.likes), 1);

  const withMetrics = data.filter(d => (d.content_metrics || []).length > 0).length;

  return (
    <div className="p-4 space-y-5 fade-up">
      {/* Header */}
      <div className="pt-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
          <ChevronLeft size={18} style={{ color: 'var(--label)' }} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>
            Métricas
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--label2)' }}>
            {data.length} conteúdos · {withMetrics} com dados
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <p style={{ color: 'var(--label3)' }}>Carregando...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-3xl mb-3">📊</p>
          <p className="font-semibold" style={{ color: 'var(--label)' }}>Nenhum conteúdo ainda</p>
          <p className="text-sm mt-1" style={{ color: 'var(--label2)' }}>Gere e publique seu primeiro conteúdo</p>
        </div>
      ) : (
        <>
          {/* Stats globais */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--label3)' }}>
              Engajamento total
            </p>
            <div className="grid grid-cols-2 gap-2">
              <StatCard icon={Eye}           label="Visualizações" value={totals.views}    color="#0A84FF" />
              <StatCard icon={Heart}         label="Curtidas"      value={totals.likes}    color="#FF453A" />
              <StatCard icon={MessageCircle} label="Comentários"   value={totals.comments} color="#30D158" />
              <StatCard icon={Bookmark}      label="Salvos"        value={totals.saves}    color="#BF5AF2" />
            </div>
          </div>

          {/* Ranking por tema */}
          {themeRanking.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <TrendingUp size={14} color="var(--orange)" />
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--label3)' }}>
                  Temas por engajamento
                </p>
              </div>
              <div className="card space-y-4 py-4">
                {themeRanking.map(([theme, stats], i) => {
                  const engagement = stats.views + stats.likes;
                  const pct = Math.round((engagement / maxEngagement) * 100);
                  return (
                    <div key={theme}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold" style={{ color: 'var(--label3)' }}>#{i + 1}</span>
                          <span className="text-sm font-medium" style={{ color: 'var(--label)' }}>
                            {THEME_LABELS[theme] || theme}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs" style={{ color: 'var(--label3)' }}>
                            {stats.count} post{stats.count > 1 ? 's' : ''}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: 'var(--orange)' }}>
                            {engagement.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      {/* Barra de progresso */}
                      <div className="h-1.5 rounded-full" style={{ background: 'var(--bg4)' }}>
                        <div className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: i === 0 ? 'var(--orange)' : i === 1 ? '#0A84FF' : 'var(--bg3)',
                            minWidth: pct > 0 ? 8 : 0
                          }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conteúdos sem métricas */}
          {data.length - withMetrics > 0 && (
            <div className="card flex items-center gap-3 py-3"
              style={{ border: '1px solid rgba(255,159,10,0.3)', background: 'rgba(255,159,10,0.05)' }}>
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--label)' }}>
                  {data.length - withMetrics} conteúdo{data.length - withMetrics > 1 ? 's' : ''} sem métricas
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--label2)' }}>
                  Registre views e likes na Biblioteca para ver o ranking completo
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
