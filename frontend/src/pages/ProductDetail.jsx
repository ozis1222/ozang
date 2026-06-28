import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import Spinner from '../components/common/Spinner';
import { formatPrice, formatRelative, conditionLabel, productTypeLabel, stockLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const addItem = useCartStore(s => s.addItem);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/reviews?type=product&targetId=${id}`),
    ]).then(([p, r]) => {
      setProduct(p.data.product);
      setReviews(r.data.reviews);
    }).catch(() => navigate('/404')).finally(() => setLoading(false));
  }, [id]);

  const handleBuyNow = async () => {
    if (!user) { toast.error('Satın almak için giriş yapın'); navigate('/login'); return; }
    setBuying(true);
    try {
      const { data } = await api.post('/orders', {
        productId: product._id,
        quantity: qty,
        paymentMethod: 'wallet',
      });
      toast.success('Sipariş oluşturuldu!');
      navigate(`/dashboard/orders`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hata oluştu');
    }
    setBuying(false);
  };

  const handleContact = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await api.post('/messages/conversations', {
        participantId: product.seller._id,
        productId: product._id,
      });
      navigate(`/dashboard/messages/${data.conversation._id}`);
    } catch (err) {
      toast.error('Mesaj başlatılamadı');
    }
  };

  if (loading) return <Spinner className="h-screen" size="lg" />;
  if (!product) return null;

  const stock = stockLabel[product.stock?.status];
  const imgs = product.images?.length ? product.images : [{ url: `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(product.title.slice(0,10))}` }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-blue-600">Ana Sayfa</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Ürünler</Link>
        {product.category && <><span>/</span><Link to={`/products?category=${product.category._id}`} className="hover:text-blue-600">{product.category.name}</Link></>}
        <span>/</span>
        <span className="text-gray-800 truncate max-w-xs">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
            <img src={imgs[activeImg]?.url} alt={product.title} className="w-full h-full object-contain" />
          </div>
          {imgs.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {imgs.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === activeImg ? 'border-blue-500' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="badge badge-blue">{productTypeLabel[product.productType]}</span>
              <span className={`badge badge-${stock?.color}`}>{stock?.label}</span>
              {product.condition !== 'new' && <span className="badge badge-gray">{conditionLabel[product.condition]}</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>
            <div className="flex items-center gap-3">
              <span className="text-yellow-400">{'★'.repeat(Math.round(product.rating || 0))}</span>
              <span className="text-gray-600 text-sm">({product.ratingCount} değerlendirme)</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 text-sm">{product.sales} satış</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 text-sm">{product.views} görüntülenme</span>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-blue-600">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <div className="flex flex-col">
                <span className="text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="text-green-600 text-sm font-medium">%{product.discountPercent} indirim</span>
              </div>
            )}
          </div>

          {/* Seller / Store */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <img src={product.store?.logo || product.seller?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.seller?.name || 'S')}&background=3b82f6&color=fff`}
              alt="" className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              {product.store ? (
                <Link to={`/stores/${product.store.slug || product.store._id}`} className="font-semibold text-sm hover:text-blue-600 flex items-center gap-1">
                  🏪 {product.store.name} {product.store.isVerified && <span className="text-blue-500">✓</span>}
                </Link>
              ) : (
                <p className="font-semibold text-sm">{product.seller?.name}</p>
              )}
              <p className="text-xs text-gray-500">⭐ {product.seller?.rating?.toFixed(1) || '—'} puan</p>
            </div>
            <button onClick={handleContact} className="btn-outline text-sm py-1.5">💬 Mesaj</button>
          </div>

          {/* Qty + Actions */}
          {product.stock?.status !== 'out_of_stock' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 font-bold">−</button>
                <span className="px-4 py-2 font-medium">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock.quantity, q + 1))} className="px-3 py-2 hover:bg-gray-100 font-bold">+</button>
              </div>
              <span className="text-sm text-gray-500">Stok: {product.stock.quantity}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleBuyNow} disabled={buying || product.stock?.status === 'out_of_stock'}
              className="btn-primary flex-1 py-3 text-base">
              {buying ? '⏳ İşleniyor...' : product.stock?.status === 'out_of_stock' ? 'Stok Yok' : '⚡ Hemen Satın Al'}
            </button>
            <button onClick={() => { addItem(product, qty); toast.success('Sepete eklendi'); }}
              disabled={product.stock?.status === 'out_of_stock'}
              className="btn-outline py-3 px-5">🛒 Sepete Ekle</button>
          </div>

          {/* Specs */}
          {product.specifications?.length > 0 && (
            <div className="mt-2">
              <h3 className="font-semibold mb-3">Özellikler</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.specifications.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-gray-600">{s.key}</span>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description + Reviews */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Ürün Açıklaması</h2>
          <div className="card p-6 prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>

          <h2 className="text-xl font-bold mt-8 mb-4">Değerlendirmeler ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="card p-6 text-center text-gray-500">Henüz değerlendirme yok</div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r._id} className="card p-5">
                  <div className="flex items-start gap-3">
                    <img src={r.reviewer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.reviewer?.name || 'K')}`}
                      alt="" className="w-9 h-9 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{r.reviewer?.name}</span>
                        {r.isVerifiedPurchase && <span className="badge badge-green">✓ Doğrulanmış Alım</span>}
                        <span className="text-gray-400 text-xs ml-auto">{formatRelative(r.createdAt)}</span>
                      </div>
                      <div className="text-yellow-400 text-sm mb-2">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                      {r.title && <p className="font-semibold text-sm mb-1">{r.title}</p>}
                      <p className="text-gray-700 text-sm">{r.comment}</p>
                      {r.sellerResponse?.text && (
                        <div className="mt-3 pl-3 border-l-2 border-blue-300 text-sm text-gray-600">
                          <span className="font-medium text-blue-600">Satıcı yanıtı: </span>{r.sellerResponse.text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="card p-5 sticky top-20">
            <h3 className="font-semibold mb-4">🔒 Güvenli Alışveriş</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {['SSL ile şifreli ödeme', 'Alıcı koruma güvencesi', 'Kolay iade süreci', '7/24 destek'].map(t => (
                <li key={t} className="flex items-center gap-2">✅ {t}</li>
              ))}
            </ul>
            <div className="border-t border-gray-100 mt-4 pt-4 text-xs text-gray-400">
              Sipariş {formatRelative(product.createdAt)} yayınlandı
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
