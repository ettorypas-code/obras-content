const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

// GET /api/metrics — busca todos os conteúdos com métricas do usuário
router.get('/', async (req, res) => {
  try {
    const db = require('../database');
    const data = await db.getContentsWithMetrics(req.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/metrics/:id — salva métricas de um conteúdo
router.post('/:id', async (req, res) => {
  try {
    const { views, likes, comments, saves, platform, posted_at } = req.body;
    const supabase = getSupabase();
    const { error } = await supabase
      .from('content_metrics')
      .upsert({ content_id: req.params.id, views, likes, comments, saves, platform, posted_at }, { onConflict: 'content_id,platform' });
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/metrics/:id — busca métricas de um conteúdo
router.get('/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('content_metrics')
      .select('*')
      .eq('content_id', req.params.id);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
