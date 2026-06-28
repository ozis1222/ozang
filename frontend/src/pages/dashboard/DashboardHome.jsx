import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';
import { formatPrice, formatRelative, statusLabel } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';

export default function DashboardHome() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders?limit=5'),
      api.get('/stores/my').catch(() => ({ data: { store: null } })),
    ]).then(([o, s]) => {
      setOrders(o.data.orders);
      setStore(s.data.store);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="h-40" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Merhaba, {user.name.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Hesabınızın genel durumu</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cüzdan', value: formatPrice(user.wallet || 0), icon: '💰', color: 'blue' },
          { label: 'Toplam Alım', value: user.totalPurchases || 0, icon: '🛒', color: 'green' },
          { label: 'Toplam Satış', value: user.totalSales || 0, icon: '📈', color: 'orange' },
          { label: 'Puan', value: user.ratingCount > 0 ? (user.rating / user.ratingCount).toFixed(1) : '—', icon: '⭐', color: 'yellow' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Store CTA */}
      {!store ? (
        <div className="card p-6 border-2 border-dashed border-blue-200 text-center">
          <div className="text-4xl mb-3">🏪</div>
          <h2 className="text-xl font-bold mb-1">Mağazanızı Açın</h2>
          <p className="text-gray-500 text-sm mb-4">Ürünlerinizi satmaya hemen başlayın!</p>
          <Link to="/dashboard/store/create" className="btn-primary">Mağaza Aç</Link>
        </div>
      ) : (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">🏪 Mağazam</h2>
            <Link to="/dashboard/store" className="text-blue-600 text-sm hover:underline">Yönet →</Link>
          </div>
          <div className="flex items-center gap-3">
            <img src={store.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=3b82f6&color=fff`}
              alt="" className="w-12 h-12 rounded-xl object-cover" />
            <div>
              <p className="font-semibold">{store.name} {store.isVerified && '✓'}</p>
              <p className="text-sm text-gray-500">{store.totalSales} satış • {store.followerCount} takipçi</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold">Son Siparişler</h2>
          <Link to="/dashboard/orders" className="text-blue-600 text-sm hover:underline">Tümü →</Link>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Henüz sipariş yok</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map(o => {
              const st = statusLabel[o.status];
              return (
                <Link key={o._id} to={`/dashboard/orders/${o._id}`} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
                  <img src={o.product?.images?.[0]?.url || `https://placehold.co/48x48/e2e8f0/64748b?text=?`}
                    alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{o.product?.title}</p>
                    <p className="text-xs text-gray-500">{formatRelative(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatPrice(o.totalAmount)}</p>
                    <span className={`badge badge-${st?.color}`}>{st?.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
