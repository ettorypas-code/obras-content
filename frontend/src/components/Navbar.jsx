import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Camera, BookOpen, CalendarDays, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Início' },
  { to: '/upload', icon: Camera, label: 'Analisar' },
  { to: '/library', icon: BookOpen, label: 'Biblioteca' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendário' }
];

export default function Navbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-stone-900/95 backdrop-blur border-t border-stone-800 z-50">
      <div className="flex">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? 'text-brand-500' : 'text-stone-500 hover:text-stone-300'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium text-stone-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={22} />
          Sair
        </button>
      </div>
    </nav>
  );
}
