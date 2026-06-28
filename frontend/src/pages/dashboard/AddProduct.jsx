import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function AddProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', price: '', originalPrice: '',
    category: '', productType: 'physical', condition: 'new',
    stock: { status: 'available', quantity: 1 },
    images: [], tags: '',
    shippingInfo: { freeShipping: false, shippingCost: 0 },
    specifications: [],
  });

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories));
    if (id) {
      api.get(`/products/${id}`).then(r => {
        const p = r.data.product;
        setForm({ ...p, tags: p.tags?.join(', ') || '' });
      });
    }
  }, [id]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      fd.append('folder', 'marketplace/products');
      const { data } = await api.post('/upload/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, images: [...f.images, ...data.images] }));
      toast.success(`${data.images.length} resim yüklendi`);
    } catch { toast.error('Resim yüklenemedi'); }
    setUploading(false);
  };

  const addSpec = () => setForm(f => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }));
  const updateSpec = (i, field, val) => setForm(f => {
    const specs = [...f.specifications];
    specs[i] = { ...specs[i], [field]: val };
    return { ...f, specifications: specs };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (id) {
        await api.put(`/products/${id}`, payload);
        toast.success('Ürün güncellendi');
      } else {
        await api.post('/products', payload);
        toast.success('Ürün eklendi! 🎉');
      }
      navigate('/dashboard/store');
    } catch (err) { toast.error(err.response?.data?.message || 'Hata'); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{id ? '✏️ Ürünü Düzenle' : '+ Yeni Ürün Ekle'}</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Images */}
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Ürün Görselleri</h2>
          <div className="flex flex-wrap gap-3 mb-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative w-24 h-24">
                <img src={img.url} alt="" className="w-full h-full object-cover rounded-xl" />
                <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs">×</button>
              </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition">
              {uploading ? <Spinner size="sm" /> : <><span className="text-2xl">📷</span><span className="text-xs text-gray-500 mt-1">Ekle</span></>}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">Temel Bilgiler</h2>
          <div>
            <label className="text-sm font-medium">Başlık *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="input mt-1" placeholder="Ürün başlığı" maxLength={150} />
          </div>
          <div>
            <label className="text-sm font-medium">Açıklama *</label>
            <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="input mt-1 h-32 resize-none" placeholder="Ürününüzü detaylı açıklayın..." />
          </div>
          <div>
            <label className="text-sm font-medium">Kategori *</label>
            <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input mt-1">
              <option value="">Kategori Seçin</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Ürün Tipi</label>
              <select value={form.productType} onChange={e => setForm({...form, productType: e.target.value})} className="input mt-1">
                {[['physical','Fiziksel'],['digital','Dijital'],['game_item','Oyun İtemi'],['service','Hizmet']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Durum</label>
              <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} className="input mt-1">
                {[['new','Sıfır'],['like_new','Sıfır Gibi'],['good','İyi'],['fair','Orta'],['poor','Yıpranmış']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Etiketler (virgülle ayırın)</label>
            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
              className="input mt-1" placeholder="örn: vintage, sıfır, orijinal" />
          </div>
        </div>

        {/* Price & Stock */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">Fiyat & Stok</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Satış Fiyatı (₺) *</label>
              <input type="number" required min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="input mt-1" placeholder="0.00" />
            </div>
            <div>
              <label className="text-sm font-medium">Orijinal Fiyat (₺)</label>
              <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={e => setForm({...form, originalPrice: e.target.value})}
                className="input mt-1" placeholder="İndirim için" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Stok Durumu</label>
              <select value={form.stock?.status} onChange={e => setForm({...form, stock: {...form.stock, status: e.target.value}})} className="input mt-1">
                {[['available','Stokta Var'],['limited','Sınırlı'],['out_of_stock','Tükendi']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Adet</label>
              <input type="number" min="0" value={form.stock?.quantity} onChange={e => setForm({...form, stock: {...form.stock, quantity: Number(e.target.value)}})}
                className="input mt-1" />
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Özellikler</h2>
            <button type="button" onClick={addSpec} className="btn-outline text-sm py-1">+ Ekle</button>
          </div>
          {form.specifications.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={s.key} onChange={e => updateSpec(i, 'key', e.target.value)} className="input" placeholder="Özellik (örn: Renk)" />
              <input value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)} className="input" placeholder="Değer (örn: Kırmızı)" />
              <button type="button" onClick={() => setForm(f => ({ ...f, specifications: f.specifications.filter((_,j) => j !== i) }))}
                className="text-red-400 hover:text-red-600 px-2">×</button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
            {loading ? 'Kaydediliyor...' : id ? '💾 Güncelle' : '🚀 Yayınla'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard/store')} className="btn-outline">İptal</button>
        </div>
      </form>
    </div>
  );
}
