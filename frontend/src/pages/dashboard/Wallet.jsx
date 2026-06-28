import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';
import { formatPrice, formatRelative } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function Wallet() {
  const { user, updateUser } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmt, setDepositAmt] = useState('');
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [iban, setIban] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.get('/users/wallet').then(r => { setTransactions(r.data.transactions); }).finally(() => setLoading(false));
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmt || depositAmt < 10) { toast.error('Minimum ₺10 yükleyebilirsiniz'); return; }
    setProcessing(true);
    try {
      // Demo: direct credit for now
      toast.success(`₺${depositAmt} bakiye yüklendi (demo)! Gerçekte Stripe ile ödeme alınır.`);
      setDepositAmt('');
    } catch (err) { toast.error(err.response?.data?.message || 'Hata'); }
    setProcessing(false);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmt || !iban) { toast.error('Tutar ve IBAN gerekli'); return; }
    setProcessing(true);
    try {
      await api.post('/payments/withdraw', { amount: Number(withdrawAmt), iban, accountName: user.name });
      toast.success('Para çekme talebi oluşturuldu');
      setWithdrawAmt(''); setIban('');
    } catch (err) { toast.error(err.response?.data?.message || 'Hata'); }
    setProcessing(false);
  };

  const txTypeLabel = {
    deposit: { label: 'Para Yükleme', color: 'green', sign: '+' },
    withdrawal: { label: 'Para Çekimi', color: 'red', sign: '-' },
    purchase: { label: 'Satın Alma', color: 'red', sign: '-' },
    sale: { label: 'Satış Geliri', color: 'green', sign: '+' },
    commission: { label: 'Komisyon', color: 'red', sign: '-' },
    refund: { label: 'İade', color: 'green', sign: '+' },
  };

  if (loading) return <Spinner className="h-40" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">💰 Cüzdanım</h1>

      {/* Balance */}
      <div className="card p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <p className="text-blue-200 text-sm mb-1">Mevcut Bakiye</p>
        <p className="text-4xl font-bold">{formatPrice(user?.wallet || 0)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deposit */}
        <div className="card p-5">
          <h2 className="font-bold mb-4">💳 Para Yükle</h2>
          <form onSubmit={handleDeposit} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Tutar (₺)</label>
              <input type="number" min="10" value={depositAmt} onChange={e => setDepositAmt(e.target.value)}
                className="input mt-1" placeholder="Minimum ₺10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[50, 100, 200, 500].map(a => (
                <button key={a} type="button" onClick={() => setDepositAmt(a)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-blue-50 hover:border-blue-300">
                  ₺{a}
                </button>
              ))}
            </div>
            <button type="submit" disabled={processing} className="btn-primary w-full">
              {processing ? 'İşleniyor...' : 'Stripe ile Öde'}
            </button>
          </form>
        </div>

        {/* Withdraw */}
        <div className="card p-5">
          <h2 className="font-bold mb-4">🏦 Para Çek</h2>
          <form onSubmit={handleWithdraw} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Tutar (₺)</label>
              <input type="number" min="50" value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)}
                className="input mt-1" placeholder="Minimum ₺50" />
            </div>
            <div>
              <label className="text-sm font-medium">IBAN</label>
              <input value={iban} onChange={e => setIban(e.target.value)}
                className="input mt-1" placeholder="TR00 0000 0000 0000 0000 0000 00" />
            </div>
            <button type="submit" disabled={processing} className="btn-primary w-full">
              {processing ? 'İşleniyor...' : 'Para Çek'}
            </button>
          </form>
        </div>
      </div>

      {/* Transactions */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-bold">İşlem Geçmişi</div>
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Henüz işlem yok</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map(t => {
              const type = txTypeLabel[t.type] || { label: t.type, color: 'gray', sign: '' };
              return (
                <div key={t._id} className="flex items-center gap-3 p-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${type.sign === '+' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {type.sign === '+' ? '↑' : '↓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{type.label}</p>
                    <p className="text-xs text-gray-500 truncate">{t.description}</p>
                    <p className="text-xs text-gray-400">{formatRelative(t.createdAt)}</p>
                  </div>
                  <span className={`font-bold ${type.sign === '+' ? 'text-green-600' : 'text-red-600'}`}>
                    {type.sign}{formatPrice(Math.abs(t.amount))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
