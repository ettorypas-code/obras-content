import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle, ChevronLeft, Check, FileText } from 'lucide-react';
import { analyzeText } from '../api';

const THEMES = [
  { value: 'erros',        emoji: '⚠️', label: 'Erros de Obra',      desc: 'Identifica falhas e custos' },
  { value: 'dicas',        emoji: '💡', label: 'Dicas Técnicas',      desc: 'Ensina boas práticas' },
  { value: 'corretor',     emoji: '🏠', label: 'Para Corretores',     desc: 'Valorização e vendas' },
  { value: 'engenheiro',   emoji: '📐', label: 'Visão do Engenheiro', desc: 'Análise técnica ABNT' },
  { value: 'custo',        emoji: '💰', label: 'Economia & Custos',   desc: 'Preços e economia' },
  { value: 'seguranca',    emoji: '🦺', label: 'Segurança',           desc: 'Riscos e prevenção' },
  { value: 'antes_depois', emoji: '✨', label: 'Antes/Depois',        desc: 'Transformação e processo' },
  { value: 'bastidores',   emoji: '🎬', label: 'Bastidores',          desc: 'Rotina e dia a dia' },
];

const EXAMPLES = [
  'Fiz uma laje hoje com 120m² na casa de um cliente',
  'Detectei trinca nas vigas de sustentação de um sobrado',
  'Finalizei o reboco externo de um prédio comercial de 5 andares',
  'Colocamos porcelanato em área de 200m² em 2 dias',
];

export default function TextAnalyze() {
  const navigate = useNavigate();
  const [situation, setSituation] = useState('');
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasText = situation.trim().length > 10;
  const canGenerate = hasText && theme && !loading;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeText(situation, theme);
      navigate('/result', { state: { result: res.data } });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao gerar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-5 fade-up">
      {/* Header */}
      <div className="pt-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
          <ChevronLeft size={18} style={{ color: 'var(--label)' }} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>
            Gerar sem foto
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--label2)' }}>Descreva o que aconteceu na obra</p>
        </div>
      </div>

      {/* STEP 1 — Situação */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: hasText ? '#30D158' : 'var(--orange)', color: 'black' }}>
            {hasText ? '✓' : '1'}
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--label)' }}>O que aconteceu na obra?</p>
        </div>

        <div className="card p-0 overflow-hidden">
          <textarea
            value={situation}
            onChange={e => setSituation(e.target.value)}
            placeholder="Ex: Fiz uma laje hoje com 120m² na casa de um cliente no bairro Jardins..."
            rows={4}
            className="w-full p-4 text-sm resize-none outline-none"
            style={{
              background: 'var(--bg2)',
              color: 'var(--label)',
              borderBottom: '1px solid var(--bg4)'
            }}
          />
          <div className="flex items-center gap-1.5 p-3 flex-wrap">
            <span className="text-xs" style={{ color: 'var(--label3)' }}>Exemplos:</span>
            {EXAMPLES.slice(0, 2).map(ex => (
              <button key={ex} onClick={() => setSituation(ex)}
                className="text-xs px-2.5 py-1 rounded-full transition-all active:scale-95"
                style={{ background: 'var(--bg4)', color: 'var(--label2)' }}>
                {ex.slice(0, 28)}...
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-1.5 px-1">
          <p className="text-xs" style={{ color: 'var(--label3)' }}>
            {situation.length < 10 ? 'Mínimo 10 caracteres' : `${situation.length} caracteres`}
          </p>
          {hasText && <p className="text-xs" style={{ color: '#30D158' }}>✓ Pronto</p>}
        </div>
      </div>

      {/* STEP 2 — Tema */}
      {hasText && (
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: theme ? '#30D158' : 'var(--orange)', color: 'black' }}>
              {theme ? '✓' : '2'}
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--label)' }}>Qual o foco do conteúdo?</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map(t => {
              const selected = theme === t.value;
              return (
                <button key={t.value} onClick={() => setTheme(t.value)}
                  className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all active:scale-[0.97]"
                  style={{
                    background: selected ? 'rgba(255,159,10,0.12)' : 'var(--bg2)',
                    border: `1.5px solid ${selected ? 'var(--orange)' : 'var(--bg4)'}`
                  }}>
                  <span className="text-xl">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-tight" style={{ color: selected ? 'var(--orange)' : 'var(--label)' }}>
                      {t.label}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--label3)' }}>{t.desc}</p>
                  </div>
                  {selected && <Check size={14} color="var(--orange)" className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.3)' }}>
          <AlertCircle size={18} color="#FF453A" className="mt-0.5 shrink-0" />
          <p className="text-sm" style={{ color: '#FF453A' }}>{error}</p>
        </div>
      )}

      {/* Botão */}
      {hasText && (
        <button onClick={handleGenerate} disabled={!canGenerate}
          className="btn-primary w-full flex items-center justify-center gap-2 text-base">
          {loading
            ? <><Loader2 size={20} className="animate-spin" /> Gerando com IA...</>
            : !theme
            ? <><FileText size={20} /> Escolha o tema acima</>
            : <><Sparkles size={20} /> Gerar · {THEMES.find(t => t.value === theme)?.label}</>}
        </button>
      )}

      {loading && (
        <div className="card text-center py-4">
          <p className="text-sm font-medium" style={{ color: 'var(--label)' }}>Gerando conteúdo com IA...</p>
          <p className="text-xs mt-1" style={{ color: 'var(--label2)' }}>Isso leva entre 10 e 30 segundos</p>
          <div className="flex justify-center gap-1.5 mt-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: 'var(--orange)', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
