import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  {
    id: 'name',
    emoji: '👋',
    title: 'Como você se chama?',
    subtitle: 'Vamos personalizar sua experiência',
    type: 'text',
    placeholder: 'Seu nome completo',
    key: 'name'
  },
  {
    id: 'role',
    emoji: '🏗️',
    title: 'Qual é sua profissão?',
    subtitle: 'A IA cria conteúdo no seu tom de voz',
    type: 'options',
    key: 'role',
    options: [
      { value: 'engenheiro',  label: 'Engenheiro Civil',    emoji: '👷' },
      { value: 'consultor',   label: 'Consultor de Obras',  emoji: '📋' },
      { value: 'incorporador',label: 'Incorporador',        emoji: '🏢' },
      { value: 'mestre',      label: 'Mestre de Obras',     emoji: '🔨' },
      { value: 'arquiteto',   label: 'Arquiteto',           emoji: '✏️' },
      { value: 'outro',       label: 'Outro',               emoji: '👤' }
    ]
  },
  {
    id: 'goal',
    emoji: '🎯',
    title: 'Qual seu objetivo?',
    subtitle: 'A IA vai priorizar o que mais importa pra você',
    type: 'options',
    key: 'goal',
    options: [
      { value: 'clientes',   label: 'Atrair clientes',      emoji: '🎯' },
      { value: 'autoridade', label: 'Ganhar autoridade',    emoji: '🏆' },
      { value: 'seguidores', label: 'Crescer seguidores',   emoji: '📈' },
      { value: 'marca',      label: 'Construir minha marca',emoji: '💼' }
    ]
  },
  {
    id: 'platform',
    emoji: '📱',
    title: 'Onde quer crescer?',
    subtitle: 'O conteúdo será otimizado para a plataforma',
    type: 'options',
    key: 'platform',
    options: [
      { value: 'instagram', label: 'Instagram',             emoji: '📸' },
      { value: 'tiktok',    label: 'TikTok',               emoji: '🎵' },
      { value: 'ambas',     label: 'Ambas as plataformas', emoji: '🚀' }
    ]
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { saveProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const canProceed = current.type === 'text' ? text.trim().length > 1 : !!data[current.key];

  const handleOption = (value) => {
    const newData = { ...data, [current.key]: value };
    setData(newData);
    // Auto-avança após selecionar opção
    setTimeout(async () => {
      if (isLast) {
        setSaving(true);
        await saveProfile(newData);
        navigate('/');
      } else {
        setStep(s => s + 1);
      }
    }, 280);
  };

  const handleNext = async () => {
    if (!canProceed) return;
    const value = current.type === 'text' ? text : data[current.key];
    const newData = { ...data, [current.key]: value };
    setData(newData);
    if (isLast) {
      setSaving(true);
      await saveProfile(newData);
      navigate('/');
    } else {
      setStep(s => s + 1);
      setText('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 pt-14" style={{ background: 'var(--bg)' }}>
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-10">
        {STEPS.map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ background: i <= step ? 'var(--orange)' : 'var(--bg4)' }} />
        ))}
      </div>

      <div className="flex-1 fade-up" key={step}>
        {/* Emoji grande */}
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-6"
          style={{ background: 'rgba(255,159,10,0.12)', border: '1.5px solid rgba(255,159,10,0.3)' }}>
          {current.emoji}
        </div>

        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--orange)' }}>
          Passo {step + 1} de {STEPS.length}
        </p>
        <h1 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>
          {current.title}
        </h1>
        <p className="text-base mb-8" style={{ color: 'var(--label2)' }}>{current.subtitle}</p>

        {current.type === 'text' && (
          <input
            className="input"
            style={{ fontSize: '20px', padding: '16px' }}
            placeholder={current.placeholder}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canProceed && handleNext()}
            autoFocus
          />
        )}

        {current.type === 'options' && (
          <div className={`grid gap-2 ${current.options.length > 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {current.options.map(opt => {
              const selected = data[current.key] === opt.value;
              return (
                <button key={opt.value}
                  onClick={() => handleOption(opt.value)}
                  className="flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-[0.97]"
                  style={{
                    background: selected ? 'rgba(255,159,10,0.15)' : 'var(--bg2)',
                    border: `1.5px solid ${selected ? 'var(--orange)' : 'var(--bg4)'}`
                  }}>
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="font-medium text-sm text-left flex-1" style={{ color: 'var(--label)' }}>
                    {opt.label}
                  </span>
                  {selected && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'var(--orange)' }}>
                      <Check size={12} color="black" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Botão só aparece em campos de texto */}
      {current.type === 'text' && (
        <button onClick={handleNext} disabled={!canProceed || saving}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-6">
          {saving ? 'Salvando...' : isLast ? 'Começar agora' : 'Continuar'}
          {!saving && <ChevronRight size={18} />}
        </button>
      )}
    </div>
  );
}
