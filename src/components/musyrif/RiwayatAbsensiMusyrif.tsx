import React, { useState, useEffect } from 'react';
import { fetchWithCache } from '../../lib/queryCache';
import { useAuth } from '../../context/AuthContext';
import { AbsensiRecord, WaktuSholatKey } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Mosque } from '../common/MosqueIcon';
import { Calendar as CalendarIcon, CheckCircle2, AlertCircle, Filter, ChevronRight } from 'lucide-react';

export const RiwayatAbsensiMusyrif: React.FC = () => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<AbsensiRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const kelId = currentUser?.kelompokId || 'kelompok-1';
        
        // Gunakan cache untuk mengurangi reads
        const allRecords = await fetchWithCache<AbsensiRecord>('absensi');
        
        // Filter di client-side berdasarkan kelompok
        const filtered = allRecords.filter(r => r.kelompokId === kelId);
        setRecords(filtered);
      } catch (err) {
        console.error('Gagal mengambil riwayat:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser?.kelompokId]);

  // Group records by Date (YYYY-MM-DD)
  const filteredRecords = records.filter(r => r.tanggal.startsWith(selectedMonth));
  
  const groupedByDate = new Map<string, AbsensiRecord[]>();
  filteredRecords.forEach(r => {
    const arr = groupedByDate.get(r.tanggal) || [];
    arr.push(r);
    groupedByDate.set(r.tanggal, arr);
  });

  const sortedDates = Array.from(groupedByDate.keys()).sort().reverse();

  const getSholatBreakdown = (dateRecords: AbsensiRecord[]) => {
    const sholats: WaktuSholatKey[] = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    const filledSholats = new Set(dateRecords.map(r => r.waktuSholat));
    const completedCount = sholats.filter(s => filledSholats.has(s)).length;
    return {
      completedCount,
      isFullyCompleted: completedCount === 5
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-teal-700" />
            <span>Riwayat Absensi {currentUser?.kelompokNama || 'Kamar Madinah'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Daftar rekap dan riwayat pengisian sholat per hari</p>
        </div>

        {/* Month Selector Filter */}
        <div className="flex items-center gap-2 bg-teal-50/80 px-3 py-1.5 rounded-xl border border-teal-200">
          <Filter className="w-4 h-4 text-teal-700" />
          <span className="text-xs font-semibold text-teal-900">Bulan:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-bold text-teal-950 bg-transparent focus:outline-hidden"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500">Memuat riwayat...</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Mosque className="w-12 h-12 text-teal-600/30 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-800">Tidak ada data di bulan ini</h3>
          <p className="text-xs text-gray-500 mt-1">Belum ada catatan absensi sholat untuk periode yang dipilih</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateStr) => {
            const dateRecs = groupedByDate.get(dateStr) || [];
            const { completedCount, isFullyCompleted } = getSholatBreakdown(dateRecs);

            return (
              <div key={dateStr} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                
                {/* Date header bar */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">
                      {new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-gray-400">({dateStr})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isFullyCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Lengkap 5/5 Sholat
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        {completedCount}/5 Terisi
                      </span>
                    )}
                  </div>
                </div>

                {/* Sholat status summary chips */}
                <div className="pt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as WaktuSholatKey[]).map((sholat) => {
                    const sholatRecs = dateRecs.filter(r => r.waktuSholat === sholat);
                    const isFilled = sholatRecs.length > 0;
                    const berjamaah = sholatRecs.filter(r => r.status === 'berjamaah').length;

                    return (
                      <div 
                        key={sholat} 
                        className={`p-2.5 rounded-lg border text-xs ${
                          isFilled ? 'bg-teal-50/50 border-teal-200' : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold capitalize text-teal-900">{sholat}</span>
                          {isFilled ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                              ✓
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">-</span>
                          )}
                        </div>
                        {isFilled && (
                          <p className="text-[11px] text-gray-600 mt-1">
                            {berjamaah} / {sholatRecs.length} Berjamaah
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
