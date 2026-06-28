import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Spinner from './components/common/Spinner';

const Home = lazy(() => import('./pages/Home'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const StorePage = lazy(() => import('./pages/StorePage'));
const StoreList = lazy(() => import('./pages/StoreList'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const Orders = lazy(() => import('./pages/dashboard/Orders'));
const Wallet = lazy(() => import('./pages/dashboard/Wallet'));
const Messages = lazy(() => import('./pages/dashboard/Messages'));
const MyStore = lazy(() => import('./pages/dashboard/MyStore'));
const AddProduct = lazy(() => import('./pages/dashboard/AddProduct'));
const Favorites = lazy(() => import('./pages/dashboard/Favorites'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

const NoNav = ({ children }) => <>{children}</>;
const WithNav = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<Spinner className="min-h-screen" size="lg" />}>
      <Routes>
        {/* Auth pages (no nav) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Admin (no nav) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Main site */}
        <Route path="*" element={
          <WithNav>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/stores" element={<StoreList />} />
              <Route path="/stores/:id" element={<StorePage />} />
              <Route path="/cart" element={<Cart />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="orders" element={<Orders />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="messages" element={<Messages />} />
                <Route path="messages/:id" element={<Messages />} />
                <Route path="store" element={<MyStore />} />
                <Route path="store/create" element={<MyStore />} />
                <Route path="products" element={<MyStore />} />
                <Route path="products/new" element={<AddProduct />} />
                <Route path="products/:id/edit" element={<AddProduct />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-96 text-center px-4">
                  <div className="text-7xl mb-4">🔍</div>
                  <h1 className="text-3xl font-bold mb-2">Sayfa Bulunamadı</h1>
                  <p className="text-gray-500 mb-6">Aradığınız sayfa mevcut değil</p>
                  <a href="/" className="btn-primary">Ana Sayfaya Dön</a>
                </div>
              } />
            </Routes>
          </WithNav>
        } />
      </Routes>
    </Suspense>
  );
}

function AuthCallback() {
  const { init } = useAuthStore();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      init().then(() => { window.location.href = '/'; });
    } else {
      window.location.href = '/login';
    }
  }, []);
  return <Spinner className="min-h-screen" size="lg" />;
}

export default function App() {
  const { init } = useAuthStore();
  useEffect(() => { init(); }, []);

  return <AppRoutes />;
}
