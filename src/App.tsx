import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { MusyrifDashboard } from './components/musyrif/MusyrifDashboard';
import { FormAbsensiSholat } from './components/musyrif/FormAbsensiSholat';
import { RiwayatAbsensiMusyrif } from './components/musyrif/RiwayatAbsensiMusyrif';
import { WaliKelasDashboard } from './components/walikelas/WaliKelasDashboard';
import { KepalaSekolahDashboard } from './components/kepalasekolah/KepalaSekolahDashboard';
import { MasterSantri } from './components/kepalasekolah/MasterSantri';
import { MasterKelasKelompok } from './components/kepalasekolah/MasterKelasKelompok';
import { KonfigurasiSholat } from './components/kepalasekolah/KonfigurasiSholat';
import { UserManagement } from './components/kepalasekolah/UserManagement';
import { LaporanHarian } from './components/laporan/LaporanHarian';
import { LaporanMingguan } from './components/laporan/LaporanMingguan';
import { LaporanBulanan } from './components/laporan/LaporanBulanan';
import { CetakRaporSantri } from './components/laporan/CetakRaporSantri';
import { AnalitikInsight } from './components/analytics/AnalitikInsight';
import { WaktuSholatKey, AppNotification } from './types';

// ============================================================
// Layout Utama — Halaman yang memerlukan autentikasi
// ============================================================
function AuthenticatedLayout() {
  const { currentUser, demoRole } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [selectedSholatKey, setSelectedSholatKey] = useState<WaktuSholatKey>('subuh');
  const navigate = useNavigate();

  // Notifikasi dalam aplikasi (mock data)
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Pengingat Absen Subuh',
      message: 'Waktu pengisian absen Subuh berakhir pukul 07:00. Harap segera melengkapi.',
      date: '05:30 Hari Ini',
      type: 'warning',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Laporan Kelas 7A Tersedia',
      message: 'Rekapitulasi sholat mingguan Kelas 7A telah diperbarui oleh musyrif.',
      date: 'Kemarin',
      type: 'info',
      read: false
    },
    {
      id: 'notif-3',
      title: 'Peringatan Kehadiran Santri',
      message: 'Santri Danish Al-Ghazali tercatat Alpha 3 kali berturut-turut pada sholat Subuh.',
      date: '2 hari lalu',
      type: 'alert',
      read: true
    }
  ]);

  const role = currentUser?.role || 'musyrif';
  const location = useLocation();
  
  // Deteksi tab aktif dari URL path
  const rawPath = location.pathname.replace('/', '');
  const activeTab = rawPath === '' ? 'dashboard' : rawPath;

  const handleMarkNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifs = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fungsi navigasi untuk dashboard musyrif
  const handleNavigateToForm = (waktuKey: WaktuSholatKey) => {
    setSelectedSholatKey(waktuKey);
    navigate('/form-absensi');
  };

  const renderContent = () => {
    return (
      <Routes>
        {/* Dashboard sesuai role */}
        <Route path="/" element={
          role === 'musyrif' 
            ? <MusyrifDashboard onNavigateToForm={handleNavigateToForm} onNavigateToHistory={() => navigate('/riwayat-musyrif')} />
            : role === 'wali_kelas' 
              ? <WaliKelasDashboard />
              : <KepalaSekolahDashboard onNavigateTab={(tab) => navigate(`/${tab}`)} />
        } />

        {/* Route khusus Musyrif */}
        <Route path="/dashboard" element={
          role === 'musyrif'
            ? <MusyrifDashboard onNavigateToForm={handleNavigateToForm} onNavigateToHistory={() => navigate('/riwayat-musyrif')} />
            : role === 'wali_kelas'
              ? <WaliKelasDashboard />
              : <KepalaSekolahDashboard onNavigateTab={(tab) => navigate(`/${tab}`)} />
        } />
        <Route path="/form-absensi" element={
          <FormAbsensiSholat waktuSholatKey={selectedSholatKey} onBack={() => navigate('/')} onSuccess={() => navigate('/')} />
        } />
        <Route path="/riwayat-musyrif" element={<RiwayatAbsensiMusyrif />} />

        {/* Route Master Data (Kepala Sekolah) */}
        <Route path="/santri" element={<MasterSantri />} />
        <Route path="/kelas-kelompok" element={<MasterKelasKelompok />} />

        {/* Route Laporan */}
        <Route path="/laporan-harian" element={<LaporanHarian />} />
        <Route path="/laporan-mingguan" element={<LaporanMingguan />} />
        <Route path="/laporan-bulanan" element={<LaporanBulanan />} />
        <Route path="/rapor-santri" element={<CetakRaporSantri />} />

        {/* Route Analitik & Konfigurasi */}
        <Route path="/analitik" element={<AnalitikInsight />} />
        <Route path="/pengaturan-sholat" element={<KonfigurasiSholat />} />
        <Route path="/manajemen-user" element={<UserManagement />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-gray-900 selection:bg-teal-800 selection:text-amber-300">
      
      {/* Top Navbar */}
      <Navbar
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => navigate(`/${tab === 'dashboard' ? '' : tab}`)}
            role={role}
          />
        </div>

        {/* Mobile Overlay Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div 
              className="w-64 bg-teal-900 h-full shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => navigate(`/${tab === 'dashboard' ? '' : tab}`)}
                role={role}
                closeMobileSidebar={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Workspace View */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 pb-28 lg:pb-8 overflow-x-hidden">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Bottom Mobile Nav */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={(tab) => navigate(`/${tab === 'dashboard' ? '' : tab}`)}
        role={role}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotifRead}
        onClearAll={handleClearNotifs}
      />

    </div>
  );
}

// ============================================================
// Gate Autentikasi — Arahkan ke login jika belum terautentikasi
// ============================================================
function AuthGate() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-teal-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <h1 className="text-lg font-bold text-amber-300">SholTrack Pesantren</h1>
        <p className="text-xs text-teal-200 mt-1">Memuat sistem monitoring sholat santri...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<AuthenticatedLayout />} />
    </Routes>
  );
}

// ============================================================
// Root App
// ============================================================
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AuthGate />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
