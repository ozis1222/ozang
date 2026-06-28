import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatPrice, formatRelative, statusLabel } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="h-80" size="lg" />;
  if (!data) return null;

  const { stats, recentOrders, recentUsers } = data;

  const statCards = [
    { label: 'Toplam Kullanıcı', value: stats.totalUsers.toLocaleString(), icon: '👥', color: 'blue' },
    { label: 'Aktif Mağaza', value: stats.totalStores.toLocaleString(), icon: '🏪', color: 'purple' },
    { label: 'Ürün Sayısı', value: stats.totalProducts.toLocaleString(), icon: '📦', color: 'green' },
    { label: 'Platform Geliri', value: formatPrice(stats.totalRevenue), icon: '💰', color: 'yellow' },
    { label: 'Toplam Sipariş', value: stats.totalOrders.toLocaleString(), icon: '🛒', color: 'orange' },
    { label: 'Bu Ay Sipariş', value: stats.monthlyOrders.toLocaleString(), icon: '📈', color: 'teal' },
    { label: 'Bekleyen Sipariş', value: stats.pendingOrders, icon: '⏳', color: 'red' },
    { label: 'Şikayetli Sipariş', value: stats.disputedOrders, icon: '⚠️', color: 'red' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-bold">Son Siparişler</h2>
            <Link to="/admin/orders" className="text-blue-600 text-sm hover:underline">Tümü →</Link>
          </div>
          <div className="divide-y">
            {recentOrders.map(o => {
              const st = statusLabel[o.status];
              return (
                <div key={o._id} className="flex items-center gap-3 p-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{o.product?.title}</p>
                    <p className="text-gray-500 text-xs">{o.buyer?.name} → {o.seller?.name}</p>
                  </div>
                  <span className={`badge badge-${st?.color} shrink-0`}>{st?.label}</span>
                  <span className="font-bold shrink-0">{formatPrice(o.totalAmount)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-bold">Yeni Kullanıcılar</h2>
            <Link to="/admin/users" className="text-blue-600 text-sm hover:underline">Tümü →</Link>
          </div>
          <div className="divide-y">
            {recentUsers.map(u => (
              <div key={u._id} className="flex items-center gap-3 p-3">
                <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=32&background=3b82f6&color=fff`}
                  alt="" className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{u.name}</p>
                  <p className="text-gray-500 text-xs truncate">{u.email}</p>
                </div>
                <div className="text-right text-xs text-gray-400">{formatRelative(u.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
