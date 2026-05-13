const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { analyzeAndGenerate } = require('../services/openai');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|heic/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

  try {
    const filename = `${Date.now()}${path.extname(req.file.originalname)}`;
    const imageUrl = await db.uploadImage(req.file.buffer, filename, req.file.mimetype);

    const theme = req.body.theme || 'dicas';
    const result = await analyzeAndGenerate(req.file.buffer, req.file.mimetype, theme);

    const analysisId = await db.insertAnalysis({
      image_path: filename,
      image_url: imageUrl,
      context: result.context,
      opportunity: result.opportunity,
      potential: result.potential,
      potential_reasons: result.potential_reasons,
      improvement_tips: result.improvement_tips
    });

    const contentId = await db.insertContent({
      analysis_id: analysisId,
      ideas: result.ideas,
      scripts: result.scripts,
      caption_instagram: result.captions.instagram,
      caption_tiktok: result.captions.tiktok,
      editing_suggestions: result.editing_suggestions
    });

    res.json({
      id: contentId,
      analysisId,
      contentId,
      imageUrl,
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
    res.status(500).json({ error: err.message || 'Erro ao analisar imagem.' });
  }
});

module.exports = router;
