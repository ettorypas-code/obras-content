const { GoogleGenerativeAI } = require('@google/generative-ai');

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada no arquivo .env');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const THEME_CONTEXT = {
  erros:        { label: 'Erros de Obra',      instruction: 'Foque EXCLUSIVAMENTE em identificar erros visíveis, falhas de execução e riscos de retrabalho. Calcule o custo estimado do erro. Todo conteúdo deve alertar sobre o problema e ensinar como evitar. Tom: alerta e educativo.' },
  dicas:        { label: 'Dicas Técnicas',      instruction: 'Foque em extrair dicas práticas e ensinamentos técnicos da imagem. Ensine algo específico que o profissional aprendeu. Tom: didático e acessível.' },
  corretor:     { label: 'Para Corretores',     instruction: 'Foque em VALORIZAÇÃO IMOBILIÁRIA. Mostre como a qualidade construtiva impacta o preço do imóvel. Conteúdo voltado para corretores e compradores de imóveis. Tom: vendedor e persuasivo. Mencione valorização de m², diferencial de venda, segurança do investimento.' },
  engenheiro:   { label: 'Visão do Engenheiro', instruction: 'Foque em ANÁLISE TÉCNICA APROFUNDADA com terminologia da engenharia civil. Cite normas ABNT, patologias construtivas, especificações técnicas. Tom: técnico e preciso, voltado para engenheiros e arquitetos.' },
  custo:        { label: 'Economia & Custos',   instruction: 'Foque em VALORES e ECONOMIA. Estime custos reais, compare opções, mostre quanto o erro ou a boa prática custa. Use valores em R$. Tom: revelador e prático, voltado para donos de obra.' },
  seguranca:    { label: 'Segurança na Obra',   instruction: 'Foque em RISCOS e SEGURANÇA. Identifique todos os riscos visíveis, cite a NR correspondente se aplicável, explique as consequências. Tom: urgente e responsável, voltado para gestores de obra e trabalhadores.' },
  antes_depois: { label: 'Antes/Depois',        instruction: 'Foque na TRANSFORMAÇÃO e no PROCESSO. Explore a evolução da obra, o contraste visual, a narrativa de progresso. Tom: inspirador e narrativo, ideal para mostrar resultados.' },
  bastidores:   { label: 'Bastidores',          instruction: 'Foque no DIA A DIA e na ROTINA DE OBRA. Humanize o trabalho, mostre o esforço por trás do resultado, conte a história das pessoas. Tom: autêntico e próximo, ideal para criar conexão com seguidores.' }
};

function buildPrompt(theme, imageCount) {
  const t = THEME_CONTEXT[theme] || THEME_CONTEXT.dicas;
  const multiNote = imageCount > 1 ? `\nFOTOS ENVIADAS: ${imageCount} imagens. Analise TODAS e crie conteúdo que explore o conjunto (comparativo, sequência, diferentes ângulos).` : '';

  return `Você é um especialista em conteúdo VIRAL para Instagram e TikTok focado em construção civil brasileira.

TEMA OBRIGATÓRIO: "${t.label}"
INSTRUÇÃO DO TEMA: ${t.instruction}${multiNote}

IMPORTANTE: TODO o conteúdo gerado (ideias, roteiros, legendas) DEVE estar alinhado ao tema "${t.label}". Não gere conteúdo genérico.

Analise a(s) imagem(ns) e retorne APENAS JSON válido, sem markdown, com esta estrutura exata:

{
  "context": "descrição específica do que aparece na(s) imagem(ns)",
  "opportunity": "oportunidade de conteúdo alinhada ao tema ${t.label}",
  "potential": "alto",
  "potential_reasons": ["razão 1 ligada ao tema", "razão 2", "razão 3"],
  "improvement_tips": ["dica 1 alinhada ao tema", "dica 2", "dica 3"],
  "ideas": [
    {"title": "ideia impactante alinhada ao tema ${t.label}", "format": "Reels/TikTok", "potential": "alto"},
    {"title": "ideia 2 alinhada ao tema", "format": "Carrossel", "potential": "alto"},
    {"title": "ideia 3", "format": "Reels curto", "potential": "medio"},
    {"title": "ideia 4", "format": "Stories", "potential": "medio"},
    {"title": "ideia 5", "format": "Vídeo longo", "potential": "baixo"}
  ],
  "scripts": [
    {
      "title": "Roteiro Reels/TikTok (60s)",
      "hook": "gancho dos primeiros 3s alinhado ao tema ${t.label}",
      "development": "desenvolvimento com detalhes específicos da imagem e do tema",
      "retention": "reviravolta ou dado surpresa para manter atenção",
      "cta": "chamada para ação direta"
    },
    {
      "title": "Roteiro Carrossel (8 slides)",
      "hook": "título da capa impactante alinhado ao tema",
      "development": "descrição dos slides 2 a 7",
      "retention": "slide de impacto",
      "cta": "slide final com chamada para ação"
    }
  ],
  "captions": {
    "instagram": "legenda completa no estilo do tema ${t.label}, com emojis e 10 hashtags de construção civil",
    "tiktok": "legenda curta no estilo do tema com 4 hashtags trending"
  },
  "editing_suggestions": [
    "sugestão de corte/enquadramento",
    "sugestão de trilha sonora",
    "sugestão de texto na tela",
    "sugestão de ritmo",
    "sugestão de cor/filtro"
  ]
}`;
}

