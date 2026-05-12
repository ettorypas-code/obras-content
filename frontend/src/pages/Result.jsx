import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, Check, Bookmark, BookmarkCheck, CalendarPlus, ChevronDown, ChevronUp, Scissors, Lightbulb, ArrowLeft } from 'lucide-react';
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
    <button onClick={copy} className="text-stone-500 hover:text-brand-500 transition-colors p-1.5">
      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
    </button>
  );
}

function Accordion({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-brand-500" />
          <span className="font-semibold text-white text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-stone-500" /> : <ChevronDown size={16} className="text-stone-500" />}
      </button>
      {open && <div className="mt-3 pt-3 border-t border-stone-800">{children}</div>}
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
        <p className="text-stone-400">Nenhum resultado. Faça upload de uma imagem primeiro.</p>
        <button onClick={() => navigate('/upload')} className="btn-primary mt-4">Analisar imagem</button>
      </div>
    );
  }

  const ideas = Array.isArray(result.ideas) ? result.ideas : JSON.parse(result.ideas || '[]');
  const scripts = Array.isArray(result.scripts) ? result.scripts : JSON.parse(result.scripts || '[]');
  const editingSuggestions = Array.isArray(result.editing_suggestions) ? result.editing_suggestions : JSON.parse(result.editing_suggestions || '[]');
  const potentialReasons = Array.isArray(result.potential_reasons) ? result.potential_reasons : JSON.parse(result.potential_reasons || '[]');

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

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Resultado</h1>
        </div>
        <button onClick={handleSave} className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700">
          {saved
            ? <BookmarkCheck size={18} className="text-brand-500" />
            : <Bookmark size={18} className="text-stone-400" />
          }
        </button>
      </div>

      {/* Imagem + contexto */}
      <div className="card">
        <img src={result.imageUrl || result.image_url} alt="" className="w-full rounded-xl object-cover max-h-52 mb-3" />
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-white font-medium text-sm">{result.context}</p>
            <p className="text-stone-400 text-xs mt-1">{result.opportunity}</p>
          </div>
          <PotentialBadge value={result.potential} />
        </div>
        {potentialReasons.length > 0 && (
          <div className="mt-3 space-y-1">
            {potentialReasons.map(r => (
              <div key={r} className="flex items-center gap-2 text-xs text-stone-400">
                <span className="text-emerald-400">✓</span> {r}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ideias */}
      <Accordion title={`${ideas.length} Ideias de conteúdo`} icon={Lightbulb} defaultOpen={true}>
        <div className="space-y-2">
          {ideas.map((idea, i) => (
            <div key={i} className="flex items-start gap-3 bg-stone-800/60 rounded-xl p-3">
              <span className="text-brand-500 font-bold text-sm mt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{idea.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-stone-500 text-xs">{idea.format}</span>
                  <PotentialBadge value={idea.potential} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* Roteiros */}
      {scripts.length > 0 && (
        <Accordion title="Roteiros prontos" icon={Lightbulb} defaultOpen={true}>
          {scripts.length > 1 && (
            <div className="flex gap-2 mb-3">
              {scripts.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveScript(i)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    activeScript === i ? 'bg-brand-500 text-white' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {s.title.includes('Carrossel') ? 'Carrossel' : 'Reels/TikTok'}
                </button>
              ))}
            </div>
          )}
          {scripts[activeScript] && (
            <div className="space-y-3 text-sm">
              {[
                { label: 'HOOK (0–3s)', key: 'hook', color: 'text-red-400' },
                { label: 'DESENVOLVIMENTO', key: 'development', color: 'text-blue-400' },
                { label: 'RETENÇÃO', key: 'retention', color: 'text-yellow-400' },
                { label: 'CTA', key: 'cta', color: 'text-emerald-400' }
              ].map(({ label, key, color }) => (
                <div key={key} className="bg-stone-800/60 rounded-xl p-3">
                  <p className={`text-xs font-bold mb-1.5 ${color}`}>{label}</p>
                  <p className="text-stone-300 leading-relaxed">{scripts[activeScript][key]}</p>
                </div>
              ))}
            </div>
          )}
        </Accordion>
      )}

      {/* Legendas */}
      <Accordion title="Legenda pronta" icon={Copy} defaultOpen={false}>
        <div className="flex gap-2 mb-3">
          {['instagram', 'tiktok'].map(p => (
            <button
              key={p}
              onClick={() => setActivePlatform(p)}
              className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors capitalize ${
                activePlatform === p ? 'bg-brand-500 text-white' : 'bg-stone-800 text-stone-400'
              }`}
            >
              {p === 'instagram' ? '📸 Instagram' : '🎵 TikTok'}
            </button>
          ))}
        </div>
        <div className="bg-stone-800/60 rounded-xl p-3 relative">
          <p className="text-stone-300 text-sm whitespace-pre-wrap leading-relaxed pr-8">{caption}</p>
          <div className="absolute top-2 right-2">
            <CopyButton text={caption} />
          </div>
        </div>
      </Accordion>

      {/* Sugestões de edição */}
      {editingSuggestions.length > 0 && (
        <Accordion title="Sugestões de edição" icon={Scissors} defaultOpen={false}>
          <div className="space-y-2">
            {editingSuggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-brand-500 mt-0.5">→</span>
                <p className="text-stone-300">{s}</p>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* Dicas para maximizar */}
      {result.improvement_tips && (
        <Accordion title="Como maximizar o alcance" icon={Lightbulb} defaultOpen={false}>
          <div className="space-y-2">
            {(Array.isArray(result.improvement_tips) ? result.improvement_tips : JSON.parse(result.improvement_tips || '[]')).map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-yellow-400 mt-0.5">⚡</span>
                <p className="text-stone-300">{tip}</p>
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
          className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm"
        >
          {addedToCalendar ? (
            <><Check size={16} className="text-emerald-400" /> Adicionado!</>
          ) : (
            <><CalendarPlus size={16} /> Agendar post</>
          )}
        </button>
        <button
          onClick={() => navigate('/upload')}
          className="btn-primary flex-1 text-sm"
        >
          Nova análise
        </button>
      </div>
    </div>
  );
}
