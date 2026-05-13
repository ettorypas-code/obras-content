const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_KEY precisam estar no .env');
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
}

const db = {
  async insertAnalysis(data) {
    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from('analyses')
      .insert(data)
      .select('id')
      .single();
    if (error) throw error;
    return row.id;
  },

  async insertContent(data) {
    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from('content_items')
      .insert(data)
      .select('id')
      .single();
    if (error) throw error;
    return row.id;
  },

  async getContents(userId) {
    const supabase = getSupabase();
    let query = supabase
      .from('content_items')
      .select('*, analyses(image_url, context, opportunity, potential)')
      .order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data.map(item => ({
      ...item,
      image_url: item.analyses?.image_url,
      context: item.analyses?.context,
      opportunity: item.analyses?.opportunity,
      potential: item.analyses?.potential
    }));
  },

  async updateContentSaved(id, saved) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('content_items')
      .update({ saved })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteContent(id) {
    const supabase = getSupabase();
    const { error } = await supabase.from('content_items').delete().eq('id', id);
    if (error) throw error;
  },

  async getEvents(userId) {
    const supabase = getSupabase();
    let query = supabase
      .from('calendar_events')
      .select('*')
      .order('date', { ascending: true });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async insertEvent(data) {
    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from('calendar_events')
      .insert({ ...data, status: data.status || 'pendente' })
      .select('id')
      .single();
    if (error) throw error;
    return row.id;
  },

  async updateEvent(id, fields) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('calendar_events')
      .update(fields)
      .eq('id', id);
    if (error) throw error;
  },

  async deleteEvent(id) {
    const supabase = getSupabase();
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) throw error;
  },

  async uploadImage(buffer, filename, mimetype) {
    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from('obra-images')
      .upload(filename, buffer, { contentType: mimetype, upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('obra-images').getPublicUrl(filename);
    return data.publicUrl;
  }
};

module.exports = db;
