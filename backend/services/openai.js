const { GoogleGenerativeAI } = require('@google/generative-ai');

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada no arquivo .env');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const THEME_CONTEXT = {
  erros:       'Foco: ERROS e FALHAS de execução. Identifique o erro, explique o problema técnico, o custo do retrabalho e como evitar. Tom: alerta, educativo, direto. Público: profissionais e leigos que querem aprender com erros alheios.',
  dicas:       'Foco: DICAS TÉCNICAS e boas práticas. Extraia lições práticas da imagem, ensine algo específico e aplicável. Tom: didático, acessível, útil. Público: pessoas que querem aprender sobre construção.',
  corretor:    'Foco: VALORIZAÇÃO e VENDAS IMOBILIÁRIAS. Mostre como a qualidade construtiva impacta o valor do imóvel, tranquilize compradores, destaque diferenciais. Tom: vendedor, confiante, persuasivo. Público: corretores e compradores.',
  engenheiro:  'Foco: ANÁLISE TÉCNICA APROFUNDADA. Normas ABNT, patologias, especificações técnicas. Tom: técnico, preciso, autoridade. Público: engenheiros, arquitetos e técnicos de edificações.',
  custo:       'Foco: ECONOMIA e CUSTOS. Mostre quanto custa o erro ou a boa prática, compare preços, dê dicas de economia sem perder qualidade. Tom: prático, direto, revelador. Público: pessoas construindo ou reformando.',
  seguranca:   'Foco: SEGURANÇA e RISCOS. Identifique riscos, explique consequências e como prevenir acidentes. Tom: urgente, responsável, educativo. Público: trabalhadores, gestores de obra e donos de imóvel.',
  antes_depois:'Foco: TRANSFORMAÇÃO e PROCESSO. Explore a evolução, o processo construtivo, o contraste entre etapas. Tom: inspirador, narrativo, envolvente. Público: pessoas que acompanham obras e se inspiram com resultados.',
  bastidores:  'Foco: BASTIDORES e ROTINA DE OBRA. Mostre o dia a dia, humanize o trabalho, conte a história por trás da imagem. Tom: autêntico, humano, próximo. Público: seguidores que querem ver o processo real.'
};

function buildPrompt(theme) {
  const themeCtx = THEME_CONTEXT[theme] || THEME_CONTEXT.dicas;

  return `Você é um especialista em conteúdo viral para Instagram e TikTok focado em construção civil brasileira.

TEMA ESCOLHIDO PELO USUÁRIO: ${themeCtx}

Analise esta imagem de obra com esse tema em mente e retorne um JSON com EXATAMENTE esta estrutura (sem markdown, sem texto extra):

{
  "context": "descrição específica do que aparece na imagem",
  "opportunity": "oportunidade de conteúdo alinhada ao tema escolhido",
  "potential": "alto",
  "potential_reasons": ["razão 1", "razão 2", "razão 3"],
  "improvement_tips": ["dica 1", "dica 2", "dica 3"],
  "ideas": [
    {"title": "ideia 1 alinhada ao tema com detalhe específico", "format": "Reels/TikTok", "potential": "alto"},
    {"title": "ideia 2", "format": "Carrossel", "potential": "alto"},
    {"title": "ideia 3", "format": "Reels curto", "potential": "medio"},
    {"title": "ideia 4", "format": "Stories", "potential": "medio"},
    {"title": "ideia 5", "format": "Vídeo longo", "potential": "baixo"}
  ],
  "scripts": [
    {
      "title": "Roteiro Reels/TikTok (60s)",
      "hook": "frase impactante para os primeiros 3 segundos alinhada ao tema",
      "development": "desenvolvimento com pontos específicos da imagem e do tema",
      "retention": "reviravolta ou dado surpresa para manter atenção",
      "cta": "chamada para ação direta"
    },
    {
      "title": "Roteiro Carrossel (8 slides)",
      "hook": "título da capa impactante",
      "development": "descrição dos slides 2 a 7",
      "retention": "slide de impacto",
      "cta": "slide final com chamada para ação"
    }
  ],
  "captions": {
    "instagram": "legenda completa com quebras de linha, emojis e 10 hashtags de construção civil",
    "tiktok": "legenda curta com 4 hashtags trending"
  },
  "editing_suggestions": [
    "sugestão de corte/enquadramento",
    "sugestão de trilha sonora",
    "sugestão de texto na tela",
    "sugestão de ritmo",
    "sugestão de cor/filtro"
  ]
}

REGRAS:
- Nunca conteúdo genérico
- Sempre mencione detalhes específicos da imagem
- Use linguagem direta e prática
- Foque em compartilhabilidade
- Mantenha o tema "${theme}" em TODOS os conteúdos gerados`;
}

async function analyzeAndGenerate(imageBuffer, mimeType, theme = 'dicas') {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const base64 = imageBuffer.toString('base64');
  const prompt = buildPrompt(theme);

  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType } },
    prompt
  ]);

  const text = result.response.text().trim();
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(clean);
}

module.exports = { analyzeAndGenerate };