async function analyzeAndGenerate(images, theme = 'dicas') {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Suporta array de imagens ou imagem única (retrocompatibilidade)
  const imageArray = Array.isArray(images) ? images : [{ buffer: images, mimeType: 'image/jpeg' }];

  const prompt = buildPrompt(theme, imageArray.length);

  const parts = [
    ...imageArray.map(img => ({
      inlineData: { data: img.buffer.toString('base64'), mimeType: img.mimeType }
    })),
    prompt
  ];

  const result = await model.generateContent(parts);
  const text = result.response.text().trim();
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(clean);
}

async function analyzeTextOnly(situation, theme = 'dicas') {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const t = THEME_CONTEXT[theme] || THEME_CONTEXT.dicas;

  const prompt = `Você é um especialista em conteúdo VIRAL para Instagram e TikTok focado em construção civil brasileira.

SITUAÇÃO DESCRITA PELO PROFISSIONAL: "${situation}"

TEMA OBRIGATÓRIO: "${t.label}"
INSTRUÇÃO DO TEMA: ${t.instruction}

IMPORTANTE: Crie conteúdo baseado apenas na descrição acima, sem imagem. TODO o conteúdo DEVE estar alinhado ao tema "${t.label}".

Retorne APENAS JSON válido, sem markdown, com esta estrutura exata:

{
  "context": "resumo do que aconteceu na obra",
  "opportunity": "oportunidade de conteúdo alinhada ao tema ${t.label}",
  "potential": "alto",
  "potential_reasons": ["razão 1", "razão 2", "razão 3"],
  "improvement_tips": ["dica 1", "dica 2", "dica 3"],
  "ideas": [
    {"title": "ideia 1 alinhada ao tema", "format": "Reels/TikTok", "potential": "alto"},
    {"title": "ideia 2", "format": "Carrossel", "potential": "alto"},
    {"title": "ideia 3", "format": "Reels curto", "potential": "medio"},
    {"title": "ideia 4", "format": "Stories", "potential": "medio"},
    {"title": "ideia 5", "format": "Vídeo longo", "potential": "baixo"}
  ],
  "scripts": [
    {
      "title": "Roteiro Reels/TikTok (60s)",
      "hook": "gancho dos primeiros 3s alinhado ao tema ${t.label}",
      "development": "desenvolvimento com detalhes da situação",
      "retention": "reviravolta ou dado surpresa",
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
    "instagram": "legenda completa no estilo do tema ${t.label}, com emojis e 10 hashtags de construção civil",
    "tiktok": "legenda curta no estilo do tema com 4 hashtags trending"
  },
  "editing_suggestions": [
    "sugestão de abertura/gancho visual",
    "sugestão de trilha sonora",
    "sugestão de texto na tela",
    "sugestão de ritmo",
    "sugestão de cor/filtro"
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(clean);
}

module.exports = { analyzeAndGenerate, analyzeTextOnly };
