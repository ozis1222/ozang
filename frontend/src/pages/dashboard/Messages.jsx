import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';
import Spinner from '../../components/common/Spinner';
import { formatRelative } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Messages() {
  const { id: convId } = useParams();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    api.get('/messages').then(r => setConversations(r.data.conversations)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!convId) return;
    api.get(`/messages/${convId}/messages`).then(r => {
      setMessages(r.data.messages);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
  }, [convId]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || !convId) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/${convId}/messages`, { content: input.trim() });
      setMessages(m => [...m, data.message]);
      setInput('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch { toast.error('Mesaj gönderilemedi'); }
    setSending(false);
  };

  const activeConv = conversations.find(c => c._id === convId);
  const other = activeConv?.participants?.find(p => p._id !== user._id);

  if (loading) return <Spinner className="h-40" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">💬 Mesajlar</h1>
      <div className="card overflow-hidden flex" style={{ height: 520 }}>
        {/* Conv List */}
        <div className="w-64 border-r border-gray-100 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-100 text-sm font-medium text-gray-600">Konuşmalar</div>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <p className="text-center text-gray-500 text-sm p-6">Henüz mesaj yok</p>
            ) : conversations.map(c => {
              const other = c.participants?.find(p => p._id !== user._id);
              return (
                <Link key={c._id} to={`/dashboard/messages/${c._id}`}
                  className={`flex items-center gap-2 p-3 hover:bg-gray-50 transition border-b border-gray-50 ${c._id === convId ? 'bg-blue-50' : ''}`}>
                  <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'K')}`}
                    alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{other?.name}</p>
                    {c.product && <p className="text-xs text-gray-400 truncate">📦 {c.product.title}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Chat */}
        {!convId ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center"><div className="text-4xl mb-3">💬</div><p>Bir konuşma seçin</p></div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="p-3 border-b border-gray-100 flex items-center gap-2">
              <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'K')}`}
                alt="" className="w-8 h-8 rounded-full" />
              <span className="font-medium text-sm">{other?.name}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => {
                const isMine = m.sender?._id === user._id || m.sender === user._id;
                return (
                  <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {!isMine && (
                      <img src={m.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.sender?.name || 'K')}`}
                        alt="" className="w-7 h-7 rounded-full mr-2 self-end" />
                    )}
                    <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                      <p>{m.content}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>{formatRelative(m.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={send} className="p-3 border-t border-gray-100 flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Mesajınızı yazın..."
                className="input flex-1 text-sm py-2" disabled={sending} />
              <button type="submit" disabled={sending || !input.trim()} className="btn-primary px-4 py-2">
                {sending ? '...' : '→'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
