import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useCartStore from '../../store/useCartStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const cartCount = useCartStore(s => s.count());
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🛍️</span>
            <span className="font-bold text-xl text-blue-600 hidden sm:block">Pazaryeri</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Ürün, mağaza veya kategori ara..."
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`}
                    alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {[
                      { to: '/dashboard', label: '📊 Dashboard' },
                      { to: '/dashboard/orders', label: '📦 Siparişlerim' },
                      { to: '/dashboard/favorites', label: '❤️ Favorilerim' },
                      { to: '/dashboard/messages', label: '💬 Mesajlar' },
                      { to: '/dashboard/wallet', label: '💰 Cüzdanım' },
                      { to: '/dashboard/store', label: '🏪 Mağazam' },
                      ...(user.role === 'admin' ? [{ to: '/admin', label: '⚙️ Admin Panel' }] : []),
                    ].map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{item.label}</Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1">
                      <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">🚪 Çıkış Yap</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-outline text-sm py-1.5 px-3">Giriş</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-3 hidden sm:inline-flex">Üye Ol</Link>
              </div>
            )}
          </div>
        </div>

        {/* Category bar */}
        <div className="flex items-center gap-6 pb-2 overflow-x-auto scrollbar-hide text-sm">
          {[
            { to: '/products?type=game_item', icon: '🎮', label: 'Oyun İtemi' },
            { to: '/products?type=digital', icon: '💾', label: 'Dijital' },
            { to: '/products?category=elektronik', icon: '📱', label: 'Elektronik' },
            { to: '/products?category=giyim', icon: '👕', label: 'Giyim' },
            { to: '/products?category=koleksiyon', icon: '🃏', label: 'Koleksiyon' },
            { to: '/products?category=spor', icon: '⚽', label: 'Spor' },
            { to: '/products?category=ev-yasam', icon: '🏠', label: 'Ev & Yaşam' },
            { to: '/stores', icon: '🏪', label: 'Mağazalar' },
          ].map(c => (
            <Link key={c.to} to={c.to} className="flex items-center gap-1 whitespace-nowrap text-gray-600 hover:text-blue-600 py-1 border-b-2 border-transparent hover:border-blue-600 transition-colors">
              <span>{c.icon}</span><span>{c.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
