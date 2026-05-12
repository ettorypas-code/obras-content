const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada no arquivo .env');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
  return map[ext] || 'image/jpeg';
}

const PROMPT = `Você é um especialista em conteúdo para Instagram e TikTok focado EXCLUSIVAMENTE em construção civil brasileira.

Analise esta imagem de obra e retorne um JSON com EXATAMENTE esta estrutura (sem markdown, sem texto extra):

{
  "context": "descrição específica do que aparece na imagem",
  "opportunity": "oportunidade de conteúdo (erro, custo, curiosidade, técnica)",
  "potential": "alto",
  "potential_reasons": ["razão 1", "razão 2", "razão 3"],
  "improvement_tips": ["dica 1", "dica 2", "dica 3"],
  "ideas": [
    {"title": "ideia 1 com custo ou problema específico", "format": "Reels/TikTok", "potential": "alto"},
    {"title": "ideia 2", "format": "Carrossel", "potential": "alto"},
    {"title": "ideia 3", "format": "Reels curto", "potential": "medio"},
    {"title": "ideia 4", "format": "Stories", "potential": "medio"},
    {"title": "ideia 5", "format": "Vídeo longo", "potential": "baixo"}
  ],
  "scripts": [
    {
      "title": "Roteiro Reels/TikTok (60s)",
      "hook": "frase impactante para os primeiros 3 segundos com problema ou custo específico",
      "development": "desenvolvimento com pontos específicos da imagem",
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
- Sempre mencione erros, custos ou problemas específicos da imagem
- Use linguagem direta e prática
- Foque em compartilhabilidade`;

async function analyzeAndGenerate(imageBuffer, mimeType) {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const base64 = imageBuffer.toString('base64');

  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType } },
    PROMPT
  ]);

  const text = result.response.text().trim();
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(clean);
}

module.exports = { analyzeAndGenerate };
