import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, Loader2, X, AlertCircle, ChevronLeft, ImagePlus, Check } from 'lucide-react';
import { analyzeImage } from '../api';

const THEMES = [
  { value: 'erros',        emoji: '⚠️', label: 'Erros de Obra',     desc: 'Identifica falhas e custos' },
  { value: 'dicas',        emoji: '💡', label: 'Dicas Técnicas',     desc: 'Ensina boas práticas' },
  { value: 'corretor',     emoji: '🏠', label: 'Para Corretores',    desc: 'Valorização e vendas' },
  { value: 'engenheiro',   emoji: '📐', label: 'Visão do Engenheiro',desc: 'Análise técnica ABNT' },
  { value: 'custo',        emoji: '💰', label: 'Economia & Custos',  desc: 'Preços e economia' },
  { value: 'seguranca',    emoji: '🦺', label: 'Segurança',          desc: 'Riscos e prevenção' },
  { value: 'antes_depois', emoji: '✨', label: 'Antes/Depois',       desc: 'Transformação e processo' },
  { value: 'bastidores',   emoji: '🎬', label: 'Bastidores',         desc: 'Rotina e dia a dia' },
];

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();
  const cameraRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file || !theme) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeImage(file, theme);
      navigate('/result', { state: { result: res.data } });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao analisar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => { setFile(null); setPreview(null); setTheme(null); setError(null); };

  const canGenerate = file && theme && !loading;

  return (
    <div className="p-4 space-y-5 fade-up">
      {/* Header */}
      <div className="pt-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
          <ChevronLeft size={18} style={{ color: 'var(--label)' }} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>Analisar obra</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--label2)' }}>Foto + tema = conteúdo viral</p>
        </div>
      </div>

      {/* STEP 1 — Foto */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: preview ? '#30D158' : 'var(--orange)', color: 'black' }}>
            {preview ? '✓' : '1'}
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--label)' }}>Escolha a foto</p>
        </div>

        {!preview ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => fileRef.current.click()}
                className="flex flex-col items-center gap-3 p-5 rounded-3xl transition-all active:scale-[0.97]"
                style={{ background: 'var(--bg2)', border: '1.5px solid var(--bg4)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(10,132,255,0.15)' }}>
                  <ImagePlus size={24} color="#0A84FF" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm" style={{ color: 'var(--label)' }}>Galeria</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--label3)' }}>Escolher foto</p>
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
              <p className="text-xs" style={{ color: 'var(--label3)' }}>ou arraste aqui · JPG, PNG, WEBP até 10MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full rounded-3xl object-cover max-h-60" />
            <button onClick={clear} className="absolute top-3 right-3 rounded-full p-2" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <X size={16} color="white" />
            </button>
          </div>
        )}
      </div>

      {/* STEP 2 — Tema (aparece após escolher foto) */}
      {preview && (
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
                    <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'var(--label3)' }}>{t.desc}</p>
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
      {preview && (
        <button onClick={handleAnalyze} disabled={!canGenerate}
          className="btn-primary w-full flex items-center justify-center gap-2 text-base">
          {loading
            ? <><Loader2 size={20} className="animate-spin" /> Analisando com IA...</>
            : !theme
            ? <><Sparkles size={20} /> Escolha o tema acima</>
            : <><Sparkles size={20} /> Gerar conteúdo · {THEMES.find(t => t.value === theme)?.label}</>}
        </button>
      )}

      {loading && (
        <div className="card text-center py-4">
          <p className="text-sm font-medium" style={{ color: 'var(--label)' }}>A IA está analisando sua imagem...</p>
          <p className="text-xs mt-1" style={{ color: 'var(--label2)' }}>Isso leva entre 10 e 20 segundos</p>
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
