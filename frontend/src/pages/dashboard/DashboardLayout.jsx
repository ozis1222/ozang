import { NavLink, Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const navItems = [
  { to: '/dashboard', label: '📊 Dashboard', end: true },
  { to: '/dashboard/orders', label: '📦 Siparişlerim' },
  { to: '/dashboard/favorites', label: '❤️ Favorilerim' },
  { to: '/dashboard/messages', label: '💬 Mesajlar' },
  { to: '/dashboard/wallet', label: '💰 Cüzdanım' },
  { to: '/dashboard/store', label: '🏪 Mağazam' },
  { to: '/dashboard/products', label: '🛍️ Ürünlerim' },
  { to: '/dashboard/profile', label: '👤 Profil' },
];

export default function DashboardLayout() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-56 shrink-0">
          <div className="card overflow-hidden">
            <div className="p-4 bg-blue-600 text-white">
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ffffff&color=3b82f6&size=80`}
                alt={user.name} className="w-12 h-12 rounded-full mb-2 border-2 border-white/30" />
              <p className="font-semibold truncate">{user.name}</p>
              <p className="text-blue-200 text-xs truncate">{user.email}</p>
            </div>
            <nav className="p-2">
              {navItems.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end}
                  className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm transition mb-0.5 ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
