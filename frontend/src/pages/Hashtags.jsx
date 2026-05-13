import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Copy, Check } from 'lucide-react';

const THEMES = [
  { value: 'erros',        emoji: '⚠️', label: 'Erros' },
  { value: 'dicas',        emoji: '💡', label: 'Dicas' },
  { value: 'corretor',     emoji: '🏠', label: 'Corretor' },
  { value: 'engenheiro',   emoji: '📐', label: 'Engenheiro' },
  { value: 'custo',        emoji: '💰', label: 'Custos' },
  { value: 'seguranca',    emoji: '🦺', label: 'Segurança' },
  { value: 'antes_depois', emoji: '✨', label: 'Antes/Depois' },
  { value: 'bastidores',   emoji: '🎬', label: 'Bastidores' },
];

const HASHTAGS = {
  erros: [
    '#errosdeconstrução', '#obraerrada', '#errodeobra', '#viciosoculto', '#construtoradesonesta',
    '#problemasdeconstrução', '#obrairregular', '#patologiaconstrutiva', '#inspeçãodeobra', '#vistoriadeobra',
    '#errodeprojeto', '#reparodeobra', '#obracomproblema', '#denunciadeconstrução', '#contrapisoerrado',
    '#construçãocivil', '#engenhariocivil', '#obraresidencial', '#fiscalizaçãodeobra', '#normaabnt',
    '#construção', '#obra', '#engenheiro', '#arquitetura', '#reformacasa',
  ],
  dicas: [
    '#dicasdeobra', '#dicasdeconstrução', '#boaspraticastdeconstrução', '#construçãocerta', '#obraqualidade',
    '#dicasdeengenharia', '#truquesdeconstrução', '#aprenderengenharia', '#obracomqualidade', '#construçãosustentável',
    '#construçãocivil', '#engenhariocivil', '#obraresidencial', '#arquiteturaeconstrução', '#techconstrução',
    '#construção', '#obra', '#engenheiro', '#arquitetura', '#dica',
    '#praticasdeconstrução', '#materialdequalidade', '#fundação', '#estrutura', '#alvenaria',
  ],
  corretor: [
    '#corretordeimoveis', '#imoveis', '#mercadoimobiliário', '#vendadeimóvel', '#comprarапартмент',
    '#valorizaçãoimobiliária', '#investimentoimobiliário', '#imóvelnovo', '#lançamentoimobiliário', '#condomínio',
    '#casaprópria', '#apartamentoàvenda', '#imóveldeluxo', '#obradequalidade', '#construçãodevalor',
    '#corretor', '#imóvel', '#realstate', '#investimento', '#moradia',
    '#qualidadeconstrutiva', '#acabamentodequalidade', '#valorizaçãodoimóvel', '#obranova', '#empreendimento',
  ],
  engenheiro: [
    '#engenheirocivil', '#normaabnt', '#abnt', '#patologiaconstrutiva', '#calculoestrural',
    '#projetoestrutura', '#concreto', '#armaduradeviga', '#fundaçãoestacas', '#vigas',
    '#estruturametálica', '#concrtoarmado', '#alvenariaestrutural', '#laje', '#pilares',
    '#engenharia', '#construçãocivil', '#projetodeconstrução', '#engenhariaestrutura', '#técnicodeconstrução',
    '#concreto', '#aço', '#estrutura', '#obra', '#engenheiro',
  ],
  custo: [
    '#custodeconstrução', '#orçamentodeobra', '#economiaemobra', '#preçodeconstrução', '#gastoscomobra',
    '#materialdeconstrução', '#comprarmateriaisdeobra', '#preçojusto', '#economia', '#economianaobra',
    '#cusiodametria', '#valordeobra', '#m2deconstrução', '#reduçãodecusto', '#orçamento',
    '#construção', '#obra', '#finanças', '#investimento', '#custo',
    '#preço', '#materiais', '#economizar', '#construirbem', '#orçamentocivil',
  ],
  seguranca: [
    '#segurançadotrabalho', '#nr18', '#nr35', '#epi', '#acidentedetrabalho',
    '#trabalhonaobra', '#segurançanaobra', '#prevençãodeacidente', '#epcobra', '#cipa',
    '#treinamentodeconstrução', '#trabalhoalturas', '#trabalhoconfinado', '#risconaobra', '#proteçãocivil',
    '#segurança', '#construçãocivil', '#obra', '#trabalho', '#saúde',
    '#trabalhoseguro', '#epiobrigatório', '#capacete', '#coletaconstrução', '#normaregulamentadora',
  ],
  antes_depois: [
    '#antesedepois', '#transformação', '#reformacompleta', '#renovação', '#reformaresidencial',
    '#antesedepoisobra', '#reformadecasa', '#transformaçãodaresidência', '#obradeformação', '#resultadoobra',
    '#reformabanheiro', '#reformacozinha', '#reformasala', '#reformafachada', '#pinturaexterna',
    '#reforma', '#antesedepois', '#obra', '#construção', '#transformar',
    '#resultado', '#satisfação', '#reformar', '#renovar', '#novo',
  ],
  bastidores: [
    '#bastidoresdeobra', '#rotinadeengenheiro', '#diadeobra', '#trabalhonaobra', '#vidadeengenheiro',
    '#trabalhocomengenharia', '#equipedeobra', '#trabalhadores', '#pedreiro', '#mestre',
    '#obraemandamento', '#progresso', '#construindosonhos', '#voltaàsaulas', '#diadetrabalho',
    '#bastidores', '#rotina', '#obra', '#construção', '#trabalho',
    '#equipe', '#time', '#construir', '#dedicação', '#processo',
  ],
};

