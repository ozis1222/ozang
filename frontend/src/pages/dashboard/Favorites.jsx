import { useState, useEffect } from 'react';
import api from '../../utils/api';
import ProductCard from '../../components/common/ProductCard';
import Spinner from '../../components/common/Spinner';

export default function Favorites() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/favorites').then(r => setProducts(r.data.products)).finally(() => setLoading(false));
  }, []);

  const handleFavToggle = (id, isFav) => {
    if (!isFav) setProducts(p => p.filter(pr => pr._id !== id));
  };

  if (loading) return <Spinner className="h-40" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">❤️ Favorilerim ({products.length})</h1>
      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">❤️</div>
          <p className="text-xl">Favori ürününüz yok</p>
          <p className="text-sm mt-2">Ürünlerde ❤️ butonuna basarak favorilerinize ekleyin</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p._id} product={p} onFavoriteToggle={handleFavToggle} />)}
        </div>
      )}
    </div>
  );
}
