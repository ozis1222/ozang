import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Şifreler eşleşmiyor'); return; }
    if (form.password.length < 6) { toast.error('Şifre en az 6 karakter olmalı'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kayıt olunamadı');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl">🛍️</Link>
          <h1 className="text-2xl font-bold mt-3">Hesap Oluştur</h1>
          <p className="text-gray-500 mt-1">Ücretsiz üye olun, alışverişe başlayın</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Ad Soyad', type: 'text', placeholder: 'Adınız Soyadınız' },
              { key: 'email', label: 'E-posta', type: 'email', placeholder: 'ornek@email.com' },
              { key: 'password', label: 'Şifre', type: 'password', placeholder: 'En az 6 karakter' },
              { key: 'confirm', label: 'Şifre Tekrar', type: 'password', placeholder: 'Şifrenizi tekrarlayın' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium mb-1">{f.label}</label>
                <input type={f.type} required value={form[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm({...form, [f.key]: e.target.value})} className="input" />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? '⏳ Kaydediliyor...' : 'Üye Ol'}
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-4">
            Üye olarak <Link to="/terms" className="text-blue-600">Kullanım Şartlarını</Link> kabul etmiş sayılırsınız.
          </p>
          <p className="text-center text-sm text-gray-600 mt-4">
            Zaten hesabınız var mı? <Link to="/login" className="text-blue-600 font-medium hover:underline">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
