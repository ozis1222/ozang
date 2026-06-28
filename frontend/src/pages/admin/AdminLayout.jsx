import { NavLink, Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const navItems = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/users', label: '👥 Kullanıcılar' },
  { to: '/admin/stores', label: '🏪 Mağazalar' },
  { to: '/admin/products', label: '📦 Ürünler' },
  { to: '/admin/orders', label: '🛒 Siparişler' },
  { to: '/admin/categories', label: '🗂️ Kategoriler' },
];

export default function AdminLayout() {
  const { user } = useAuthStore();
  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-900 text-white shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="text-lg font-bold">⚙️ Admin Panel</div>
          <div className="text-gray-400 text-xs mt-1">{user.name}</div>
        </div>
        <nav className="p-2 flex-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `block px-3 py-2.5 rounded-lg text-sm mb-0.5 transition ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <NavLink to="/" className="text-gray-400 text-sm hover:text-white">← Siteye Dön</NavLink>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
