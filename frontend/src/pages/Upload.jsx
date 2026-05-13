import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, Loader2, X, AlertCircle, ChevronLeft, ImagePlus, Check, Plus } from 'lucide-react';
import { analyzeImage } from '../api';

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

const MAX_PHOTOS = 5;

export default function Upload() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);       // array de File
  const [previews, setPreviews] = useState([]); // array de URLs
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const galleryRef = useRef();
  const cameraRef = useRef();
  const addMoreRef = useRef();

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles);
    setFiles(prev => {
      const combined = [...prev, ...arr].slice(0, MAX_PHOTOS);
      setPreviews(combined.map(f => URL.createObjectURL(f)));
      return combined;
    });
    setError(null);
  };

  const removePhoto = (index) => {
    setFiles(prev => {
      const next = prev.filter((_, i) => i !== index);
      setPreviews(next.map(f => URL.createObjectURL(f)));
      return next;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const handleAnalyze = async () => {
    if (!files.length || !theme) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeImage(files, theme);
      navigate('/result', { state: { result: res.data } });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao analisar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const hasPhotos = files.length > 0;
  const canGenerate = hasPhotos && theme && !loading;

  return (
    <div className="p-4 space-y-5 fade-up">
      {/* Header */}
      <div className="pt-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
          <ChevronLeft size={18} style={{ color: 'var(--label)' }} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>Analisar obra</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--label2)' }}>Até {MAX_PHOTOS} fotos + tema = conteúdo viral</p>
        </div>
      </div>

      {/* STEP 1 — Fotos */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: hasPhotos ? '#30D158' : 'var(--orange)', color: 'black' }}>
            {hasPhotos ? '✓' : '1'}
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--label)' }}>
            Escolha as fotos
            {hasPhotos && <span className="ml-2 font-normal" style={{ color: 'var(--label3)' }}>{files.length}/{MAX_PHOTOS}</span>}
          </p>
        </div>

        {!hasPhotos ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => galleryRef.current.click()}
                className="flex flex-col items-center gap-3 p-5 rounded-3xl transition-all active:scale-[0.97]"
                style={{ background: 'var(--bg2)', border: '1.5px solid var(--bg4)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(10,132,255,0.15)' }}>
                  <ImagePlus size={24} color="#0A84FF" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm" style={{ color: 'var(--label)' }}>Galeria</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--label3)' }}>Múltiplas fotos</p>
                </div>
              </button>
              <button onClick={() => cameraRef.current.click()}
                className="flex flex-col items-center gap-3 p-5 rounded-3xl transition-all active:scale-[0.97]"
                style={{ background: 'var(--bg2)', border: '1.5px solid var(--bg4)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,159,10,0.15)' }}>
                  <Camera size={24} color="var(--orange)" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm" style={{ color: 'var(--label)' }}>Câmera</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--label3)' }}>Tirar foto</p>
                </div>
              </button>
            </div>
            <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
              className="rounded-2xl p-3 text-center" style={{ border: '1.5px dashed var(--bg4)' }}>
              <p className="text-xs" style={{ color: 'var(--label3)' }}>ou arraste aqui · até {MAX_PHOTOS} fotos · JPG, PNG, WEBP</p>
            </div>
          </div>
        ) : (
          /* Grid de previews */
          <div className="grid grid-cols-3 gap-2">
            {previews.map((url, i) => (
              <div key={i} className="relative aspect-square">
                <img src={url} alt="" className="w-full h-full object-cover rounded-2xl" />
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'var(--orange)', color: 'black' }}>CAPA</span>
                )}
                <button onClick={() => removePhoto(i)}
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.7)' }}>
                  <X size={11} color="white" />
                </button>
              </div>
            ))}
            {files.length < MAX_PHOTOS && (
              <button onClick={() => addMoreRef.current.click()}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                style={{ background: 'var(--bg3)', border: '1.5px dashed var(--bg4)' }}>
                <Plus size={20} style={{ color: 'var(--label3)' }} />
                <span className="text-[10px]" style={{ color: 'var(--label3)' }}>Adicionar</span>
              </button>
            )}
          </div>
        )}

        <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => addFiles(e.target.files)} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={e => addFiles(e.target.files)} />
        <input ref={addMoreRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => addFiles(e.target.files)} />
      </div>

      {/* STEP 2 — Tema */}
      {hasPhotos && (
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

      {/* Botão gerar */}
      {hasPhotos && (
        <button onClick={handleAnalyze} disabled={!canGenerate}
          className="btn-primary w-full flex items-center justify-center gap-2 text-base">
          {loading
            ? <><Loader2 size={20} className="animate-spin" /> Analisando com IA...</>
            : !theme
            ? <><Sparkles size={20} /> Escolha o tema acima</>
            : <><Sparkles size={20} /> Gerar · {files.length} foto{files.length > 1 ? 's' : ''} · {THEMES.find(t => t.value === theme)?.label}</>}
        </button>
      )}

      {loading && (
        <div className="card text-center py-4">
          <p className="text-sm font-medium" style={{ color: 'var(--label)' }}>
            Analisando {files.length} foto{files.length > 1 ? 's' : ''} com IA...
          </p>
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
