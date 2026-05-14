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

// Comprime imagem para max 1200px / JPEG 80% — reduz de 20MB para ~300KB
function compressImage(file, maxSize = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })),
        'image/jpeg', quality
      );
    };
    img.onerror = () => resolve(file); // fallback sem compressão
    img.src = URL.createObjectURL(file);
  });
}

export const analyzeImage = async (files, theme = 'dicas') => {
  const fileArray = Array.isArray(files) ? files : [files];
  // Comprime todas antes de enviar
  const compressed = await Promise.all(fileArray.map(f => compressImage(f)));
  const form = new FormData();
  compressed.forEach(f => form.append('images', f));
  form.append('theme', theme);
  return api.post('/analyze', form);
};

export const getLibrary = () => api.get('/library');
export const saveContent = (id, saved) => api.patch(`/library/${id}/save`, { saved });
export const deleteContent = (id) => api.delete(`/library/${id}`);

export const getCalendar = () => api.get('/calendar');
export const createEvent = (data) => api.post('/calendar', data);
export const updateEvent = (id, data) => api.patch(`/calendar/${id}`, data);
export const deleteEvent = (id) => api.delete(`/calendar/${id}`);

export const analyzeText = (situation, theme = 'dicas') =>
  api.post('/analyze-text', { situation, theme });

export const generateSequence = (topic, theme = 'dicas') =>
  api.post('/sequence', { topic, theme });

export const generateBio = (profile) => api.post('/bio', profile);

export const saveMetrics = (id, data) => api.post(`/metrics/${id}`, data);
export const getMetrics = (id) => api.get(`/metrics/${id}`);
export const getAllMetrics = () => api.get('/metrics');

export default api;
