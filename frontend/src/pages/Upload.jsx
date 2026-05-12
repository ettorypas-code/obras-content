import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, Sparkles, Loader2, X, AlertCircle, ChevronLeft } from 'lucide-react';
import { analyzeImage } from '../api';

const TIPS = [
  'Erros visíveis (trinca, vazamento, execução errada)',
  'Antes/depois de uma etapa',
  'Comparação entre certo e errado',
  'Materiais com defeito ou fora do padrão'
];

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

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
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeImage(file);
      navigate('/result', { state: { result: res.data } });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao analisar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => { setFile(null); setPreview(null); setError(null); };

  return (
    <div className="p-4 space-y-5 fade-up">
      <div className="pt-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
          <ChevronLeft size={18} style={{ color: 'var(--label)' }} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>Analisar obra</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--label2)' }}>Envie uma foto para gerar conteúdo viral</p>
        </div>
      </div>

      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current.click()}
          className="rounded-3xl p-8 text-center cursor-pointer transition-all active:scale-[0.98]"
          style={{ background: 'var(--bg2)', border: '1.5px dashed var(--bg4)' }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg3)' }}>
            <Camera size={28} style={{ color: 'var(--orange)' }} />
          </div>
          <p className="font-semibold text-base" style={{ color: 'var(--label)' }}>Toque para escolher uma foto</p>
          <p className="text-sm mt-1" style={{ color: 'var(--label2)' }}>ou arraste uma imagem aqui</p>
          <p className="text-xs mt-3" style={{ color: 'var(--label3)' }}>JPG, PNG, WEBP até 10MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full rounded-3xl object-cover max-h-72" />
          <button
            onClick={clear}
            className="absolute top-3 right-3 rounded-full p-2"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <X size={16} color="white" />
          </button>
        </div>
      )}

      <div className="card">
        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--label)' }}>Fotos que geram melhor conteúdo</p>
        <div className="space-y-2">
          {TIPS.map(tip => (
            <div key={tip} className="flex items-start gap-2">
              <span className="text-xs mt-0.5" style={{ color: 'var(--orange)' }}>●</span>
              <p className="text-sm" style={{ color: 'var(--label2)' }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.3)' }}>
          <AlertCircle size={18} color="#FF453A" className="mt-0.5 shrink-0" />
          <p className="text-sm" style={{ color: '#FF453A' }}>{error}</p>
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!file || loading}
        className="btn-primary w-full flex items-center justify-center gap-2 text-base"
      >
        {loading ? (
          <><Loader2 size={20} className="animate-spin" /> Analisando com IA...</>
        ) : (
          <><Sparkles size={20} /> Gerar conteúdo</>
        )}
      </button>

      {loading && (
        <div className="card text-center py-4">
          <p className="text-sm font-medium" style={{ color: 'var(--label)' }}>A IA está analisando sua imagem...</p>
          <p className="text-xs mt-1" style={{ color: 'var(--label2)' }}>Isso leva entre 10 e 20 segundos</p>
          <div className="flex justify-center gap-1.5 mt-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--orange)', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
