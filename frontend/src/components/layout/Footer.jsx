import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛍️</span>
              <span className="font-bold text-xl text-white">Pazaryeri</span>
            </Link>
            <p className="text-sm">Türkiye'nin en güvenilir online pazaryeri. Alın, satın, kazanın.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Alışveriş</h3>
            <ul className="space-y-2 text-sm">
              {[['Tüm Ürünler', '/products'], ['Mağazalar', '/stores'], ['Kategoriler', '/categories'], ['Fırsatlar', '/products?featured=true']].map(([l, t]) => (
                <li key={t}><Link to={t} className="hover:text-white transition">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Satıcılar</h3>
            <ul className="space-y-2 text-sm">
              {[['Mağaza Aç', '/dashboard/store/create'], ['Ürün Ekle', '/dashboard/products/new'], ['Satıcı Kuralları', '/seller-guide'], ['Komisyon Oranları', '/fees']].map(([l, t]) => (
                <li key={t}><Link to={t} className="hover:text-white transition">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Yardım</h3>
            <ul className="space-y-2 text-sm">
              {[['Sık Sorulan Sorular', '/faq'], ['İletişim', '/contact'], ['Gizlilik Politikası', '/privacy'], ['Kullanım Şartları', '/terms']].map(([l, t]) => (
                <li key={t}><Link to={t} className="hover:text-white transition">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2025 Pazaryeri. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4 text-sm">
            <span>💳 Güvenli Ödeme</span>
            <span>🔒 SSL Şifreli</span>
            <span>⭐ %100 Güvenli</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