function CopyTag({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy}
      className="text-xs px-2.5 py-1 rounded-full transition-all active:scale-95 flex items-center gap-1"
      style={{
        background: copied ? 'rgba(48,209,88,0.15)' : 'var(--bg3)',
        color: copied ? '#30D158' : 'var(--label2)',
        border: `1px solid ${copied ? '#30D158' : 'transparent'}`
      }}>
      {copied ? <Check size={10} /> : null}
      {text}
    </button>
  );
}

export default function Hashtags() {
  const navigate = useNavigate();
  const [activeTheme, setActiveTheme] = useState('dicas');
  const [copiedAll, setCopiedAll] = useState(false);

  const tags = HASHTAGS[activeTheme] || [];

  const copyAll = () => {
    navigator.clipboard.writeText(tags.join(' '));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="p-4 space-y-4 fade-up">
      <div className="pt-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl" style={{ background: 'var(--bg3)' }}>
          <ChevronLeft size={18} style={{ color: 'var(--label)' }} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--label)', letterSpacing: '-0.5px' }}>
            Banco de Hashtags
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--label2)' }}>25 hashtags por tema · toque para copiar</p>
        </div>
      </div>

      {/* Tabs de tema */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {THEMES.map(t => (
          <button key={t.value} onClick={() => setActiveTheme(t.value)}
            className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all shrink-0"
            style={{
              background: activeTheme === t.value ? 'var(--orange)' : 'var(--bg3)',
              color: activeTheme === t.value ? 'black' : 'var(--label2)'
            }}>
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Copiar todos */}
      <button onClick={copyAll}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-all active:scale-[0.98]"
        style={{
          background: copiedAll ? 'rgba(48,209,88,0.15)' : 'var(--bg2)',
          border: `1.5px solid ${copiedAll ? '#30D158' : 'var(--bg4)'}`,
          color: copiedAll ? '#30D158' : 'var(--label)'
        }}>
        {copiedAll ? <Check size={16} /> : <Copy size={16} />}
        {copiedAll ? 'Copiado!' : `Copiar todas as ${tags.length} hashtags`}
      </button>

      {/* Tags individuais */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <CopyTag key={tag} text={tag} />
          ))}
        </div>
      </div>

      <p className="text-center text-xs pb-2" style={{ color: 'var(--label3)' }}>
        Toque em uma hashtag para copiar individualmente
      </p>
    </div>
  );
}
