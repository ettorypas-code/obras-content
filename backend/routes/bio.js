const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/', async (req, res) => {
  try {
    const { name, role, goal, platform } = req.body;
    if (!name || !role) return res.status(400).json({ error: 'name e role são obrigatórios' });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const platformLabel = platform === 'tiktok' ? 'TikTok' : platform === 'ambas' ? 'Instagram e TikTok' : 'Instagram';
    const goalMap = { clientes: 'atrair clientes', autoridade: 'ganhar autoridade', seguidores: 'crescer seguidores', marca: 'construir marca pessoal' };
    const roleMap = { engenheiro: 'Engenheiro Civil', consultor: 'Consultor de Obras', incorporador: 'Incorporador', mestre: 'Mestre de Obras', arquiteto: 'Arquiteto', outro: 'Profissional de construção' };

    const prompt = `Crie 3 opções de bio para ${platformLabel} para um profissional de construção civil.

Dados do perfil:
- Nome: ${name}
- Profissão: ${roleMap[role] || role}
- Objetivo principal: ${goalMap[goal] || goal}

Regras para cada bio:
- Máximo 150 caracteres
- Use emojis estratégicos (1-3 no máximo)
- Inclua um diferencial claro
- Seja direto e impactante
- Varie o estilo: 1 profissional, 1 informal, 1 com CTA

Responda APENAS com JSON válido, sem markdown:
{"bios": ["bio1", "bio2", "bio3"]}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
    const json = JSON.parse(text);

    res.json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
