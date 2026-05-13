const { createClient } = require('@supabase/supabase-js');

// Extrai user_id do JWT do Supabase e coloca em req.userId
async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) { req.userId = null; return next(); }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    req.userId = error ? null : user?.id ?? null;
  } catch {
    req.userId = null;
  }
  next();
}

module.exports = authMiddleware;
