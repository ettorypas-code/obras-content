const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await db.getContents(req.userId);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/save', async (req, res) => {
  try {
    await db.updateContentSaved(req.params.id, req.body.saved);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.deleteContent(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
