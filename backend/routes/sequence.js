const express = require('express');
const router = express.Router();
const { generateSequence } = require('../services/openai');

router.post('/', async (req, res) => {
  const { topic, theme = 'dicas' } = req.body;
  if (!topic?.trim()) return res.status(400).json({ error: 'Informe o tópico da série.' });
  try {
    const result = await generateSequence(topic.trim(), theme);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Erro ao gerar série.' });
  }
});

module.exports = router;
