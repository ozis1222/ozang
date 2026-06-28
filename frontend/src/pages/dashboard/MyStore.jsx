import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function MyStore() {
  const [store, setStore] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/stores/my').catch(() => ({ data: { store: null } })),
      api.get('/stores/my/stats').catch(() => ({ data: { stats: null } })),
      api.get('/products?limit=50').catch(() => ({ data: { products: [] } })),
    ]).then(([s, st, p]) => {
      setStore(s.data.store);
      setStats(st.data.stats);
      setProducts(p.data.products);
      if (s.data.store) setForm({ name: s.data.store.name, description: s.data.store.description || '' });
    }).finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/stores', form);
      setStore(data.store);
      setEditing(false);
      toast.success('Mağaza güncellendi');
    } catch (err) { toast.error(err.response?.data?.message || 'Hata'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/stores', form);
      setStore(data.store);
      toast.success('Mağaza oluşturuldu! 🎉');
    } catch (err) { toast.error(err.response?.data?.message || 'Hata'); }
  };

  if (loading) return <Spinner className="h-40" />;

  if (!store) return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">🏪 Mağaza Oluştur</h1>
      <div className="card p-6">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mağaza Adı *</label>
            <input required value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})}
              className="input" placeholder="Benzersiz bir mağaza adı seçin" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Açıklama</label>
            <textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})}
              className="input h-28 resize-none" placeholder="Mağazanızı tanıtın..." />
          </div>
          <button type="submit" className="btn-primary w-full py-3">Mağaza Oluştur 🚀</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🏪 Mağazam</h1>
        <div className="flex gap-2">
          <Link to={`/stores/${store.slug || store._id}`} className="btn-outline text-sm">Mağazayı Gör →</Link>
          <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm">✏️ Düzenle</button>
        </div>
      </div>

      {editing && (
        <div className="card p-5">
          <h2 className="font-bold mb-4">Mağaza Bilgilerini Düzenle</h2>
          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Mağaza Adı</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Açıklama</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="input mt-1 h-24 resize-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Kaydet</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-outline">İptal</button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Satış', value: stats.totalSales, icon: '🛒' },
            { label: 'Toplam Gelir', value: formatPrice(stats.totalRevenue || 0), icon: '💰' },
            { label: 'Görüntülenme', value: stats.totalViews, icon: '👁️' },
            { label: 'Takipçi', value: store.followerCount, icon: '👥' },
            { label: 'Bu Ay Sipariş', value: stats.monthlyOrders, icon: '📦' },
            { label: 'Bu Ay Gelir', value: formatPrice(stats.monthlyRevenue || 0), icon: '📈' },
            { label: 'Ürün Sayısı', value: products.length, icon: '🏷️' },
            { label: 'Büyüme', value: `${stats.revenueGrowth}%`, icon: '📊' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-bold text-lg">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Products */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold">Ürünlerim ({products.length})</h2>
          <Link to="/dashboard/products/new" className="btn-primary text-sm py-1.5">+ Ürün Ekle</Link>
        </div>
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-4xl mb-3">🛍️</p>
            <p>Henüz ürün eklenmedi</p>
            <Link to="/dashboard/products/new" className="btn-primary mt-3 inline-block">İlk Ürünü Ekle</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {products.slice(0, 10).map(p => (
              <div key={p._id} className="flex items-center gap-3 p-4">
                <img src={p.images?.[0]?.url || `https://placehold.co/48x48/e2e8f0/64748b?text=?`}
                  alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.sales} satış • {p.stock.status === 'available' ? '✅ Stokta' : '❌ Stok Yok'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{formatPrice(p.price)}</p>
                  <Link to={`/dashboard/products/${p._id}/edit`} className="text-xs text-gray-500 hover:text-blue-600">Düzenle</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
