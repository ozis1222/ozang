import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatRelative } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users?page=${page}&search=${search}&limit=20`);
      setUsers(data.users);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, search]);

  const banUser = async (id, name) => {
    const reason = prompt(`"${name}" kullanıcısını engelleme sebebi:`);
    if (reason === null) return;
    try {
      await api.put(`/admin/users/${id}/ban`, { reason });
      toast.success('Kullanıcı durumu güncellendi');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Hata'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">👥 Kullanıcılar ({total})</h1>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="İsim veya e-posta ara..." className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {loading ? <Spinner className="h-40" /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Kullanıcı', 'E-posta', 'Rol', 'Bakiye', 'Kayıt', 'Durum', 'İşlem'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&size=32`} alt="" className="w-8 h-8 rounded-full" />
                      <span className="font-medium truncate max-w-28">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-40">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 font-medium">₺{u.wallet?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatRelative(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    {u.isBanned ? <span className="badge badge-red">Engelli</span> : <span className="badge badge-green">Aktif</span>}
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'admin' && (
                      <button onClick={() => banUser(u._id, u.name)}
                        className={`text-xs px-2 py-1 rounded-lg transition ${u.isBanned ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                        {u.isBanned ? 'Aktif Et' : 'Engelle'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
