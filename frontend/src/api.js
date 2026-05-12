import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
});

export const analyzeImage = (file) => {
  const form = new FormData();
  form.append('image', file);
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

export default api;
