import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Camera, BookOpen, CalendarDays, User } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Início' },
  { to: '/upload', icon: Camera, label: 'Analisar' },
  { to: '/library', icon: BookOpen, label: 'Biblioteca' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendário' },
  { to: '/profile', icon: User, label: 'Perfil' }
];

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-50"
      style={{
        background: 'rgba(28,28,30,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}>
      <div className="flex">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 pt-3 pb-2 text-[10px] font-medium transition-all ${
                isActive ? '' : 'opacity-40 hover:opacity-70'
              }`
            }
            style={({ isActive }) => ({ color: isActive ? 'var(--orange)' : 'var(--label)' })}>
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
