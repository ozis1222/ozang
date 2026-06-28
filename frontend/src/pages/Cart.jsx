import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/useCartStore';
import { formatPrice } from '../utils/helpers';

export default function Cart() {
  const { items, removeItem, updateQty, clear } = useCartStore();
  const total = useCartStore(s => s.total());
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold mb-2">Sepetiniz boş</h2>
      <p className="text-gray-500 mb-6">Alışverişe başlamak için ürünleri keşfedin</p>
      <Link to="/products" className="btn-primary">Ürünleri Keşfet</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">🛒 Sepetim ({items.length} ürün)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item._id} className="card p-4 flex gap-4">
              <img src={item.images?.[0]?.url || `https://placehold.co/80x80/e2e8f0/64748b?text=?`}
                alt={item.title} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.slug || item._id}`} className="font-semibold text-sm hover:text-blue-600 line-clamp-2">{item.title}</Link>
                <p className="text-blue-600 font-bold mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button onClick={() => item.quantity > 1 ? updateQty(item._id, item.quantity - 1) : removeItem(item._id)}
                      className="px-2 py-1 hover:bg-gray-100 text-lg">−</button>
                    <span className="px-3 py-1 text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-100 text-lg">+</button>
                  </div>
                  <button onClick={() => removeItem(item._id)} className="text-red-400 hover:text-red-600 text-sm">🗑 Kaldır</button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
          <button onClick={clear} className="btn-outline text-red-600 border-red-300 hover:bg-red-50 text-sm">🗑 Sepeti Temizle</button>
        </div>

        <div className="card p-5 h-fit sticky top-20">
          <h2 className="font-bold text-lg mb-4">Sipariş Özeti</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-gray-600">Ara Toplam</span><span>{formatPrice(total)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Kargo</span><span className="text-green-600">Ücretsiz</span></div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
              <span>Toplam</span><span className="text-blue-600">{formatPrice(total)}</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary w-full py-3">Ödemeye Geç →</button>
          <p className="text-xs text-gray-400 text-center mt-3">🔒 SSL ile güvenli ödeme</p>
        </div>
      </div>
    </div>
  );
}
