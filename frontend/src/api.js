import axios from 'axios';
import { supabase } from './lib/supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
});

// Injeta token do usuário em todas as requisições
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return config;
});

export const analyzeImage = (files, theme = 'dicas') => {
  const form = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];
  // 'images' = novo backend (multi-foto) | 'image' = retrocompat com backend antigo
  fileArray.forEach(f => form.append('images', f));
  form.append('image', fileArray[0]); // backward compat
  form.append('theme', theme);
  return api.post('/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getLibrary = () => api.get('/library');
export const saveContent = (id, saved) => api.patch(`/library/${id}/save`, { saved });
export const deleteContent = (id) => api.delete(`/library/${id}`);

export const getCalendar = () => api.get('/calendar');
export const createEvent = (data) => api.post('/calendar', data);
export const updateEvent = (id, data) => api.patch(`/calendar/${id}`, data);
export const deleteEvent = (id) => api.delete(`/calendar/${id}`);

export const generateBio = (profile) => api.post('/bio', profile);

export const saveMetrics = (id, data) => api.post(`/metrics/${id}`, data);
export const getMetrics = (id) => api.get(`/metrics/${id}`);

export default api;
