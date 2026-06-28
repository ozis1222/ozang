export const formatPrice = (price) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

export const formatRelative = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'Az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} gün önce`;
  return formatDate(date);
};

export const statusLabel = {
  pending: { label: 'Bekliyor', color: 'yellow' },
  paid: { label: 'Ödendi', color: 'blue' },
  processing: { label: 'Hazırlanıyor', color: 'blue' },
  shipped: { label: 'Kargoda', color: 'blue' },
  delivered: { label: 'Teslim Edildi', color: 'green' },
  completed: { label: 'Tamamlandı', color: 'green' },
  cancelled: { label: 'İptal', color: 'red' },
  refunded: { label: 'İade', color: 'red' },
  disputed: { label: 'Şikayette', color: 'red' },
};

export const conditionLabel = {
  new: 'Sıfır',
  like_new: 'Sıfır Gibi',
  good: 'İyi',
  fair: 'Orta',
  poor: 'Yıpranmış',
};

export const productTypeLabel = {
  physical: 'Fiziksel Ürün',
  digital: 'Dijital Ürün',
  game_item: 'Oyun İtemi',
  service: 'Hizmet',
};

export const stockLabel = {
  available: { label: 'Stokta Var', color: 'green' },
  limited: { label: 'Sınırlı Stok', color: 'yellow' },
  out_of_stock: { label: 'Stok Yok', color: 'red' },
};

