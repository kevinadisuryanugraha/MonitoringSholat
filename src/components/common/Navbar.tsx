import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Mosque } from './MosqueIcon';
import { 
  Bell, 
  LogOut, 
  ChevronDown, 
  Database, 
  UserCheck, 
  Menu, 
  X, 
  Sparkles,
  School
} from 'lucide-react';

interface Props {
  onToggleMobileSidebar: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const Navbar: React.FC<Props> = ({
  onToggleMobileSidebar,
  onOpenNotifications,
  unreadCount
}) => {
  const { currentUser, logout, switchDemoUser, demoRole, seedData } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case 'musyrif': return 'Musyrif (Pengisi Absen)';
      case 'wali_kelas': return 'Wali Kelas';
      case 'kepala_sekolah': return 'Kepala Sekolah';
      default: return 'User';
    }
  };

  const handleSeed = async () => {
    if (window.confirm('Reset/Isi Ulang Data Demo Santri, Kelas, Kelompok & Absensi 7 Hari Terakhir?')) {
      setIsSeeding(true);
      await seedData();
      setIsSeeding(false);
      alert('Data demo berhasil diperbarui!');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-teal-900 text-white shadow-md border-b border-teal-800">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Left section: Logo & Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-teal-200 hover:text-white hover:bg-teal-800 transition-colors flex-shrink-0"
              title="Menu Navigasi"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 sm:p-2 bg-emerald-600 rounded-xl text-amber-300 shadow-xs flex items-center justify-center flex-shrink-0">
                <Mosque className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-lg tracking-tight text-white truncate">SholTrack</span>
                  <span className="hidden md:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full flex-shrink-0">
                    Ibadah 5 Waktu
                  </span>
                </div>
                <p className="text-[11px] text-teal-200 hidden sm:block truncate">Monitoring Sholat Santri Pesantren</p>
              </div>
            </div>
          </div>

          {/* Right section: Role switcher, Notifications, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            
            {/* Quick Demo Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-teal-800/90 hover:bg-teal-800 border border-teal-700 text-xs font-medium text-teal-100 transition-all max-w-[130px] sm:max-w-none"
                title="Ganti Peran / Role User"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="hidden md:inline">{getRoleLabel(currentUser?.role)}</span>
                <span className="md:hidden font-semibold truncate">
                  {currentUser?.role === 'kepala_sekolah' ? 'Kepala Sek.' : currentUser?.role === 'wali_kelas' ? 'Wali Kelas' : 'Musyrif'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-teal-300 flex-shrink-0" />
              </button>

              {/* Role Dropdown */}
              {showRoleMenu && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-xl shadow-xl border border-teal-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setShowRoleMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-gray-100 text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
                    Pilih Peran Pengguna (Demo)
                  </div>

                  <button
                    onClick={() => switchDemoUser('musyrif')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-teal-50 flex items-center justify-between ${currentUser?.role === 'musyrif' ? 'bg-teal-50/80 font-bold text-teal-800' : ''}`}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">1. Musyrif (Pengisi Absen)</p>
                      <p className="text-[11px] text-gray-500">Kamar Madinah • Ustadz Ahmad</p>
                    </div>
                    {currentUser?.role === 'musyrif' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                  </button>

                  <button
                    onClick={() => switchDemoUser('wali_kelas')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-teal-50 flex items-center justify-between ${currentUser?.role === 'wali_kelas' ? 'bg-teal-50/80 font-bold text-teal-800' : ''}`}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">2. Wali Kelas</p>
                      <p className="text-[11px] text-gray-500">Kelas 7A • Ustadz Ridwan</p>
                    </div>
                    {currentUser?.role === 'wali_kelas' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                  </button>

                  <button
                    onClick={() => switchDemoUser('kepala_sekolah')}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-teal-50 flex items-center justify-between ${currentUser?.role === 'kepala_sekolah' ? 'bg-teal-50/80 font-bold text-teal-800' : ''}`}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">3. Kepala Sekolah</p>
                      <p className="text-[11px] text-gray-500">Akses Penuh Semua Kelas</p>
                    </div>
                    {currentUser?.role === 'kepala_sekolah' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                  </button>
                </div>
              )}
            </div>

            {/* Seed Demo Data Button */}
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-700 border border-emerald-600 text-xs text-white transition-all disabled:opacity-50"
              title="Isi Data Demo Awal (Santri, Kelas, & Log Absensi 7 Hari)"
            >
              <Database className="w-3.5 h-3.5 text-amber-300" />
              <span>{isSeeding ? 'Mengisi...' : 'Isi Data Demo'}</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-teal-200 hover:text-white hover:bg-teal-800 transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-teal-950 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Logout button */}
            <button
              onClick={() => logout()}
              className="p-2 rounded-lg text-teal-200 hover:text-rose-200 hover:bg-rose-900/40 transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
