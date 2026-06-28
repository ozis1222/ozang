import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Giriş yapılamadı');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl">🛍️</Link>
          <h1 className="text-2xl font-bold mt-3">Hoş Geldiniz</h1>
          <p className="text-gray-500 mt-1">Hesabınıza giriş yapın</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">E-posta</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="input" placeholder="ornek@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şifre</label>
              <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="input" placeholder="••••••••" />
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Şifremi Unuttum</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? '⏳ Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative text-center"><span className="bg-white px-4 text-sm text-gray-500">veya</span></div>
          </div>

          <a href="/api/auth/google" className="mt-4 flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 hover:bg-gray-50 transition font-medium text-sm">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Google ile Giriş Yap
          </a>

          <p className="text-center text-sm text-gray-600 mt-6">
            Hesabınız yok mu? <Link to="/register" className="text-blue-600 font-medium hover:underline">Üye Ol</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
