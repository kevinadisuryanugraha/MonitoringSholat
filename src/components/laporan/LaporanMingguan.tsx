import React, { useState, useEffect } from 'react';
import { fetchWithCache } from '../../lib/queryCache';
import { AbsensiRecord, Santri, Kelas, WaktuSholatKey } from '../../types';
import * as XLSX from 'xlsx';
import { BarChart3, FileSpreadsheet, Filter, AlertTriangle } from 'lucide-react';

export const LaporanMingguan: React.FC = () => {
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [records, setRecords] = useState<AbsensiRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [santriData, kelasData, absensiData] = await Promise.all([
        fetchWithCache<Santri>('santri'),
        fetchWithCache<Kelas>('kelas'),
        fetchWithCache<AbsensiRecord>('absensi'),
      ]);

      setSantriList(santriData);
      setKelasList(kelasData);
      setRecords(absensiData);
    } catch (err) {
      console.error('Gagal mengambil laporan mingguan:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSantri = santriList.filter(s => selectedKelas ? s.kelasId === selectedKelas : true);

  // Compute weekly stats per santri (35 total prayer slots in a week)
  const getWeeklyStats = (santriId: string) => {
    const sRecords = records.filter(r => r.santriId === santriId);
    const berjamaah = sRecords.filter(r => r.status === 'berjamaah').length;
    const munfarid = sRecords.filter(r => r.status === 'munfarid').length;
    const alpha = sRecords.filter(r => r.status === 'alpha').length;
    const hadirTotal = berjamaah + munfarid;

    // Total possible prayer slots in 7 days = 35
    const totalPossible = 35;
    const percentage = Math.round((hadirTotal / totalPossible) * 100);

    return {
      berjamaah,
      munfarid,
      alpha,
      hadirTotal,
      totalPossible,
      percentage
    };
  };

  const handleExportExcel = () => {
    const data = filteredSantri.map((s, idx) => {
      const stats = getWeeklyStats(s.id);
      return {
        'No': idx + 1,
        'Nama Santri': s.nama,
        'NIS': s.nis,
        'Kelas': s.kelasNama,
        'Hadir Berjamaah': stats.berjamaah,
        'Hadir Munfarid': stats.munfarid,
        'Alpha': stats.alpha,
        'Total Hadir': `${stats.hadirTotal} / 35`,
        'Persentase (%)': `${stats.percentage}%`
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Mingguan');
    XLSX.writeFile(workbook, `Laporan_Sholat_Mingguan.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-700 flex-shrink-0" />
            <span>Laporan Rekapitulasi Mingguan Sholat</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Skor keaktifan sholat santri dari total 35 waktu sholat dalam seminggu</p>
        </div>

        <button
          onClick={handleExportExcel}
          className="self-start sm:self-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-300 flex-shrink-0" />
          <span>Ekspor Excel</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs w-full sm:max-w-xs">
        <label className="block text-[11px] font-bold text-gray-600 mb-1">Filter Kelas:</label>
        <select
          value={selectedKelas}
          onChange={(e) => setSelectedKelas(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white text-gray-700"
        >
          <option value="">-- Semua Kelas --</option>
          {kelasList.map(k => (
            <option key={k.id} value={k.id}>{k.namaKelas}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Memuat rekap mingguan...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[580px]">
              <thead className="bg-teal-50 text-teal-900 font-bold border-b border-teal-100">
                <tr>
                  <th className="p-3.5">Nama Santri</th>
                  <th className="p-3.5">Kelas</th>
                  <th className="p-3.5 text-center">Berjamaah</th>
                  <th className="p-3.5 text-center">Munfarid</th>
                  <th className="p-3.5 text-center">Alpha</th>
                  <th className="p-3.5 text-center">Skor Mingguan</th>
                  <th className="p-3.5 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSantri.map((s) => {
                  const stats = getWeeklyStats(s.id);
                  const isLow = stats.percentage < 60;

                  return (
                    <tr key={s.id} className={`hover:bg-gray-50 ${isLow ? 'bg-rose-50/40' : ''}`}>
                      <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                        {isLow && <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                        <span>{s.nama}</span>
                      </td>
                      <td className="p-3.5 text-gray-600 font-medium">{s.kelasNama}</td>
                      <td className="p-3.5 text-center font-bold text-emerald-700">{stats.berjamaah}</td>
                      <td className="p-3.5 text-center font-bold text-sky-700">{stats.munfarid}</td>
                      <td className="p-3.5 text-center font-bold text-rose-700">{stats.alpha}</td>
                      <td className="p-3.5 text-center font-black text-teal-900">
                        {stats.hadirTotal} / 35
                      </td>
                      <td className="p-3.5 text-right">
                        <span className={`inline-block font-extrabold px-2.5 py-1 rounded-lg text-xs ${
                          isLow ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {stats.percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
