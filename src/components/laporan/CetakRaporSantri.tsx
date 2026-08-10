import React, { useState, useEffect } from 'react';
import { fetchWithCache } from '../../lib/queryCache';
import { Santri, AbsensiRecord, WaktuSholatKey } from '../../types';
import { Mosque } from '../common/MosqueIcon';
import { Printer, Award, CheckCircle2, FileText, User } from 'lucide-react';

export const CetakRaporSantri: React.FC = () => {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [selectedSantriId, setSelectedSantriId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7));
  const [records, setRecords] = useState<AbsensiRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSantri();
  }, []);

  const fetchSantri = async () => {
    setLoading(true);
    try {
      const [santriData, absensiData] = await Promise.all([
        fetchWithCache<Santri>('santri'),
        fetchWithCache<AbsensiRecord>('absensi'),
      ]);

      setSantriList(santriData);
      if (santriData.length > 0) {
        setSelectedSantriId(santriData[0].id);
      }
      setRecords(absensiData);
    } catch (err) {
      console.error('Gagal mengambil data rapor:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentSantri = santriList.find(s => s.id === selectedSantriId) || santriList[0];
  const santriMonthRecords = records.filter(r => r.santriId === selectedSantriId && r.tanggal.startsWith(selectedMonth));

  const getSholatStat = (sholatKey: WaktuSholatKey) => {
    const sRecs = santriMonthRecords.filter(r => r.waktuSholat === sholatKey);
    const berjamaah = sRecs.filter(r => r.status === 'berjamaah').length;
    const munfarid = sRecs.filter(r => r.status === 'munfarid').length;
    const sakit = sRecs.filter(r => r.status === 'sakit').length;
    const izin = sRecs.filter(r => r.status === 'izin').length;
    const alpha = sRecs.filter(r => r.status === 'alpha').length;

    return { berjamaah, munfarid, sakit, izin, alpha, total: sRecs.length };
  };

  const totalBerjamaahAll = santriMonthRecords.filter(r => r.status === 'berjamaah').length;
  const totalMunfaridAll = santriMonthRecords.filter(r => r.status === 'munfarid').length;
  const totalAlphaAll = santriMonthRecords.filter(r => r.status === 'alpha').length;
  const totalRecorded = santriMonthRecords.length || 1;

  const attendanceScore = Math.round(((totalBerjamaahAll + totalMunfaridAll) / totalRecorded) * 100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Control Bar (hidden during print) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 print:hidden">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-700 flex-shrink-0" />
            <span>Cetak Rapor Ibadah Sholat Santri (Format A4)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Pilih santri dan periode bulan untuk mencetak rapor resmi</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-amber-300 rounded-xl font-black text-xs shadow-md flex items-center gap-2"
          >
            <Printer className="w-4 h-4 flex-shrink-0" />
            <span>Cetak Rapor A4</span>
          </button>
        </div>
      </div>

      {/* Selectors (hidden during print) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">Pilih Santri:</label>
          <select
            value={selectedSantriId}
            onChange={(e) => setSelectedSantriId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-teal-950 bg-white"
          >
            {santriList.map(s => (
              <option key={s.id} value={s.id}>{s.nama} ({s.nis}) - {s.kelasNama}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">Pilih Bulan & Tahun:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-teal-950"
          />
        </div>
      </div>

      {/* Printable A4 Rapor Sheet */}
      {currentSantri && (
        <div id="rapor-a4-sheet" className="bg-white rounded-2xl border border-gray-300 p-4 sm:p-8 shadow-lg print:shadow-none print:border-none print:p-0">
          
          {/* School Kop / Header */}
          <div className="border-b-4 border-teal-800 pb-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center font-bold text-2xl shadow-md border border-amber-400/40 flex-shrink-0">
                <Mosque className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-extrabold text-teal-950 tracking-tight uppercase">PONDOK PESANTREN & ISLAMIC SCHOOL</h2>
                <h3 className="text-sm sm:text-lg font-bold text-teal-800">RAPOR EVALUASI IBADAH SHOLAT 5 WAKTU</h3>
                <p className="text-[11px] sm:text-xs text-gray-500">Jl. Pesantren No. 1 • Telp: (021) 555-0199 • Email: info@pesantren.sch.id</p>
              </div>
            </div>
            <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 sm:pl-4 border-gray-200 w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Periode Evaluasi</span>
              <span className="text-xs sm:text-sm font-extrabold text-teal-900">{new Date(`${selectedMonth}-01`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Student Profile Identity Grid */}
          <div className="bg-teal-50/60 rounded-xl p-3.5 sm:p-4 border border-teal-100 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-500 block text-[10px]">Nama Santri:</span>
              <strong className="font-bold text-gray-900 text-xs sm:text-sm truncate block">{currentSantri.nama}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">NIS (No. Induk):</span>
              <strong className="font-mono text-gray-800 text-xs truncate block">{currentSantri.nis}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">Kelas:</span>
              <strong className="text-teal-800 text-xs truncate block">{currentSantri.kelasNama}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">Kamar / Kelompok:</span>
              <strong className="text-teal-800 text-xs truncate block">{currentSantri.kelompokNama}</strong>
            </div>
          </div>

          {/* Breakdown Table Sholat 5 Waktu */}
          <div className="mb-6">
            <h4 className="font-bold text-xs uppercase text-teal-900 tracking-wider mb-2">I. Rekapitulasi Kehadiran Sholat 5 Waktu</h4>
            <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-2xs">
              <table className="w-full text-xs text-left border-collapse min-w-[520px]">
                <thead className="bg-teal-900 text-white font-bold">
                  <tr>
                    <th className="p-2.5 border border-teal-800">Waktu Sholat</th>
                    <th className="p-2.5 border border-teal-800 text-center">Hadir Berjamaah</th>
                    <th className="p-2.5 border border-teal-800 text-center">Hadir Munfarid</th>
                    <th className="p-2.5 border border-teal-800 text-center">Sakit</th>
                    <th className="p-2.5 border border-teal-800 text-center">Izin</th>
                    <th className="p-2.5 border border-teal-800 text-center">Alpha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium text-gray-800 bg-white">
                  {(['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as WaktuSholatKey[]).map((sholat) => {
                    const stat = getSholatStat(sholat);
                    return (
                      <tr key={sholat} className="hover:bg-gray-50">
                        <td className="p-2.5 border font-bold capitalize text-teal-950">{sholat}</td>
                        <td className="p-2.5 border text-center font-bold text-emerald-700">{stat.berjamaah}</td>
                        <td className="p-2.5 border text-center text-sky-700">{stat.munfarid}</td>
                        <td className="p-2.5 border text-center text-slate-600">{stat.sakit}</td>
                        <td className="p-2.5 border text-center text-amber-700">{stat.izin}</td>
                        <td className="p-2.5 border text-center font-bold text-rose-700">{stat.alpha}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overall Score Badge */}
          <div className="bg-amber-50 rounded-xl p-3.5 sm:p-4 border border-amber-200 mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-amber-900">Predikat Keaktifan Sholat Berjamaah</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {attendanceScore >= 85 ? 'Sangat Baik (Mumtaz) — Istiqomah berjamaah tepat waktu' : 'Cukup Baik — Tingkatkan ketepatan waktu berjamaah'}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-2xl font-black text-amber-600">{attendanceScore}%</span>
              <span className="text-[10px] text-gray-500 block">Tingkat Kehadiran</span>
            </div>
          </div>

          {/* Musyrif Notes */}
          <div className="border border-gray-300 rounded-xl p-4 mb-8">
            <p className="text-xs font-bold text-teal-900 uppercase mb-1">Catatan Evaluasi Musyrif / Wali Kelas:</p>
            <p className="text-xs text-gray-700 italic leading-relaxed">
              "Ananda {currentSantri.nama} secara umum menunjukkan kedisiplinan yang baik dalam menjalankan sholat 5 waktu berjamaah di masjid. Semoga tetap istiqomah dan dijaga keikhlasannya."
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
            <div>
              <p className="text-gray-500">Musyrif / Wali Kelas,</p>
              <div className="h-16" />
              <p className="font-bold underline text-gray-900">Ustadz Ahmad Fauzi, S.Pd.I</p>
              <p className="text-[10px] text-gray-500">NIP: 19850412 201001 1 002</p>
            </div>

            <div>
              <p className="text-gray-500">Kepala Sekolah / Pengasuh,</p>
              <div className="h-16" />
              <p className="font-bold underline text-gray-900">K.H. Mansur Hidayat, M.Ag</p>
              <p className="text-[10px] text-gray-500">NIP: 19720815 199803 1 001</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
