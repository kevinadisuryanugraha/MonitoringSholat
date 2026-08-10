import React, { useState, useEffect } from 'react';
import { fetchWithCache } from '../../lib/queryCache';
import { AbsensiRecord, Santri, Kelas, WaktuSholatKey } from '../../types';
import * as XLSX from 'xlsx';
import { Mosque } from '../common/MosqueIcon';
import { FileText, FileSpreadsheet, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const LaporanBulanan: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
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
      console.error('Gagal mengambil laporan bulanan:', err);
    } finally {
      setLoading(false);
    }
  };

  const monthRecords = records.filter(r => r.tanggal.startsWith(selectedMonth));
  const filteredSantri = santriList.filter(s => selectedKelas ? s.kelasId === selectedKelas : true);

  // Prayer time breakdown chart data for selected month
  const getPrayerBreakdownData = () => {
    const sholats: { key: WaktuSholatKey; label: string }[] = [
      { key: 'subuh', label: 'Subuh' },
      { key: 'dzuhur', label: 'Dzuhur' },
      { key: 'ashar', label: 'Ashar' },
      { key: 'maghrib', label: 'Maghrib' },
      { key: 'isya', label: 'Isya' }
    ];

    return sholats.map(s => {
      const pRecs = monthRecords.filter(r => r.waktuSholat === s.key);
      const berjamaah = pRecs.filter(r => r.status === 'berjamaah').length;
      const munfarid = pRecs.filter(r => r.status === 'munfarid').length;
      const alpha = pRecs.filter(r => r.status === 'alpha').length;

      return {
        nama: s.label,
        Berjamaah: berjamaah,
        Munfarid: munfarid,
        Alpha: alpha
      };
    });
  };

  const handleExportExcel = () => {
    const data = filteredSantri.map((s, idx) => {
      const sRecs = monthRecords.filter(r => r.santriId === s.id);
      const berj = sRecs.filter(r => r.status === 'berjamaah').length;
      const munf = sRecs.filter(r => r.status === 'munfarid').length;
      const alpha = sRecs.filter(r => r.status === 'alpha').length;
      const sakit = sRecs.filter(r => r.status === 'sakit').length;
      const izin = sRecs.filter(r => r.status === 'izin').length;

      return {
        'No': idx + 1,
        'Nama Santri': s.nama,
        'NIS': s.nis,
        'Kelas': s.kelasNama,
        'Berjamaah': berj,
        'Munfarid': munf,
        'Sakit': sakit,
        'Izin': izin,
        'Alpha': alpha,
        'Total Catatan': sRecs.length
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Bulanan');
    XLSX.writeFile(workbook, `Laporan_Bulanan_Sholat_${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-700" />
            <span>Laporan Rekapitulasi Bulanan Sholat Santri</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Rekapitulasi komprehensif kehadiran sholat 5 waktu selama 1 bulan</p>
        </div>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-300" />
          <span>Ekspor Excel Bulanan</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">Pilih Bulan & Tahun:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-teal-950"
          />
        </div>

        <div>
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
      </div>

      {/* Prayer Breakdown Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <h3 className="text-sm font-bold text-gray-900 mb-1">Perbandingan Kehadiran per Waktu Sholat Bulan Ini</h3>
        <p className="text-xs text-gray-500 mb-4">Statistik sholat berjamaah vs munfarid vs alpha dalam sebulan</p>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getPrayerBreakdownData()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="nama" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f766e', borderColor: '#0f766e', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="Berjamaah" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Munfarid" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Alpha" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Bulanan */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[580px]">
            <thead className="bg-teal-50 text-teal-900 font-bold border-b border-teal-100">
              <tr>
                <th className="p-3.5">Nama Santri</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5 text-center">Berjamaah</th>
                <th className="p-3.5 text-center">Munfarid</th>
                <th className="p-3.5 text-center">Sakit / Izin</th>
                <th className="p-3.5 text-center">Alpha</th>
                <th className="p-3.5 text-right">Tingkat Keaktifan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSantri.map((s) => {
                const sRecs = monthRecords.filter(r => r.santriId === s.id);
                const berj = sRecs.filter(r => r.status === 'berjamaah').length;
                const munf = sRecs.filter(r => r.status === 'munfarid').length;
                const alpha = sRecs.filter(r => r.status === 'alpha').length;
                const sakitIzin = sRecs.filter(r => r.status === 'sakit' || r.status === 'izin').length;
                const totalRecorded = sRecs.length || 1;
                const rate = Math.round(((berj + munf) / totalRecorded) * 100);

                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-3.5 font-bold text-gray-900">{s.nama}</td>
                    <td className="p-3.5 text-gray-600 font-medium">{s.kelasNama}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-700">{berj}</td>
                    <td className="p-3.5 text-center font-bold text-sky-700">{munf}</td>
                    <td className="p-3.5 text-center text-amber-700 font-medium">{sakitIzin}</td>
                    <td className="p-3.5 text-center font-bold text-rose-700">{alpha}</td>
                    <td className="p-3.5 text-right">
                      <span className={`inline-block font-extrabold px-2.5 py-1 rounded-lg text-xs ${
                        rate >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
