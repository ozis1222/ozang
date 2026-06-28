import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import Spinner from '../components/common/Spinner';
import { formatPrice } from '../utils/helpers';

const categories = [
  { icon: '🎮', name: 'Oyun İtemi', slug: 'game_item', type: 'type' },
  { icon: '💾', name: 'Dijital', slug: 'digital', type: 'type' },
  { icon: '📱', name: 'Elektronik', slug: 'elektronik', type: 'category' },
  { icon: '👕', name: 'Giyim', slug: 'giyim', type: 'category' },
  { icon: '🃏', name: 'Koleksiyon', slug: 'koleksiyon', type: 'category' },
  { icon: '⚽', name: 'Spor', slug: 'spor', type: 'category' },
  { icon: '🏠', name: 'Ev & Yaşam', slug: 'ev-yasam', type: 'category' },
  { icon: '📚', name: 'Kitap', slug: 'kitap-muzik', type: 'category' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [f, r, s] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products?limit=12&sort=-createdAt'),
          api.get('/stores?limit=6&sort=-followerCount'),
        ]);
        setFeatured(f.data.products);
        setRecent(r.data.products);
        setStores(s.data.stores);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Alışverişin En Kolay Hali 🛍️
            </h1>
            <p className="text-blue-100 text-xl mb-8">
              Oyun iteminden dijital ürüne, ikinci elden elektroniğe — her şey burada.
              Güvenli öde, hızlı al.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition">
                Alışverişe Başla →
              </Link>
              <Link to="/dashboard/store/create" className="border-2 border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition">
                Mağaza Aç
              </Link>
            </div>
            <div className="flex gap-8 mt-10 text-sm">
              {[['1M+', 'Ürün'], ['50K+', 'Satıcı'], ['5M+', 'Kullanıcı'], ['%100', 'Güvenli']].map(([v, l]) => (
                <div key={l}><div className="text-2xl font-bold">{v}</div><div className="text-blue-200">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold mb-6">Kategoriler</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map(c => (
            <Link key={c.slug} to={`/products?${c.type}=${c.slug}`}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition group">
              <span className="text-3xl group-hover:scale-110 transition-transform">{c.icon}</span>
              <span className="text-xs font-medium text-gray-700 text-center">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {(loading || featured.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">⭐ Öne Çıkan Ürünler</h2>
            <Link to="/products?featured=true" className="text-blue-600 text-sm font-medium hover:underline">Tümünü Gör →</Link>
          </div>
          {loading ? <Spinner className="h-40" /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featured.slice(0, 6).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>
      )}

      {/* Recent */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🆕 Yeni Ürünler</h2>
          <Link to="/products" className="text-blue-600 text-sm font-medium hover:underline">Tümünü Gör →</Link>
        </div>
        {loading ? <Spinner className="h-40" /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recent.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Stores */}
      {stores.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">🏪 Popüler Mağazalar</h2>
            <Link to="/stores" className="text-blue-600 text-sm font-medium hover:underline">Tümünü Gör →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stores.map(s => (
              <Link key={s._id} to={`/stores/${s.slug || s._id}`}
                className="card p-4 flex flex-col items-center text-center hover:shadow-md transition group">
                <img src={s.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=3b82f6&color=fff&size=80`}
                  alt={s.name} className="w-16 h-16 rounded-full object-cover mb-3 group-hover:scale-105 transition-transform" />
                <p className="font-semibold text-sm truncate w-full">{s.name} {s.isVerified && '✓'}</p>
                <p className="text-xs text-gray-500">{s.followerCount} takipçi</p>
                <p className="text-xs text-gray-500">{s.totalSales} satış</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">Satmaya Başla, Para Kazan! 💰</h2>
          <p className="text-orange-100 mb-6">Mağazanı aç, ürünlerini ekle, siparişleri yönet. Sadece %7 komisyon.</p>
          <Link to="/dashboard/store/create" className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition inline-block">
            Ücretsiz Mağaza Aç
          </Link>
        </div>
      </section>
    </div>
  );
}
