require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const analyzeRouter = require('./routes/analyze');
const libraryRouter = require('./routes/library');
const calendarRouter = require('./routes/calendar');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/analyze', analyzeRouter);
app.use('/api/library', libraryRouter);
app.use('/api/calendar', calendarRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`\n🏗️  ObrasContent Backend rodando em http://localhost:${PORT}`);
  const missing = ['GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'].filter(k => !process.env[k]);
  if (missing.length) console.warn('⚠️  Variáveis faltando no .env:', missing.join(', '));
});
