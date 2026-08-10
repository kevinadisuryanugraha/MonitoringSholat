import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { AbsensiRecord, Santri } from '../../types';
import { fetchWithCache } from '../../lib/queryCache';
import { StatusBadge } from '../common/StatusBadge';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert
} from 'lucide-react';

export const WaliKelasDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [classSantri, setClassSantri] = useState<Santri[]>([]);
  const [records, setRecords] = useState<AbsensiRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const kelasId = currentUser?.kelasId || 'kelas-1';
  const kelasNama = currentUser?.kelasNama || 'Kelas 7A (Tsanawiyah)';
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gunakan cache layer untuk mengurangi reads berulang
        const [santriList, absensiList] = await Promise.all([
          fetchWithCache<Santri>('santri'),
          fetchWithCache<AbsensiRecord>('absensi'),
        ]);

        // Filter di client-side berdasarkan kelasId
        const filteredSantri = santriList.filter(s => s.kelasId === kelasId);
        const filteredRecords = absensiList.filter(r => r.kelasId === kelasId);

        setClassSantri(filteredSantri);
        setRecords(filteredRecords);
      } catch (err) {
        console.error('Gagal mengambil data wali kelas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [kelasId]);

  // Statistik hari ini
  const todayRecords = records.filter(r => r.tanggal === todayStr);
  const totalPossibleToday = (classSantri.length || 8) * 5;
  const berjamaahToday = todayRecords.filter(r => r.status === 'berjamaah').length;
  const munfaridToday = todayRecords.filter(r => r.status === 'munfarid').length;
  const hadirTodayTotal = berjamaahToday + munfaridToday;
  const attendanceRateToday = totalPossibleToday > 0 
    ? Math.round((hadirTodayTotal / totalPossibleToday) * 100) 
    : 0;

  // Data chart tren 7 hari
  const get7DayChartData = () => {
    const chartData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'numeric' });

      const dayRecs = records.filter(r => r.tanggal === dateStr);
      const berj = dayRecs.filter(r => r.status === 'berjamaah').length;
      const munf = dayRecs.filter(r => r.status === 'munfarid').length;
      const totalRecorded = dayRecs.length || 1;

      const pct = Math.round(((berj + munf) / totalRecorded) * 100);

      chartData.push({
        date: dayLabel,
        'Hadir (%)': pct > 100 ? 100 : pct,
        Berjamaah: berj,
      });
    }
    return chartData;
  };

  // Statistik per santri
  const getSantriStatsList = () => {
    return classSantri.map(s => {
      const sRecs = records.filter(r => r.santriId === s.id);
      const totalRecorded = sRecs.length || 1;
      const berjamaah = sRecs.filter(r => r.status === 'berjamaah').length;
      const munfarid = sRecs.filter(r => r.status === 'munfarid').length;
      const alpha = sRecs.filter(r => r.status === 'alpha').length;
      const rate = Math.round(((berjamaah + munfarid) / totalRecorded) * 100);

      return {
        ...s,
        totalRecorded,
        berjamaah,
        munfarid,
        alpha,
        rate
      };
    }).sort((a, b) => a.rate - b.rate);
  };

  const santriStats = getSantriStatsList();
  const lowAttendanceStudents = santriStats.filter(s => s.rate < 70 || s.alpha >= 3);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 rounded-2xl p-6 text-white shadow-md border border-teal-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-400/30">
            <Users className="w-3.5 h-3.5" />
            <span>Monitoring Kelas</span>
          </div>
          <h1 className="text-2xl font-black">{kelasNama}</h1>
          <p className="text-xs text-teal-200 mt-1">
            Wali Kelas: <strong className="text-white">{currentUser?.name}</strong> • Total {classSantri.length} Santri Aktif
          </p>
        </div>

        <div className="bg-teal-950/70 backdrop-blur-xs px-4 py-3 rounded-xl border border-teal-700 text-right">
          <p className="text-xs text-teal-200">Kehadiran Hari Ini</p>
          <p className="text-2xl font-black text-amber-300">{attendanceRateToday}%</p>
        </div>
      </div>

      {/* 4 Kartu Metrik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Santri</span>
            <div className="p-2 bg-teal-50 text-teal-800 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">{classSantri.length}</p>
          <p className="text-[11px] text-teal-700 mt-1">Santri aktif di {kelasNama}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Hadir Berjamaah</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700">{berjamaahToday}</p>
          <p className="text-[11px] text-gray-500 mt-1">Sholat berjamaah hari ini</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Tingkat Kehadiran</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">{attendanceRateToday}%</p>
          <p className="text-[11px] text-gray-500 mt-1">Rata-rata kehadiran hari ini</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Perlu Perhatian</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700">{lowAttendanceStudents.length}</p>
          <p className="text-[11px] text-rose-800 font-medium mt-1">Santri Alpha &ge; 3 / Kehadiran &lt; 70%</p>
        </div>

      </div>

      {/* Tren Chart + Peringatan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-700" />
                <span>Tren Kehadiran Sholat 7 Hari Terakhir</span>
              </h3>
              <p className="text-xs text-gray-500">Persentase santri hadir berjamaah & munfarid per hari</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={get7DayChartData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#64748b" unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f766e', borderColor: '#0f766e', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Hadir (%)" 
                  stroke="#0d9488" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kotak Peringatan Santri */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-3">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Santri Perlu Perhatian (Peringatan)</span>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Santri yang sering Alpha atau memiliki tingkat kehadiran sholat terendah minggu ini:
            </p>

            {lowAttendanceStudents.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-xl text-center border border-emerald-200 text-emerald-800 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                <p className="font-bold">Alhamdulillah!</p>
                <p>Semua santri di kelas ini memiliki tingkat kehadiran sholat yang baik.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {lowAttendanceStudents.map((s) => (
                  <div key={s.id} className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{s.nama}</p>
                      <p className="text-[11px] text-gray-500">Alpha: <span className="font-bold text-rose-700">{s.alpha}x</span> • Berjamaah: {s.berjamaah}x</p>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-rose-200 text-rose-900">
                      {s.rate}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
            *Daftar ini disinkronkan otomatis dari absensi musyrif
          </div>
        </div>

      </div>

      {/* Tabel Kehadiran Santri */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-700" />
              <span>Daftar Kehadiran Santri {kelasNama}</span>
            </h3>
            <p className="text-xs text-gray-500">Rekap keaktifan sholat per santri</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[580px]">
            <thead className="bg-teal-50 text-teal-900 font-bold border-b border-teal-100">
              <tr>
                <th className="p-3 rounded-l-xl">Nama Santri</th>
                <th className="p-3">NIS</th>
                <th className="p-3">Kamar / Kelompok</th>
                <th className="p-3 text-center">Berjamaah</th>
                <th className="p-3 text-center">Munfarid</th>
                <th className="p-3 text-center">Alpha</th>
                <th className="p-3 text-right rounded-r-xl">Persentase Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {santriStats.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-3 font-semibold text-gray-900">{s.nama}</td>
                  <td className="p-3 text-gray-500">{s.nis}</td>
                  <td className="p-3 text-teal-800 font-medium">{s.kelompokNama}</td>
                  <td className="p-3 text-center font-bold text-emerald-700">{s.berjamaah}</td>
                  <td className="p-3 text-center font-bold text-sky-700">{s.munfarid}</td>
                  <td className="p-3 text-center font-bold text-rose-700">{s.alpha}</td>
                  <td className="p-3 text-right">
                    <span className={`inline-block font-extrabold px-2.5 py-1 rounded-lg text-xs ${
                      s.rate >= 85 ? 'bg-emerald-100 text-emerald-800' : s.rate >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
