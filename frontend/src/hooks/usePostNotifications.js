import { useEffect } from 'react';
import { getCalendar } from '../api';

export function usePostNotifications() {
  useEffect(() => {
    if (!('Notification' in window)) return;

    const run = async () => {
      const permission = Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission;

      if (permission !== 'granted') return;

      const today = new Date().toISOString().split('T')[0];
      const shownKey = `obras_notif_${today}`;
      if (localStorage.getItem(shownKey)) return;

      try {
        const res = await getCalendar();
        const todayEvents = res.data.filter(e => e.date === today && e.status !== 'publicado');
        if (todayEvents.length === 0) return;

        const titles = todayEvents.map(e => e.title || 'Post').join(', ');
        new Notification('ObrasContent — Posts de hoje 🏗️', {
          body: todayEvents.length === 1
            ? `Você tem 1 post agendado: ${titles}`
            : `Você tem ${todayEvents.length} posts agendados hoje`,
          icon: '/icon-192.png'
        });

        localStorage.setItem(shownKey, '1');
      } catch {}
    };

    run();
  }, []);
}
