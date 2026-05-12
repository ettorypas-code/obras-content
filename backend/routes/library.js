const express = require('express');
const db = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.getContents());
});

router.patch('/:id/save', (req, res) => {
  db.updateContentSaved(req.params.id, req.body.saved);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.deleteContent(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
