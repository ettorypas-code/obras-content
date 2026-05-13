import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Palette, RefreshCw } from 'lucide-react';

const TEMPLATES = [
  { id: 'dark', label: 'Dark', bg: '#0A0A0A', accent: '#FF9F0A', text: '#FFFFFF' },
  { id: 'orange', label: 'Laranja', bg: '#FF9F0A', accent: '#000000', text: '#000000' },
  { id: 'blue', label: 'Azul', bg: '#0A1628', accent: '#0A84FF', text: '#FFFFFF' },
  { id: 'purple', label: 'Roxo', bg: '#12091A', accent: '#BF5AF2', text: '#FFFFFF' },
];

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let yPos = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, yPos);
      line = words[n] + ' ';
      yPos += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, yPos);
  return yPos + lineHeight;
}

function drawSlide(canvas, slideData, template) {
  const ctx = canvas.getContext('2d');
  const W = 1080, H = 1080;
  canvas.width = W;
  canvas.height = H;

  // Fundo
  ctx.fillStyle = template.bg;
  ctx.fillRect(0, 0, W, H);

  // Elemento decorativo canto
  ctx.fillStyle = template.accent + '22';
  ctx.beginPath();
  ctx.arc(W * 0.9, -H * 0.05, H * 0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = template.accent + '15';
  ctx.beginPath();
  ctx.arc(-W * 0.05, H * 1.05, H * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Número do slide (canto superior esquerdo)
  if (slideData.number) {
    ctx.fillStyle = template.accent;
    ctx.font = `bold 48px -apple-system, Arial, sans-serif`;
    ctx.fillText(`${String(slideData.number).padStart(2, '0')}`, 80, 100);
  }

  // Badge tipo
  if (slideData.badge) {
    const bW = ctx.measureText(slideData.badge).width + 48;
    ctx.fillStyle = template.accent;
    ctx.beginPath();
    ctx.roundRect(80, 120, bW, 52, 26);
    ctx.fill();
    ctx.fillStyle = slideData.id === 'capa' ? template.bg : '#000';
    ctx.font = `bold 28px -apple-system, Arial, sans-serif`;
    ctx.fillText(slideData.badge, 104, 155);
  }

  // Título principal
  ctx.fillStyle = template.text;
  ctx.font = `bold ${slideData.isTitle ? 76 : 58}px -apple-system, Arial, sans-serif`;
  const titleY = slideData.badge ? 260 : 200;
  wrapText(ctx, slideData.title || '', 80, titleY, W - 160, slideData.isTitle ? 90 : 72);

  // Subtítulo / corpo
  if (slideData.body) {
    ctx.fillStyle = template.text + 'BB';
    ctx.font = `400 38px -apple-system, Arial, sans-serif`;
    const bodyY = slideData.badge ? 480 : 420;
    wrapText(ctx, slideData.body, 80, bodyY, W - 160, 52);
  }

  // Linha decorativa rodapé
  ctx.fillStyle = template.accent;
  ctx.fillRect(80, H - 100, 80, 6);

  // Marca d'água
  ctx.fillStyle = template.text + '44';
  ctx.font = `500 28px -apple-system, Arial, sans-serif`;
  ctx.fillText('ObrasContent', 80, H - 52);

  // Número da página (rodapé direito)
  if (slideData.total) {
    ctx.fillStyle = template.text + '44';
    ctx.font = `400 28px -apple-system, Arial, sans-serif`;
    const pageText = `${slideData.number || 1}/${slideData.total}`;
    const pw = ctx.measureText(pageText).width;
    ctx.fillText(pageText, W - 80 - pw, H - 52);
  }
}

export default function CarouselGenerator() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [downloading, setDownloading] = useState(false);
  const canvasRefs = useRef([]);

  if (!result) {
    return (
      <div className="p-4 text-center pt-20">
        <p style={{ color: 'var(--label2)' }}>Nenhum conteúdo selecionado.</p>
        <button onClick={() => navigate('/library')} className="btn-primary mt-4">Ir para Biblioteca</button>
      </div>
    );
  }

  const ideas = Array.isArray(result.ideas) ? result.ideas : JSON.parse(result.ideas || '[]');
  const scripts = Array.isArray(result.scripts) ? result.scripts : JSON.parse(result.scripts || '[]');
  const script = scripts[0] || {};

  const slides = [
    { id: 'capa', number: 1, badge: 'CONSTRUÇÃO CIVIL', isTitle: true, title: ideas[0]?.title || result.context || 'Conteúdo de obra', body: 'Deslize para ver →' },
    { id: 'hook', number: 2, badge: 'O PROBLEMA', title: script.hook || ideas[1]?.title || 'Por que isso importa?', body: result.opportunity || '' },
    { id: 'dev1', number: 3, badge: 'ENTENDA', title: ideas[1]?.title || 'O que poucos sabem', body: (result.potential_reasons?.[0]) || '' },
    { id: 'dev2', number: 4, badge: 'NA PRÁTICA', title: ideas[2]?.title || 'Como identificar', body: (result.potential_reasons?.[1]) || '' },
    { id: 'dev3', number: 5, badge: 'ATENÇÃO', title: ideas[3]?.title || 'O que fazer agora', body: (result.improvement_tips?.[0]) || '' },
    { id: 'dev4', number: 6, badge: 'DICA EXTRA', title: ideas[4]?.title || 'Profissional faz assim', body: (result.improvement_tips?.[1]) || '' },
    { id: 'ret', number: 7, badge: 'RESUMO', title: script.retention || 'O que você aprendeu hoje', body: result.context || '' },
    { id: 'cta', number: 8, badge: 'SALVA ESSE POST', isTitle: true, title: script.cta || 'Siga para mais conteúdo de obra!', body: '@ObrasContent' },
  ].map(s => ({ ...s, total: 8 }));

  const downloadSlide = (index) => {
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    drawSlide(canvas, slides[index], template);
    const link = document.createElement('a');
    link.download = `slide-${index + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadAll = async () => {
    setDownloading(true);
    for (let i = 0; i < slides.length; i++) {
      const canvas = canvasRefs.current[i];
      if (!canvas) continue;
      drawSlide(canvas, slides[i], template);
      await new Promise(r => setTimeout(r, 100));
      const link = document.createElement('a');
      link.download = `carrossel-slide-${i + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      await new Promise(r => setTimeout(r, 300));
    }
    setDownloading(false);
  };

  return (
    <div className="p-4 space-y-4 fade-up">
      <div className="pt-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
          <ChevronLeft size={18} style={{ color: 'var(--label)' }} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>
            Carrossel Visual
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--label2)' }}>8 slides prontos para baixar</p>
        </div>
      </div>

      {/* Seletor de template */}
      <div>
        <div className="flex items-center gap-2 mb-2 px-1">
          <Palette size={14} color="var(--orange)" />
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--label3)' }}>Template</p>
        </div>
        <div className="flex gap-2">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setTemplate(t)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95"
              style={{
                background: t.bg,
                border: `2px solid ${template.id === t.id ? t.accent : 'transparent'}`
              }}>
              <span className="text-xs font-semibold" style={{ color: t.text }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview dos slides */}
      <div className="grid grid-cols-2 gap-3">
        {slides.map((slide, i) => {
          canvasRefs.current[i] = canvasRefs.current[i] || document.createElement('canvas');
          return (
            <div key={i} className="space-y-1.5">
              <div className="w-full aspect-square rounded-2xl overflow-hidden relative"
                style={{ background: template.bg }}>
                {/* Preview CSS simplificado */}
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div>
                    {slide.badge && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: template.accent, color: template.bg }}>
                        {slide.badge}
                      </span>
                    )}
                    <p className="text-[11px] font-bold mt-1.5 leading-tight line-clamp-3"
                      style={{ color: template.text }}>
                      {slide.title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-0.5 w-6 rounded-full" style={{ background: template.accent }} />
                    <span className="text-[9px]" style={{ color: template.text + '66' }}>
                      {slide.number}/{slide.total}
                    </span>
                  </div>
                </div>
                {/* Hidden canvas for actual download */}
                <canvas ref={el => canvasRefs.current[i] = el} style={{ display: 'none' }} />
              </div>
              <button onClick={() => downloadSlide(i)}
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95"
                style={{ background: 'var(--bg3)', color: 'var(--label2)' }}>
                <Download size={11} /> Slide {i + 1}
              </button>
            </div>
          );
        })}
      </div>

      {/* Download todos */}
      <button onClick={downloadAll} disabled={downloading}
        className="btn-primary w-full flex items-center justify-center gap-2">
        {downloading
          ? <><RefreshCw size={18} className="animate-spin" /> Baixando slides...</>
          : <><Download size={18} /> Baixar todos os 8 slides</>}
      </button>

      <p className="text-center text-xs pb-2" style={{ color: 'var(--label3)' }}>
        Os slides são gerados em 1080×1080px (Instagram)
      </p>
    </div>
  );
}
