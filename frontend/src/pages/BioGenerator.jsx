import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Copy, Check, Loader2, RefreshCw } from 'lucide-react';
import { generateBio } from '../api';

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-2 rounded-xl transition-all active:scale-90" style={{ background: 'var(--bg4)' }}>
      {copied ? <Check size={15} color="#30D158" /> : <Copy size={15} style={{ color: 'var(--label2)' }} />}
    </button>
  );
}

const STYLE_LABELS = ['Profissional', 'Informal', 'Com CTA'];
const STYLE_COLORS = ['#0A84FF', '#FF9F0A', '#30D158'];

export default function BioGenerator() {
  const navigate = useNavigate();
  const profile = JSON.parse(localStorage.getItem('obras_profile') || '{}');
  const [bios, setBios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateBio(profile);
      setBios(res.data.bios || []);
    } catch {
      setError('Erro ao gerar bio. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-5 fade-up">
      <div className="pt-4 flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
          <ChevronLeft size={18} style={{ color: 'var(--label)' }} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>Gerador de Bio</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--label2)' }}>3 opções otimizadas para seu perfil</p>
        </div>
      </div>

      {/* Perfil usado */}
      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--label3)' }}>Baseado no seu perfil</p>
        <div className="list-group" style={{ margin: 0 }}>
          {[
            { label: 'Nome', value: profile.name },
            { label: 'Profissão', value: profile.role },
            { label: 'Objetivo', value: profile.goal },
            { label: 'Plataforma', value: profile.platform }
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between px-3 py-2">
              <span className="text-xs" style={{ color: 'var(--label3)' }}>{row.label}</span>
              <span className="text-xs font-medium" style={{ color: 'var(--label2)' }}>{row.value || '—'}</span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--label3)' }}>
          Para alterar, vá em{' '}
          <button onClick={() => navigate('/profile')} style={{ color: 'var(--orange)' }}>Perfil → Refazer configuração</button>
        </p>
      </div>

      {/* Botão gerar */}
      <button
        onClick={generate}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 size={18} className="animate-spin" /> Gerando bios...</>
          : bios.length > 0
          ? <><RefreshCw size={18} /> Gerar novas opções</>
          : <><Sparkles size={18} /> Gerar bio com IA</>}
      </button>

      {error && (
        <p className="text-sm text-center" style={{ color: '#FF453A' }}>{error}</p>
      )}

      {/* Resultados */}
      {bios.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider px-1" style={{ color: 'var(--label3)' }}>
            Escolha a sua favorita
          </p>
          {bios.map((bio, i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${STYLE_COLORS[i]}18`, color: STYLE_COLORS[i] }}
                >
                  {STYLE_LABELS[i]}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--label3)' }}>{bio.length} chars</span>
                  <CopyBtn text={bio} />
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--label)' }}>{bio}</p>
            </div>
          ))}

          <div className="card text-center py-3">
            <p className="text-xs" style={{ color: 'var(--label3)' }}>
              Toque em <Copy size={11} className="inline" /> para copiar e colar direto no Instagram/TikTok
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
