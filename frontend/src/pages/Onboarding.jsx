import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    id: 'name',
    title: 'Como você se chama?',
    subtitle: 'Vamos personalizar sua experiência',
    type: 'text',
    placeholder: 'Seu nome',
    key: 'name'
  },
  {
    id: 'role',
    title: 'Qual é sua profissão?',
    subtitle: 'Isso melhora o conteúdo gerado pela IA',
    type: 'options',
    key: 'role',
    options: [
      { value: 'engenheiro', label: 'Engenheiro Civil', emoji: '👷' },
      { value: 'consultor', label: 'Consultor de Obras', emoji: '📋' },
      { value: 'incorporador', label: 'Incorporador', emoji: '🏢' },
      { value: 'mestre', label: 'Mestre de Obras', emoji: '🔨' },
      { value: 'arquiteto', label: 'Arquiteto', emoji: '✏️' },
      { value: 'outro', label: 'Outro', emoji: '👤' }
    ]
  },
  {
    id: 'goal',
    title: 'Qual seu objetivo principal?',
    subtitle: 'A IA vai priorizar o que mais importa pra você',
    type: 'options',
    key: 'goal',
    options: [
      { value: 'clientes', label: 'Atrair clientes', emoji: '🎯' },
      { value: 'autoridade', label: 'Ganhar autoridade', emoji: '🏆' },
      { value: 'seguidores', label: 'Crescer seguidores', emoji: '📈' },
      { value: 'marca', label: 'Construir minha marca', emoji: '💼' }
    ]
  },
  {
    id: 'platform',
    title: 'Onde você quer crescer?',
    subtitle: 'O conteúdo será otimizado para a plataforma escolhida',
    type: 'options',
    key: 'platform',
    options: [
      { value: 'instagram', label: 'Instagram', emoji: '📸' },
      { value: 'tiktok', label: 'TikTok', emoji: '🎵' },
      { value: 'ambas', label: 'Ambas as plataformas', emoji: '🚀' }
    ]
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [text, setText] = useState('');

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    const value = current.type === 'text' ? text : data[current.key];
    if (!value) return;
    const newData = { ...data, [current.key]: value };
    setData(newData);
    if (isLast) {
      localStorage.setItem('obras_profile', JSON.stringify(newData));
      navigate('/');
    } else {
      setStep(s => s + 1);
      setText('');
    }
  };

  const canProceed = current.type === 'text' ? text.trim().length > 0 : !!data[current.key];

  return (
    <div className="min-h-screen flex flex-col p-6 pt-16" style={{ background: 'var(--bg)' }}>
      {/* Progress */}
      <div className="flex gap-1.5 mb-12">
        {STEPS.map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= step ? 'var(--orange)' : 'var(--bg4)' }} />
        ))}
      </div>

      <div className="flex-1 fade-up">
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--orange)' }}>
          {step + 1} de {STEPS.length}
        </p>
        <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>
          {current.title}
        </h1>
        <p className="text-base mb-8" style={{ color: 'var(--label2)' }}>{current.subtitle}</p>

        {current.type === 'text' && (
          <input className="input text-xl" style={{ fontSize: '20px', padding: '16px' }}
            placeholder={current.placeholder} value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canProceed && handleNext()}
            autoFocus />
        )}

        {current.type === 'options' && (
          <div className="space-y-2">
            {current.options.map(opt => {
              const selected = data[current.key] === opt.value;
              return (
                <button key={opt.value}
                  onClick={() => setData({ ...data, [current.key]: opt.value })}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
                  style={{
                    background: selected ? 'rgba(255,159,10,0.15)' : 'var(--bg2)',
                    border: `1.5px solid ${selected ? 'var(--orange)' : 'transparent'}`
                  }}>
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="font-medium text-left flex-1" style={{ color: 'var(--label)' }}>{opt.label}</span>
                  {selected && <CheckCircle size={18} style={{ color: 'var(--orange)' }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={handleNext} disabled={!canProceed}
        className="btn-primary w-full flex items-center justify-center gap-2 mt-6">
        {isLast ? 'Começar' : 'Continuar'}
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
