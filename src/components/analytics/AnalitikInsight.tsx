import React, { useState, useEffect } from 'react';
import { fetchWithCache } from '../../lib/queryCache';
import { AbsensiRecord, Santri, WaktuSholatKey } from '../../types';
import { Mosque } from '../common/MosqueIcon';
import { PieChart, Sparkles, AlertTriangle, TrendingUp, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AnalitikInsight: React.FC = () => {
  const [records, setRecords] = useState<AbsensiRecord[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [absensiData, santriData] = await Promise.all([
        fetchWithCache<AbsensiRecord>('absensi'),
        fetchWithCache<Santri>('santri'),
      ]);

      setRecords(absensiData);
      setSantriList(santriData);
    } catch (err) {
      console.error('Gagal mengambil data analitik:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Most Skipped / Highest Alpha Prayer Time
  const getPrayerAlphaStats = () => {
    const sholats: { key: WaktuSholatKey; label: string }[] = [
      { key: 'subuh', label: 'Subuh' },
      { key: 'dzuhur', label: 'Dzuhur' },
      { key: 'ashar', label: 'Ashar' },
      { key: 'maghrib', label: 'Maghrib' },
      { key: 'isya', label: 'Isya' }
    ];

    return sholats.map(s => {
      const pRecs = records.filter(r => r.waktuSholat === s.key);
      const alphaCount = pRecs.filter(r => r.status === 'alpha').length;
      const totalRecs = pRecs.length || 1;
      const alphaRate = Math.round((alphaCount / totalRecs) * 100);

      return {
        nama: s.label,
        AlphaCount: alphaCount,
        TingkatAlpha: alphaRate
      };
    }).sort((a, b) => b.AlphaCount - a.AlphaCount);
  };

  const prayerAlphaStats = getPrayerAlphaStats();
  const mostSkippedPrayer = prayerAlphaStats[0];

  // 2. Day of Week Analysis
  const getDayOfWeekStats = () => {
    const daysMap = new Map<string, { total: number; alpha: number; hadir: number }>();
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    records.forEach(r => {
      const dayIdx = new Date(r.tanggal).getDay();
      const dayName = dayNames[dayIdx];
      const curr = daysMap.get(dayName) || { total: 0, alpha: 0, hadir: 0 };
      curr.total += 1;
      if (r.status === 'alpha') curr.alpha += 1;
      if (r.status === 'berjamaah' || r.status === 'munfarid') curr.hadir += 1;
      daysMap.set(dayName, curr);
    });

    return Array.from(daysMap.entries()).map(([day, stats]) => ({
      day,
      rate: Math.round((stats.hadir / (stats.total || 1)) * 100),
      alpha: stats.alpha
    })).sort((a, b) => a.rate - b.rate);
  };

  const dayOfWeekStats = getDayOfWeekStats();
  const lowestDay = dayOfWeekStats[0];

  // 3. Students needing special attention (Consistent Alpha)
  const getSpecialAttentionStudents = () => {
    return santriList.map(s => {
      const sRecs = records.filter(r => r.santriId === s.id);
      const alphaCount = sRecs.filter(r => r.status === 'alpha').length;
      return { ...s, alphaCount };
    }).filter(s => s.alphaCount >= 3).sort((a, b) => b.alphaCount - a.alphaCount);
  };

  const attentionStudents = getSpecialAttentionStudents();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-teal-700" />
            <span>Analitik & Insight Kedisiplinan Sholat</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Analisis pola kehadiran, waktu sholat yang sering terlewat, dan kecenderungan santri</p>
        </div>
      </div>

      {/* 3 Insight Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Most Skipped Prayer */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase mb-2">
            <Mosque className="w-4 h-4 text-rose-600" />
            <span>Sholat Paling Banyak Diabaikan</span>
          </div>
          <p className="text-2xl font-black text-rose-700">{mostSkippedPrayer?.nama || 'Subuh'}</p>
          <p className="text-xs text-gray-600 mt-1">
            Total {mostSkippedPrayer?.AlphaCount || 0} kejadian Alpha/Ketiduran
          </p>
        </div>

        {/* Lowest Day */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase mb-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>Hari Kehadiran Terendah</span>
          </div>
          <p className="text-2xl font-black text-amber-700">{lowestDay?.day || 'Minggu'}</p>
          <p className="text-xs text-gray-600 mt-1">
            Rata-rata kehadiran: {lowestDay?.rate || 0}%
          </p>
        </div>

        {/* Attention Count */}
        <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-2xs">
          <div className="flex items-center gap-2 text-teal-900 text-xs font-bold uppercase mb-2">
            <ShieldAlert className="w-4 h-4 text-teal-700" />
            <span>Perlu Konseling Khusus</span>
          </div>
          <p className="text-2xl font-black text-teal-900">{attentionStudents.length} Santri</p>
          <p className="text-xs text-gray-600 mt-1">
            Santri dengan Alpha &ge; 3 kali
          </p>
        </div>

      </div>

      {/* Prayer Alpha Distribution Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <h3 className="text-sm font-bold text-gray-900 mb-1">Distribusi Kejadian Alpha per Waktu Sholat</h3>
        <p className="text-xs text-gray-500 mb-4">Membantu musyrif menentukan waktu mana yang memerlukan pengawasan ketat</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={prayerAlphaStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="nama" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#be123c', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Bar dataKey="AlphaCount" fill="#e11d48" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
