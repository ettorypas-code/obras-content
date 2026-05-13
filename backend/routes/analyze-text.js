const express = require('express');
const router = express.Router();
const db = require('../database');
const { analyzeTextOnly } = require('../services/openai');

router.post('/', async (req, res) => {
  const { situation, theme = 'dicas' } = req.body;
  if (!situation?.trim()) return res.status(400).json({ error: 'Descreva a situação da obra.' });

  try {
    const result = await analyzeTextOnly(situation.trim(), theme);
    const userId = req.userId || null;

    const analysisId = await db.insertAnalysis({
      user_id: userId,
      image_path: null,
      image_url: null,
      context: result.context,
      opportunity: result.opportunity,
      potential: result.potential,
      potential_reasons: result.potential_reasons,
      improvement_tips: result.improvement_tips
    });

    const contentId = await db.insertContent({
      user_id: userId,
      analysis_id: analysisId,
      theme,
      ideas: result.ideas,
      scripts: result.scripts,
      caption_instagram: result.captions.instagram,
      caption_tiktok: result.captions.tiktok,
      editing_suggestions: result.editing_suggestions
    });

    res.json({
      id: contentId,
      analysisId,
      imageUrl: null,
      context: result.context,
      opportunity: result.opportunity,
      potential: result.potential,
      potential_reasons: result.potential_reasons,
      improvement_tips: result.improvement_tips,
      ideas: result.ideas,
      scripts: result.scripts,
      captions: result.captions,
      editing_suggestions: result.editing_suggestions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Erro ao gerar conteúdo.' });
  }
});

module.exports = router;
