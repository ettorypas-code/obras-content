const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await db.getEvents(req.userId);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const id = await db.insertEvent({ ...req.body, user_id: req.userId });
    res.json({ id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', async (req, res) => {
  try {
    await db.updateEvent(req.params.id, req.body);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.deleteEvent(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
