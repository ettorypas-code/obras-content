import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, Upload as UploadIcon, Loader2, X, AlertCircle } from 'lucide-react';
import { analyzeImage } from '../api';

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
      setError(err.response?.data?.error || 'Erro ao analisar. Verifique sua conexão e a chave da OpenAI.');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="p-4 space-y-5">
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-white">Analisar imagem</h1>
        <p className="text-stone-400 text-sm mt-1">Envie uma foto da obra para gerar conteúdo</p>
      </div>

      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current.click()}
          className="border-2 border-dashed border-stone-700 hover:border-brand-500 rounded-2xl p-8 text-center cursor-pointer transition-colors group"
        >
          <div className="bg-stone-800 group-hover:bg-brand-500/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center transition-colors">
            <Image size={28} className="text-stone-500 group-hover:text-brand-500 transition-colors" />
          </div>
          <p className="text-white font-semibold">Toque para escolher uma foto</p>
          <p className="text-stone-500 text-sm mt-1">ou arraste uma imagem aqui</p>
          <p className="text-stone-600 text-xs mt-3">JPG, PNG, WEBP até 10MB</p>
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
          <img src={preview} alt="Preview" className="w-full rounded-2xl object-cover max-h-72" />
          <button
            onClick={clear}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 rounded-full p-1.5 transition-colors"
          >
            <X size={18} className="text-white" />
          </button>
        </div>
      )}

      {/* Dicas */}
      <div className="card space-y-2">
        <p className="text-sm font-semibold text-white mb-1">Fotos que geram melhor conteúdo:</p>
        {[
          'Erros visíveis (trinca, vazamento, execução errada)',
          'Antes/depois de uma etapa',
          'Comparação entre certo e errado',
          'Materiais com defeito ou fora do padrão'
        ].map(tip => (
          <div key={tip} className="flex items-start gap-2">
            <span className="text-brand-500 mt-0.5 text-xs">●</span>
            <p className="text-stone-400 text-sm">{tip}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!file || loading}
        className="btn-primary w-full flex items-center justify-center gap-2 text-base"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Analisando com IA...
          </>
        ) : (
          <>
            <UploadIcon size={20} />
            Gerar conteúdo
          </>
        )}
      </button>

      {loading && (
        <div className="card text-center py-4">
          <p className="text-stone-300 text-sm font-medium">Analisando sua imagem...</p>
          <p className="text-stone-500 text-xs mt-1">Isso leva entre 10 e 20 segundos</p>
          <div className="flex justify-center gap-1 mt-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
