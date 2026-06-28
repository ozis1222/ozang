import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';

const sortOptions = [
  { value: '-createdAt', label: 'En Yeni' },
  { value: 'price', label: 'En Ucuz' },
  { value: '-price', label: 'En Pahalı' },
  { value: '-rating', label: 'En İyi Puanlı' },
  { value: '-sales', label: 'En Çok Satan' },
];

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || '-createdAt';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const type = searchParams.get('type') || '';
  const condition = searchParams.get('condition') || '';
  const featured = searchParams.get('featured') || '';

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(searchParams);
    params.set('limit', '24');
    api.get(`/products?${params}`)
      .then(r => { setProducts(r.data.products); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchParams.toString()]);

  const set = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="card p-4 space-y-6 sticky top-20">
            <div>
              <h3 className="font-semibold mb-3">Kategori</h3>
              <div className="space-y-1">
                {categories.map(c => (
                  <button key={c._id} onClick={() => set('category', c._id)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition ${searchParams.get('category') === c._id ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}>
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Ürün Tipi</h3>
              {[['', 'Tümü'], ['physical', 'Fiziksel'], ['digital', 'Dijital'], ['game_item', 'Oyun İtemi'], ['service', 'Hizmet']].map(([v, l]) => (
                <button key={v} onClick={() => set('type', v)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition mb-1 ${type === v ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}>
                  {l}
                </button>
              ))}
            </div>
            <div>
              <h3 className="font-semibold mb-3">Durum</h3>
              {[['', 'Tümü'], ['new', 'Sıfır'], ['like_new', 'Sıfır Gibi'], ['good', 'İyi'], ['fair', 'Orta']].map(([v, l]) => (
                <button key={v} onClick={() => set('condition', v)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition mb-1 ${condition === v ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}>
                  {l}
                </button>
              ))}
            </div>
            <div>
              <h3 className="font-semibold mb-3">Fiyat Aralığı</h3>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice} onChange={e => set('minPrice', e.target.value)}
                  className="input text-sm py-1.5" />
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => set('maxPrice', e.target.value)}
                  className="input text-sm py-1.5" />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={featured === 'true'} onChange={e => set('featured', e.target.checked ? 'true' : '')}
                  className="rounded text-blue-600" />
                <span className="text-sm">Sadece Öne Çıkanlar</span>
              </label>
            </div>
            <button onClick={() => setSearchParams({})} className="btn-outline w-full text-sm">Filtreleri Temizle</button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-gray-600 text-sm">
              {search && <><strong>"{search}"</strong> için </>}<strong>{total}</strong> ürün bulundu
            </p>
            <select value={sort} onChange={e => set('sort', e.target.value)} className="input w-auto text-sm py-1.5">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {loading ? <Spinner className="h-80" size="lg" /> : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-xl font-semibold mb-2">Ürün bulunamadı</p>
              <p>Farklı filtreler deneyin</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
          <Pagination currentPage={page} totalPages={pages} onPageChange={p => set('page', p)} />
        </main>
      </div>
    </div>
  );
}
