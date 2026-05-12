import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, Sparkles, Loader2, X, AlertCircle, ChevronLeft, ImagePlus } from 'lucide-react';
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
        <div className="space-y-3">
          {/* Botões de ação */}
          <div className="grid grid-cols-2 gap-3">
            {/* Galeria */}
            <button
              onClick={() => fileRef.current.click()}
              className="flex flex-col items-center gap-3 p-5 rounded-3xl transition-all active:scale-[0.97]"
              style={{ background: 'var(--bg2)', border: '1.5px solid var(--bg4)' }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(10,132,255,0.15)' }}>
                <ImagePlus size={24} color="#0A84FF" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm" style={{ color: 'var(--label)' }}>Galeria</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--label3)' }}>Escolher foto</p>
              </div>
            </button>

            {/* Câmera */}
            <button
              onClick={() => cameraRef.current.click()}
              className="flex flex-col items-center gap-3 p-5 rounded-3xl transition-all active:scale-[0.97]"
              style={{ background: 'var(--bg2)', border: '1.5px solid var(--bg4)' }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,159,10,0.15)' }}>
                <Camera size={24} color="var(--orange)" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm" style={{ color: 'var(--label)' }}>Câmera</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--label3)' }}>Tirar foto</p>
              </div>
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className="rounded-2xl p-4 text-center"
            style={{ border: '1.5px dashed var(--bg4)' }}
          >
            <p className="text-xs" style={{ color: 'var(--label3)' }}>ou arraste uma imagem aqui · JPG, PNG, WEBP até 10MB</p>
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFile(e.target.files[0])} />
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
