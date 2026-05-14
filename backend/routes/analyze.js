const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../database');
const { analyzeAndGenerate } = require('../services/openai');

const router = express.Router();

// upload.any() aceita qualquer campo e qualquer tipo — sem fileFilter
// que rejeitava silenciosamente arquivos sem extensão (iOS envia "image" sem .jpg)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB — segurança caso compressão não rode
});

router.post('/', upload.any(), async (req, res) => {
  // Log de diagnóstico (aparece nos logs do Railway)
  console.log('[analyze] files recebidos:', req.files?.length, req.files?.map(f => f.fieldname + ':' + f.originalname + ':' + f.mimetype));
  console.log('[analyze] body keys:', Object.keys(req.body || {}));

  // Aceita arquivos de qualquer field name (images, image, file, etc.)
  const files = (req.files || []).filter(f => f.mimetype.startsWith('image/'));

  if (!files.length) {
    return res.status(400).json({
      error: 'Nenhuma imagem enviada.',
      debug: { filesRaw: req.files?.length || 0 }
    });
  }

  try {
    const theme = req.body.theme || 'dicas';

    const mainFile = files[0];
    const ext = path.extname(mainFile.originalname) || '.jpg';
    const filename = `${Date.now()}${ext}`;
    const imageUrl = await db.uploadImage(mainFile.buffer, filename, mainFile.mimetype);

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
    console.error('[analyze] erro:', err);
    res.status(500).json({ error: err.message || 'Erro ao analisar imagem.' });
  }
});

module.exports = router;
