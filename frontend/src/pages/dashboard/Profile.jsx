import { useState } from 'react';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', phone: user?.phone || '', location: user?.location || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.user);
      toast.success('Profil güncellendi');
    } catch (err) { toast.error(err.response?.data?.message || 'Hata'); }
    setLoading(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Şifreler eşleşmiyor'); return; }
    setPwLoading(true);
    try {
      await api.put('/users/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Şifre güncellendi');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Hata'); }
    setPwLoading(false);
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('folder', 'marketplace/avatars');
      const { data } = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await api.put('/users/profile', { avatar: data.url });
      updateUser({ avatar: data.url });
      toast.success('Profil fotoğrafı güncellendi');
    } catch { toast.error('Yükleme başarısız'); }
    setAvatarUploading(false);
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">👤 Profilim</h1>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'K')}&size=80`}
              alt="" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
            <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700">
              {avatarUploading ? '⏳' : '📷'}
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
          </div>
          <div>
            <p className="font-bold text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            {user?.isEmailVerified ? <span className="badge badge-green mt-1">✓ Doğrulandı</span> : <span className="badge badge-yellow mt-1">E-posta Doğrulanmamış</span>}
          </div>
        </div>

        <form onSubmit={handleProfile} className="space-y-3">
          {[
            { key: 'name', label: 'Ad Soyad', type: 'text' },
            { key: 'phone', label: 'Telefon', type: 'tel' },
            { key: 'location', label: 'Konum', type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} className="input mt-1" />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium">Hakkımda</label>
            <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
              className="input mt-1 h-24 resize-none" placeholder="Kendinizi tanıtın..." />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Kaydediliyor...' : 'Profili Güncelle'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-bold mb-4">🔒 Şifre Değiştir</h2>
        <form onSubmit={handlePassword} className="space-y-3">
          {[
            { key: 'currentPassword', label: 'Mevcut Şifre' },
            { key: 'newPassword', label: 'Yeni Şifre' },
            { key: 'confirm', label: 'Yeni Şifre Tekrar' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium">{f.label}</label>
              <input type="password" value={pwForm[f.key]} onChange={e => setPwForm({...pwForm, [f.key]: e.target.value})} className="input mt-1" />
            </div>
          ))}
          <button type="submit" disabled={pwLoading} className="btn-primary w-full py-2.5">
            {pwLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
          </button>
        </form>
      </div>
    </div>
  );
}
