import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { fetchWithCache } from '../../lib/queryCache';
import { AbsensiRecord, Santri, Kelas, Kelompok, WaktuSholatKey } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Mosque } from '../common/MosqueIcon';
import { Calendar, Download, Printer, Filter, FileSpreadsheet, FileText } from 'lucide-react';

export const LaporanHarian: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [selectedKelompok, setSelectedKelompok] = useState<string>('');

  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([]);
  const [records, setRecords] = useState<AbsensiRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Gunakan cache layer untuk mengurangi reads berulang
      const [santriData, kelasData, kelompokData] = await Promise.all([
        fetchWithCache<Santri>('santri'),
        fetchWithCache<Kelas>('kelas'),
        fetchWithCache<Kelompok>('kelompok'),
      ]);

      // Absensi difilter per tanggal — fetch dari Firestore langsung
      const aSnap = await getDocs(
        query(collection(db, 'absensi'), where('tanggal', '==', selectedDate), limit(500))
      );
      const aList: AbsensiRecord[] = [];
      aSnap.forEach(d => aList.push(d.data() as AbsensiRecord));

      setSantriList(santriData);
      setKelasList(kelasData);
      setKelompokList(kelompokData);
      setRecords(aList);
    } catch (err) {
      console.error('Gagal mengambil laporan harian:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter santri
  const filteredSantri = santriList.filter(s => {
    const matchesKelas = selectedKelas ? s.kelasId === selectedKelas : true;
    const matchesKelompok = selectedKelompok ? s.kelompokId === selectedKelompok : true;
    return matchesKelas && matchesKelompok;
  });

  const getSantriPrayerStatus = (santriId: string, sholat: WaktuSholatKey) => {
    return records.find(r => r.santriId === santriId && r.waktuSholat === sholat);
  };

  // Export Excel
  const handleExportExcel = () => {
    const exportData = filteredSantri.map((s, idx) => {
      const subuh = getSantriPrayerStatus(s.id, 'subuh')?.status || 'Belum';
      const dzuhur = getSantriPrayerStatus(s.id, 'dzuhur')?.status || 'Belum';
      const ashar = getSantriPrayerStatus(s.id, 'ashar')?.status || 'Belum';
      const maghrib = getSantriPrayerStatus(s.id, 'maghrib')?.status || 'Belum';
      const isya = getSantriPrayerStatus(s.id, 'isya')?.status || 'Belum';

      const sRecords = records.filter(r => r.santriId === s.id);
      const totalHadir = sRecords.filter(r => r.status === 'berjamaah' || r.status === 'munfarid').length;

      return {
        'No': idx + 1,
        'Nama Santri': s.nama,
        'NIS': s.nis,
        'Kelas': s.kelasNama,
        'Kamar/Kelompok': s.kelompokNama,
        'Subuh': subuh,
        'Dzuhur': dzuhur,
        'Ashar': ashar,
        'Maghrib': maghrib,
        'Isya': isya,
        'Total Hadir (x/5)': totalHadir
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Harian');
    XLSX.writeFile(workbook, `Laporan_Sholat_Harian_${selectedDate}.xlsx`);
  };

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SHOLTRACK - LAPORAN HARIAN SHOLAT SANTRI', 40, 40);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal: ${selectedDate}`, 40, 60);
    doc.text(`Total Santri: ${filteredSantri.length}`, 40, 75);

    let y = 100;
    doc.setFont('helvetica', 'bold');
    doc.text('No  Nama Santri             Subuh   Dzuhur   Ashar   Maghrib  Isya  Hadir', 40, y);
    doc.line(40, y + 5, 550, y + 5);
    y += 20;

    doc.setFont('helvetica', 'normal');
    filteredSantri.forEach((s, idx) => {
      const sub = getSantriPrayerStatus(s.id, 'subuh')?.status?.substring(0, 3) || '-';
      const dzu = getSantriPrayerStatus(s.id, 'dzuhur')?.status?.substring(0, 3) || '-';
      const ash = getSantriPrayerStatus(s.id, 'ashar')?.status?.substring(0, 3) || '-';
      const mag = getSantriPrayerStatus(s.id, 'maghrib')?.status?.substring(0, 3) || '-';
      const isy = getSantriPrayerStatus(s.id, 'isya')?.status?.substring(0, 3) || '-';

      const sRecords = records.filter(r => r.santriId === s.id);
      const totalHadir = sRecords.filter(r => r.status === 'berjamaah' || r.status === 'munfarid').length;

      const nameStr = (s.nama.length > 22 ? s.nama.substring(0, 20) + '..' : s.nama).padEnd(24);
      doc.text(`${(idx + 1).toString().padStart(2)}  ${nameStr} ${sub.padEnd(7)} ${dzu.padEnd(8)} ${ash.padEnd(7)} ${mag.padEnd(8)} ${isy.padEnd(5)} ${totalHadir}/5`, 40, y);
      y += 15;

      if (y > 780) {
        doc.addPage();
        y = 40;
      }
    });

    doc.save(`Laporan_Harian_Sholat_${selectedDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-700 flex-shrink-0" />
            <span>Laporan Sholat Harian Santri</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Rekapitulasi absensi 5 waktu sholat pada tanggal terpilih</p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">Tanggal Absensi:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
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

        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">Filter Kamar / Kelompok:</label>
          <select
            value={selectedKelompok}
            onChange={(e) => setSelectedKelompok(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white text-gray-700"
          >
            <option value="">-- Semua Kamar / Kelompok --</option>
            {kelompokList.map(k => (
              <option key={k.id} value={k.id}>{k.namaKelompok}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Memuat laporan harian...</p>
          </div>
        ) : filteredSantri.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Mosque className="w-10 h-10 mx-auto mb-2 opacity-30 text-teal-600" />
            <p className="text-xs font-semibold">Tidak ada santri untuk filter ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-teal-50 text-teal-900 font-bold border-b border-teal-100">
                <tr>
                  <th className="p-3.5">Nama Santri</th>
                  <th className="p-3.5">Kelas / Kamar</th>
                  <th className="p-3.5 text-center">Subuh</th>
                  <th className="p-3.5 text-center">Dzuhur</th>
                  <th className="p-3.5 text-center">Ashar</th>
                  <th className="p-3.5 text-center">Maghrib</th>
                  <th className="p-3.5 text-center">Isya</th>
                  <th className="p-3.5 text-right">Total Hadir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSantri.map((s) => {
                  const sRecords = records.filter(r => r.santriId === s.id);
                  const totalHadir = sRecords.filter(r => r.status === 'berjamaah' || r.status === 'munfarid').length;

                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold text-gray-900">
                        {s.nama}
                        <span className="block text-[11px] text-gray-400 font-normal">NIS: {s.nis}</span>
                      </td>
                      <td className="p-3.5 text-gray-600">
                        <span className="font-semibold text-teal-800">{s.kelasNama}</span>
                        <span className="block text-[11px] text-gray-500">{s.kelompokNama}</span>
                      </td>

                      {(['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as WaktuSholatKey[]).map((sholat) => {
                        const rec = getSantriPrayerStatus(s.id, sholat);
                        return (
                          <td key={sholat} className="p-3.5 text-center">
                            {rec ? (
                              <StatusBadge status={rec.status} size="sm" showIcon={false} />
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">-</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="p-3.5 text-right font-black text-teal-900">
                        <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                          {totalHadir} / 5
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
