import React from 'react';
import { UserRole } from '../../types';
import { LayoutDashboard, ClipboardCheck, Calendar, FileText, Users, School } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
}

export const MobileNav: React.FC<Props> = ({ activeTab, setActiveTab, role }) => {
  const getNavItems = () => {
    switch (role) {
      case 'musyrif':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'form-absensi', label: 'Isi Absen', icon: ClipboardCheck },
          { id: 'laporan-harian', label: 'Laporan', icon: Calendar },
        ];
      case 'wali_kelas':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'laporan-harian', label: 'Harian', icon: Calendar },
          { id: 'laporan-bulanan', label: 'Bulanan', icon: FileText },
          { id: 'santri', label: 'Santri', icon: Users },
        ];
      case 'kepala_sekolah':
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'laporan-harian', label: 'Laporan', icon: Calendar },
          { id: 'santri', label: 'Santri', icon: Users },
          { id: 'kelas-kelompok', label: 'Kelas', icon: School },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-teal-950 border-t border-teal-800 text-white shadow-2xl px-2 py-2 flex justify-around items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl text-[10px] font-bold transition-all min-w-[64px] ${
              isActive 
                ? 'text-amber-300 bg-teal-900/90 border border-teal-700/50' 
                : 'text-teal-300/70 hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-amber-400 text-teal-950 font-black shadow-xs' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="mt-1 tracking-tight truncate max-w-[70px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
