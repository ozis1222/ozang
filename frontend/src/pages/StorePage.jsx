import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import ProductCard from '../components/common/ProductCard';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import { formatRelative } from '../utils/helpers';

export default function StorePage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('products');

  useEffect(() => {
    Promise.all([
      api.get(`/stores/${id}`),
      api.get(`/reviews?type=store&targetId=${id}`),
    ]).then(([s, r]) => {
      setStore(s.data.store);
      setProducts(s.data.products);
      setIsFollowing(s.data.isFollowing);
      setReviews(r.data.reviews);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    if (!user) { toast.error('Takip etmek için giriş yapın'); return; }
    try {
      const { data } = await api.post(`/stores/${store._id}/follow`);
      setIsFollowing(data.isFollowing);
      setStore(s => ({ ...s, followerCount: data.followerCount }));
      toast.success(data.isFollowing ? 'Mağaza takip ediliyor' : 'Takipten çıkıldı');
    } catch {}
  };

  if (loading) return <Spinner className="h-screen" size="lg" />;
  if (!store) return <div className="text-center py-20">Mağaza bulunamadı</div>;

  return (
    <div>
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
        {store.banner && <img src={store.banner} alt="" className="w-full h-full object-cover" />}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Store Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-6">
          <img src={store.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&size=100&background=3b82f6&color=fff`}
            alt={store.name} className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover bg-white" />
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{store.name}</h1>
              {store.isVerified && <span className="badge badge-blue">✓ Doğrulanmış</span>}
            </div>
            <p className="text-gray-600 text-sm mt-1 max-w-lg">{store.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
              <span>👥 {store.followerCount} takipçi</span>
              <span>📦 {store.productCount} ürün</span>
              <span>🛒 {store.totalSales} satış</span>
              <span>⭐ {store.ratingCount > 0 ? (store.rating / store.ratingCount).toFixed(1) : '—'}</span>
            </div>
          </div>
          <button onClick={handleFollow}
            className={`shrink-0 py-2 px-5 rounded-xl font-medium transition ${isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {isFollowing ? '✓ Takip Ediliyor' : '+ Takip Et'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {[['products', '📦 Ürünler'], ['reviews', '⭐ Yorumlar']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'products' && (
          products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Henüz ürün yok</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )
        )}

        {tab === 'reviews' && (
          <div className="max-w-2xl mb-10">
            {reviews.length === 0 ? (
              <div className="text-center py-16 text-gray-500">Henüz yorum yok</div>
            ) : reviews.map(r => (
              <div key={r._id} className="card p-5 mb-4">
                <div className="flex items-start gap-3">
                  <img src={r.reviewer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.reviewer?.name || 'K')}`}
                    alt="" className="w-9 h-9 rounded-full" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{r.reviewer?.name}</span>
                      <span className="text-gray-400 text-xs">{formatRelative(r.createdAt)}</span>
                    </div>
                    <div className="text-yellow-400 text-sm mb-1">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                    <p className="text-gray-700 text-sm">{r.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
