require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const User = require('../models/User');

const categories = [
  { name: 'Oyun İtemi', icon: '🎮', description: 'Oyun içi itemler, karakterler, skinler', order: 1 },
  { name: 'Dijital Ürün', icon: '💾', description: 'Yazılım, lisans, e-kitap, kurs', order: 2 },
  { name: 'Elektronik', icon: '📱', description: 'Telefon, bilgisayar, aksesuar', order: 3 },
  { name: 'Giyim', icon: '👕', description: 'Kıyafet, ayakkabı, aksesuar', order: 4 },
  { name: 'Ev & Yaşam', icon: '🏠', description: 'Mobilya, dekor, mutfak', order: 5 },
  { name: 'Koleksiyon', icon: '🃏', description: 'Kart, figür, antika', order: 6 },
  { name: 'Spor', icon: '⚽', description: 'Spor ekipmanları, forma', order: 7 },
  { name: 'Kitap & Müzik', icon: '📚', description: 'Kitap, albüm, enstrüman', order: 8 },
  { name: 'Araç Gereç', icon: '🔧', description: 'El aleti, oto aksesuar', order: 9 },
  { name: 'Diğer', icon: '📦', description: 'Diğer kategoriler', order: 10 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace');
  console.log('Veritabanına bağlandı');

  await Category.deleteMany({});
  const cats = await Category.insertMany(categories);
  console.log(`✅ ${cats.length} kategori oluşturuldu`);

  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@marketplace.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@marketplace.com',
      password: 'Admin123!',
      role: 'admin',
      isEmailVerified: true,
    });
    console.log('✅ Admin kullanıcısı oluşturuldu (admin@marketplace.com / Admin123!)');
  }

  console.log('🎉 Seed tamamlandı!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
