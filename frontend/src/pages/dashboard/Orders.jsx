import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatPrice, formatRelative, statusLabel } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('buyer');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders?role=${role}&limit=50`);
      setOrders(data.orders);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [role]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success('Sipariş güncellendi');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Hata'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📦 Siparişler</h1>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          {[['buyer', 'Alımlarım'], ['seller', 'Satışlarım']].map(([v, l]) => (
            <button key={v} onClick={() => setRole(v)}
              className={`px-4 py-2 text-sm transition ${role === v ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? <Spinner className="h-40" /> : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">📦</div>
          <p>Henüz {role === 'buyer' ? 'alım' : 'satış'} yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const st = statusLabel[o.status];
            return (
              <div key={o._id} className="card p-4">
                <div className="flex items-start gap-4">
                  <img src={o.product?.images?.[0]?.url || `https://placehold.co/60x60/e2e8f0/64748b?text=?`}
                    alt="" className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{o.product?.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5"># {o.orderNumber}</p>
                        <p className="text-xs text-gray-500">{role === 'buyer' ? `Satıcı: ${o.seller?.name}` : `Alıcı: ${o.buyer?.name}`}</p>
                      </div>
                      <span className={`badge badge-${st?.color} shrink-0`}>{st?.label}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-blue-600">{formatPrice(o.totalAmount)}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatRelative(o.createdAt)}</span>
                        {role === 'seller' && o.status === 'paid' && (
                          <button onClick={() => updateStatus(o._id, 'processing')} className="btn-primary text-xs py-1 px-2">Hazırlamaya Başla</button>
                        )}
                        {role === 'seller' && o.status === 'processing' && (
                          <button onClick={() => updateStatus(o._id, 'shipped')} className="btn-primary text-xs py-1 px-2">Kargoya Ver</button>
                        )}
                        {role === 'buyer' && o.status === 'shipped' && (
                          <button onClick={() => updateStatus(o._id, 'completed')} className="btn-primary text-xs py-1 px-2">Teslim Aldım</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
