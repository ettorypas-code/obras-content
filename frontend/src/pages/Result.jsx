import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, Check, Bookmark, BookmarkCheck, CalendarPlus, ChevronDown, ChevronUp, Scissors, Lightbulb, ChevronLeft, Share2, Zap } from 'lucide-react';
import PotentialBadge from '../components/PotentialBadge';
import { saveContent, createEvent } from '../api';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg transition-all active:scale-90" style={{ background: 'var(--bg4)' }}>
      {copied
        ? <Check size={14} color="#30D158" />
        : <Copy size={14} style={{ color: 'var(--label2)' }} />}
    </button>
  );
}

function Accordion({ title, icon: Icon, children, defaultOpen = false, accent }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} color={accent || 'var(--orange)'} />
          <span className="font-semibold text-sm" style={{ color: 'var(--label)' }}>{title}</span>
        </div>
        {open
          ? <ChevronUp size={16} style={{ color: 'var(--label3)' }} />
          : <ChevronDown size={16} style={{ color: 'var(--label3)' }} />}
      </button>
      {open && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--bg4)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  const [saved, setSaved] = useState(result?.saved === 1);
  const [activeScript, setActiveScript] = useState(0);
  const [activePlatform, setActivePlatform] = useState('instagram');
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  if (!result) {
    return (
      <div className="p-4 text-center pt-20">
        <p style={{ color: 'var(--label2)' }}>Nenhum resultado. Faça upload de uma imagem primeiro.</p>
        <button onClick={() => navigate('/upload')} className="btn-primary mt-4">Analisar imagem</button>
      </div>
    );
  }

  const ideas = Array.isArray(result.ideas) ? result.ideas : JSON.parse(result.ideas || '[]');
  const scripts = Array.isArray(result.scripts) ? result.scripts : JSON.parse(result.scripts || '[]');
  const editingSuggestions = Array.isArray(result.editing_suggestions) ? result.editing_suggestions : JSON.parse(result.editing_suggestions || '[]');
  const potentialReasons = Array.isArray(result.potential_reasons) ? result.potential_reasons : JSON.parse(result.potential_reasons || '[]');
  const improvementTips = Array.isArray(result.improvement_tips) ? result.improvement_tips : JSON.parse(result.improvement_tips || '[]');

  const caption = activePlatform === 'instagram'
    ? (result.captions?.instagram || result.caption_instagram)
    : (result.captions?.tiktok || result.caption_tiktok);

  const handleSave = async () => {
    const newSaved = !saved;
    setSaved(newSaved);
    if (result.id) await saveContent(result.id, newSaved);
  };

  const handleAddToCalendar = async () => {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    await createEvent({
      content_id: result.id || null,
      date: today.toISOString().split('T')[0],
      pillar: 'autoridade',
      platform: activePlatform,
      title: ideas[0]?.title || result.context
    });
    setAddedToCalendar(true);
  };

  const handleShare = async () => {
    const text = `${ideas[0]?.title || result.context}\n\n${caption || ''}`.trim();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'ObrasContent', text });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="p-4 space-y-4 fade-up">
      {/* Header */}
      <div className="pt-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
          <ChevronLeft size={18} style={{ color: 'var(--label)' }} />
        </button>
        <p className="text-xl font-bold flex-1 tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.3px' }}>Resultado</p>
        <button onClick={handleShare} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
          <Share2 size={18} style={{ color: 'var(--label)' }} />
        </button>
        <button onClick={handleSave} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
          {saved
            ? <BookmarkCheck size={18} color="var(--orange)" />
            : <Bookmark size={18} style={{ color: 'var(--label)' }} />}
        </button>
      </div>

      {/* Imagem + contexto */}
      <div className="card">
        <img src={result.imageUrl || result.image_url} alt="" className="w-full rounded-2xl object-cover max-h-52 mb-3" />
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--label)' }}>{result.context}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--label2)' }}>{result.opportunity}</p>
          </div>
          <PotentialBadge value={result.potential} />
        </div>
        {potentialReasons.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {potentialReasons.map(r => (
              <div key={r} className="flex items-center gap-2 text-xs" style={{ color: 'var(--label2)' }}>
                <span style={{ color: '#30D158' }}>✓</span> {r}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ideias */}
      <Accordion title={`${ideas.length} Ideias de conteúdo`} icon={Lightbulb} defaultOpen={true}>
        <div className="space-y-2">
          {ideas.map((idea, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl p-3" style={{ background: 'var(--bg3)' }}>
              <span className="text-sm font-bold mt-0.5" style={{ color: 'var(--orange)' }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--label)' }}>{idea.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: 'var(--label3)' }}>{idea.format}</span>
                  <PotentialBadge value={idea.potential} showLabel={false} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* Roteiros */}
      {scripts.length > 0 && (
        <Accordion title="Roteiros prontos" icon={Zap} defaultOpen={true} accent="#BF5AF2">
          {scripts.length > 1 && (
            <div className="flex gap-2 mb-3">
              {scripts.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveScript(i)}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium transition-colors"
                  style={{
                    background: activeScript === i ? 'var(--orange)' : 'var(--bg3)',
                    color: activeScript === i ? 'black' : 'var(--label2)'
                  }}
                >
                  {s.title?.includes('Carrossel') ? 'Carrossel' : 'Reels/TikTok'}
                </button>
              ))}
            </div>
          )}
          {scripts[activeScript] && (
            <div className="space-y-2 text-sm">
              {[
                { label: 'HOOK (0–3s)', key: 'hook', color: '#FF453A' },
                { label: 'DESENVOLVIMENTO', key: 'development', color: '#0A84FF' },
                { label: 'RETENÇÃO', key: 'retention', color: '#FF9F0A' },
                { label: 'CTA', key: 'cta', color: '#30D158' }
              ].map(({ label, key, color }) => (
                <div key={key} className="rounded-2xl p-3" style={{ background: 'var(--bg3)' }}>
                  <p className="text-xs font-bold mb-1.5" style={{ color }}>{label}</p>
                  <p className="leading-relaxed" style={{ color: 'var(--label2)' }}>{scripts[activeScript][key]}</p>
                </div>
              ))}
            </div>
          )}
        </Accordion>
      )}

      {/* Legendas */}
      <Accordion title="Legenda pronta" icon={Copy} defaultOpen={false} accent="#0A84FF">
        {/* Segmented control */}
        <div className="flex p-1 rounded-xl mb-3" style={{ background: 'var(--bg3)' }}>
          {['instagram', 'tiktok'].map(p => (
            <button
              key={p}
              onClick={() => setActivePlatform(p)}
              className="flex-1 text-xs py-1.5 rounded-lg font-medium transition-all"
              style={{
                background: activePlatform === p ? 'var(--bg4)' : 'transparent',
                color: activePlatform === p ? 'var(--label)' : 'var(--label3)'
              }}
            >
              {p === 'instagram' ? '📸 Instagram' : '🎵 TikTok'}
            </button>
          ))}
        </div>
        <div className="relative rounded-2xl p-3" style={{ background: 'var(--bg3)' }}>
          <p className="text-sm pr-8 whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--label2)' }}>{caption}</p>
          <div className="absolute top-2 right-2">
            <CopyButton text={caption} />
          </div>
        </div>
      </Accordion>

      {/* Sugestões de edição */}
      {editingSuggestions.length > 0 && (
        <Accordion title="Sugestões de edição" icon={Scissors} defaultOpen={false} accent="#FF9F0A">
          <div className="space-y-2">
            {editingSuggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span style={{ color: 'var(--orange)' }} className="mt-0.5">→</span>
                <p style={{ color: 'var(--label2)' }}>{s}</p>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* Como maximizar */}
      {improvementTips.length > 0 && (
        <Accordion title="Como maximizar o alcance" icon={Zap} defaultOpen={false} accent="#30D158">
          <div className="space-y-2">
            {improvementTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span style={{ color: '#30D158' }} className="mt-0.5">⚡</span>
                <p style={{ color: 'var(--label2)' }}>{tip}</p>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* Ações */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={handleAddToCalendar}
          disabled={addedToCalendar}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-2xl transition-all"
          style={{ background: 'var(--bg3)', color: addedToCalendar ? '#30D158' : 'var(--label)' }}
        >
          {addedToCalendar
            ? <><Check size={16} /> Agendado!</>
            : <><CalendarPlus size={16} /> Agendar</>}
        </button>
        <button onClick={() => navigate('/upload')} className="btn-primary flex-1 text-sm">
          Nova análise
        </button>
      </div>
    </div>
  );
}
