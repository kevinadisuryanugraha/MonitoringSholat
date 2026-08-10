import React from 'react';
import { UserRole } from '../../types';
import { Mosque } from './MosqueIcon';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  History, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Users, 
  School, 
  Clock, 
  UserCog, 
  FileText, 
  Printer, 
  ChevronRight
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  closeMobileSidebar?: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  role,
  closeMobileSidebar
}) => {

  const handleSelect = (tab: string) => {
    setActiveTab(tab);
    if (closeMobileSidebar) closeMobileSidebar();
  };

  const getMenuItems = () => {
    switch (role) {
      case 'musyrif':
        return [
          { id: 'dashboard', label: 'Dashboard Musyrif', icon: LayoutDashboard },
          { id: 'form-absensi', label: 'Pengisian Absen Sholat', icon: ClipboardCheck },
          { id: 'riwayat-musyrif', label: 'Riwayat Absen Saya', icon: History },
          { id: 'laporan-harian', label: 'Laporan Harian Kamar', icon: Calendar },
        ];
      case 'wali_kelas':
        return [
          { id: 'dashboard', label: 'Dashboard Wali Kelas', icon: LayoutDashboard },
          { id: 'santri', label: 'Data Santri Kelas', icon: Users },
          { id: 'laporan-harian', label: 'Laporan Harian Kelas', icon: Calendar },
          { id: 'laporan-mingguan', label: 'Laporan Mingguan', icon: BarChart3 },
          { id: 'laporan-bulanan', label: 'Laporan Bulanan', icon: FileText },
          { id: 'rapor-santri', label: 'Rapor Ibadah Santri', icon: Printer },
        ];
      case 'kepala_sekolah':
      default:
        return [
          { id: 'dashboard', label: 'Dashboard Sekolah', icon: LayoutDashboard },
          { id: 'santri', label: 'Master Data Santri', icon: Users },
          { id: 'kelas-kelompok', label: 'Data Kelas & Kamar', icon: School },
          { id: 'laporan-harian', label: 'Laporan Harian', icon: Calendar },
          { id: 'laporan-mingguan', label: 'Laporan Mingguan', icon: BarChart3 },
          { id: 'laporan-bulanan', label: 'Laporan Bulanan', icon: FileText },
          { id: 'rapor-santri', label: 'Cetak Rapor A4', icon: Printer },
          { id: 'analitik', label: 'Analitik & Insight', icon: PieChart },
          { id: 'pengaturan-sholat', label: 'Konfigurasi Sholat', icon: Clock },
          { id: 'manajemen-user', label: 'Manajemen Pengguna', icon: UserCog },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-teal-900 text-white border-r border-teal-800 flex flex-col h-[calc(100vh-4rem)] sticky top-16 shadow-xs">
      {/* Role Badge Indicator */}
      <div className="p-4 border-b border-teal-800 bg-teal-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-teal-950 flex items-center justify-center font-black text-xs shadow-xs">
            {role === 'musyrif' ? 'M' : role === 'wali_kelas' ? 'WK' : 'KS'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {role === 'musyrif' ? 'MODUL MUSYRIF' : role === 'wali_kelas' ? 'MODUL WALI KELAS' : 'MODUL KEPALA SEKOLAH'}
            </p>
            <p className="text-[11px] text-teal-200 truncate">
              {role === 'musyrif' ? 'Absensi Sholat Kamar' : role === 'wali_kelas' ? 'Monitoring & Laporan Kelas' : 'Manajemen & Analitik Utama'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-teal-800 text-white shadow-xs border border-teal-700/50 font-bold'
                  : 'text-teal-100/80 hover:bg-teal-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-teal-300 opacity-80'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-teal-800 bg-teal-950/80 text-center">
        <div className="flex items-center justify-center gap-1.5 text-amber-300 text-[11px] font-semibold">
          <Mosque className="w-3.5 h-3.5 text-amber-400" />
          <span>Sistem SholTrack v1.0</span>
        </div>
        <p className="text-[10px] text-teal-300/70 mt-0.5">Sholat 5 Waktu Tepat Waktu & Berjamaah</p>
      </div>
    </aside>
  );
};
