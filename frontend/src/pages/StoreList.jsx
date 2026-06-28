import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/common/Pagination';

export default function StoreList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stores, setStores] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    setLoading(true);
    api.get(`/stores?page=${page}&search=${searchParams.get('search') || ''}&limit=18`)
      .then(r => { setStores(r.data.stores); setTotal(r.data.total); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  }, [searchParams.toString()]);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    setSearchParams(p);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">🏪 Mağazalar</h1>
          <p className="text-gray-500 text-sm mt-1">{total} mağaza</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mağaza ara..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          <button type="submit" className="btn-primary text-sm py-2">Ara</button>
        </form>
      </div>

      {loading ? <Spinner className="h-80" size="lg" /> : stores.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">🏪</div>
          <p className="text-xl">Mağaza bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stores.map(s => (
            <Link key={s._id} to={`/stores/${s.slug || s._id}`}
              className="card p-4 flex flex-col items-center text-center hover:shadow-md transition group">
              <img src={s.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&size=80&background=3b82f6&color=fff`}
                alt={s.name} className="w-16 h-16 rounded-full object-cover mb-3 group-hover:scale-105 transition-transform" />
              <p className="font-semibold text-sm truncate w-full">{s.name} {s.isVerified && '✓'}</p>
              <p className="text-xs text-gray-500 mt-1">{s.followerCount} takipçi</p>
              <p className="text-xs text-gray-500">{s.productCount} ürün</p>
              {s.ratingCount > 0 && (
                <p className="text-xs text-yellow-500 mt-1">⭐ {(s.rating / s.ratingCount).toFixed(1)}</p>
              )}
            </Link>
          ))}
        </div>
      )}
      <Pagination currentPage={page} totalPages={pages}
        onPageChange={p => { const params = new URLSearchParams(searchParams); params.set('page', p); setSearchParams(params); }} />
    </div>
  );
}
