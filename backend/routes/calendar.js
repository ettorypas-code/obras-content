const express = require('express');
const db = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.getEvents());
});

router.post('/', (req, res) => {
  const id = db.insertEvent(req.body);
  res.json({ id });
});

router.patch('/:id', (req, res) => {
  db.updateEvent(req.params.id, req.body);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.deleteEvent(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
