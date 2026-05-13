const express = require('express');
const multer = require('multer');
const path = require('path');
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

router.post('/', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'image',  maxCount: 1 }
]), async (req, res) => {
  const files = (req.files?.images || req.files?.image || []);
  if (!files || files.length === 0) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

  try {
    const theme = req.body.theme || 'dicas';

    // Upload da primeira imagem como capa; demais são contexto adicional
    const mainFile = files[0];
    const filename = `${Date.now()}${path.extname(mainFile.originalname)}`;
    const imageUrl = await db.uploadImage(mainFile.buffer, filename, mainFile.mimetype);

    // Monta array de imagens para o Gemini
    const images = files.map(f => ({ buffer: f.buffer, mimeType: f.mimetype }));
    const result = await analyzeAndGenerate(images, theme);

    const userId = req.userId || null;

    const analysisId = await db.insertAnalysis({
      user_id: userId,
      image_path: filename,
      image_url: imageUrl,
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
