import React, { useState, useEffect } from 'react';
import { fetchWithCache } from '../../lib/queryCache';
import { Santri, Kelas, Kelompok, AbsensiRecord, UserAccount } from '../../types';
import { 
  School, 
  Users, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  BarChart3, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell 
} from 'recharts';

interface Props {
  onNavigateTab: (tab: string) => void;
}

export const KepalaSekolahDashboard: React.FC<Props> = ({ onNavigateTab }) => {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([]);
  const [records, setRecords] = useState<AbsensiRecord[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [santriData, kelasData, kelompokData, absensiData, userData] = await Promise.all([
          fetchWithCache<Santri>('santri'),
          fetchWithCache<Kelas>('kelas'),
          fetchWithCache<Kelompok>('kelompok'),
          fetchWithCache<AbsensiRecord>('absensi'),
          fetchWithCache<UserAccount>('users'),
        ]);

        setSantriList(santriData);
        setKelasList(kelasData);
        setKelompokList(kelompokData);
        setRecords(absensiData);
        setUsers(userData);
      } catch (err) {
        console.error('Gagal mengambil data dashboard kepala sekolah:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Compute school stats
  const todayRecords = records.filter(r => r.tanggal === todayStr);
  const totalSantri = santriList.length || 19;
  const totalPossibleToday = totalSantri * 5;
  const berjamaahToday = todayRecords.filter(r => r.status === 'berjamaah').length;
  const munfaridToday = todayRecords.filter(r => r.status === 'munfarid').length;
  const hadirTodayTotal = berjamaahToday + munfaridToday;
  const attendanceRateToday = totalPossibleToday > 0 ? Math.round((hadirTodayTotal / totalPossibleToday) * 100) : 0;

  // Class Comparison Chart Data
  const getClassComparisonData = () => {
    return kelasList.map(k => {
      const kSantriIds = new Set(santriList.filter(s => s.kelasId === k.id).map(s => s.id));
      const kRecs = records.filter(r => kSantriIds.has(r.santriId));
      const totalRecs = kRecs.length || 1;
      const berj = kRecs.filter(r => r.status === 'berjamaah').length;
      const munf = kRecs.filter(r => r.status === 'munfarid').length;
      const rate = Math.round(((berj + munf) / totalRecs) * 100);

      return {
        nama: k.namaKelas.split(' ')[0] + ' ' + (k.namaKelas.split(' ')[1] || ''),
        fullNama: k.namaKelas,
        Kehadiran: rate > 100 ? 100 : rate,
        Berjamaah: berj,
        SantriCount: kSantriIds.size
      };
    }).sort((a, b) => b.Kehadiran - a.Kehadiran);
  };

  const classChartData = getClassComparisonData();

  // Missing Musyrif Attendance Fill Check for Today
  const getMissingMusyrifAlerts = () => {
    const filledKelompokIds = new Set(todayRecords.map(r => r.kelompokId));
    return kelompokList.filter(k => !filledKelompokIds.has(k.id));
  };

  const missingKelompoks = getMissingMusyrifAlerts();

  return (
    <div className="space-y-6">
      
      {/* Executive Hero Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 rounded-2xl p-6 text-white shadow-xl border border-teal-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-400/30">
            <School className="w-4 h-4" />
            <span>Dashboard Eksekutif Kepala Sekolah</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Monitoring Ibadah Sholat Pesantren
          </h1>
          <p className="text-xs text-teal-200 mt-1">
            Memonitor keaktifan sholat berjamaah secara real-time di seluruh kelas dan kamar santri
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('analitik')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-teal-950 font-black text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Lihat Analitik Sholat</span>
          </button>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Santri</span>
            <div className="p-2 bg-teal-50 text-teal-800 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{totalSantri}</p>
          <p className="text-[11px] text-teal-700 mt-1">Di {kelasList.length} Kelas & {kelompokList.length} Kamar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Tingkat Kehadiran Sekolah</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700">{attendanceRateToday}%</p>
          <p className="text-[11px] text-gray-500 mt-1">Rata-rata 5 waktu sholat hari ini</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Kelas Peringkat #1</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Award className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-lg font-black text-amber-600 truncate">{classChartData[0]?.nama || 'Kelas 7A'}</p>
          <p className="text-[11px] text-gray-500 mt-1">Kehadiran: {classChartData[0]?.Kehadiran}%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Kamar Belum Diisi</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700">{missingKelompoks.length}</p>
          <p className="text-[11px] text-rose-800 font-medium mt-1">Perlu pengisian oleh Musyrif</p>
        </div>

      </div>

      {/* Class Comparison Chart & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Class Comparison Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-700" />
                <span>Perbandingan Kehadiran Sholat Antar Kelas</span>
              </h3>
              <p className="text-xs text-gray-500">Rata-rata persentase keaktifan sholat di tiap kelas</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="nama" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#64748b" unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f766e', borderColor: '#0f766e', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="Kehadiran" radius={[8, 8, 0, 0]}>
                  {classChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#0d9488'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Musyrif Pending Alert Box */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-teal-700" />
              <span>Status Pengisian Kamar / Kelompok Hari Ini</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">Monitoring kepatuhan musyrif mencatat absensi</p>

            <div className="space-y-3">
              {kelompokList.map((kel) => {
                const isPending = missingKelompoks.some(m => m.id === kel.id);
                return (
                  <div 
                    key={kel.id} 
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      isPending ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50/60 border-emerald-200'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{kel.namaKelompok}</p>
                      <p className="text-[11px] text-gray-500">Musyrif: {kel.musyrifNama || 'Belum diisi'}</p>
                    </div>
                    {isPending ? (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full">
                        Pending
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-200 px-2.5 py-0.5 rounded-full">
                        Sudah Diisi
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Pemberitahuan otomatis ke musyrif</span>
            <button
              onClick={() => onNavigateTab('manajemen-user')}
              className="text-xs font-bold text-teal-800 hover:underline"
            >
              Kelola Musyrif &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <button
          onClick={() => onNavigateTab('santri')}
          className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-teal-400 shadow-2xs hover:shadow-md transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-800 rounded-xl group-hover:bg-teal-800 group-hover:text-amber-300 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Kelola Master Santri</h4>
              <p className="text-xs text-gray-500">Tambah, edit & nonaktifkan data santri</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-800" />
        </button>

        <button
          onClick={() => onNavigateTab('kelas-kelompok')}
          className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-teal-400 shadow-2xs hover:shadow-md transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-800 rounded-xl group-hover:bg-teal-800 group-hover:text-amber-300 transition-colors">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Data Kelas & Kamar</h4>
              <p className="text-xs text-gray-500">Atur Wali Kelas & Musyrif kamar</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-800" />
        </button>

        <button
          onClick={() => onNavigateTab('laporan-bulanan')}
          className="p-5 bg-white rounded-2xl border border-gray-200 hover:border-teal-400 shadow-2xs hover:shadow-md transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-800 rounded-xl group-hover:bg-teal-800 group-hover:text-amber-300 transition-colors">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Laporan & Ekspor PDF</h4>
              <p className="text-xs text-gray-500">Cetak laporan harian, mingguan, bulanan</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-800" />
        </button>

      </div>

    </div>
  );
};
