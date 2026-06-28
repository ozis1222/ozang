import { Link } from 'react-router-dom';
import { formatPrice, stockLabel } from '../../utils/helpers';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onFavoriteToggle }) {
  const { user } = useAuthStore();
  const [fav, setFav] = useState(user?.favorites?.includes(product._id));
  const [favLoading, setFavLoading] = useState(false);

  const handleFav = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Favorilere eklemek için giriş yapın'); return; }
    setFavLoading(true);
    try {
      const { data } = await api.post(`/products/${product._id}/favorite`);
      setFav(data.isFavorited);
      toast.success(data.isFavorited ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
      onFavoriteToggle?.(product._id, data.isFavorited);
    } catch {}
    setFavLoading(false);
  };

  const img = product.images?.[0]?.url || `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(product.title.slice(0,10))}`;
  const stock = stockLabel[product.stock?.status];

  return (
    <Link to={`/products/${product.slug || product._id}`} className="card group flex flex-col hover:shadow-md transition-shadow">
      <div className="relative overflow-hidden rounded-t-xl aspect-square">
        <img src={img} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        {product.discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">-%{product.discountPercent}</span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">⭐ Öne Çıkan</span>
        )}
        <button onClick={handleFav} disabled={favLoading}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform">
          <span className={fav ? 'text-red-500' : 'text-gray-400'}>{fav ? '❤️' : '🤍'}</span>
        </button>
        <div className="absolute bottom-2 left-2">
          <span className={`badge badge-${stock?.color}`}>{stock?.label}</span>
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1 mb-2">{product.title}</h3>
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-400 text-xs">{'★'.repeat(Math.round(product.rating || 0))}</span>
          <span className="text-xs text-gray-500">({product.ratingCount || 0})</span>
        </div>
        {product.store && (
          <p className="text-xs text-gray-500 mb-2 truncate">🏪 {product.store.name} {product.store.isVerified && '✓'}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="font-bold text-blue-600">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <span className="text-xs text-gray-400">{product.sales} satış</span>
        </div>
      </div>
    </Link>
  );
}
