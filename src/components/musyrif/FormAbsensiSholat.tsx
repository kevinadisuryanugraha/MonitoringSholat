import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Santri, WaktuSholatKey, StatusSholat, AlasanAlpha, AbsensiRecord } from '../../types';
import { DEFAULT_SHOLAT_CONFIG } from '../../lib/seedData';
import { Mosque } from '../common/MosqueIcon';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Save, 
  ArrowLeft, 
  CheckCheck, 
  Thermometer, 
  FileText, 
  XCircle,
  HelpCircle
} from 'lucide-react';

interface Props {
  waktuSholatKey: WaktuSholatKey;
  onBack: () => void;
  onSuccess: () => void;
}

interface SantriAbsenState {
  santri: Santri;
  status: StatusSholat | null;
  alasanAlpha: AlasanAlpha | string;
  catatan: string;
}

export const FormAbsensiSholat: React.FC<Props> = ({
  waktuSholatKey,
  onBack,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const [absenList, setAbsenList] = useState<SantriAbsenState[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const sholatConfig = DEFAULT_SHOLAT_CONFIG.find(c => c.id === waktuSholatKey) || DEFAULT_SHOLAT_CONFIG[0];

  const formatIndonesianDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const loadForm = async () => {
      setLoading(true);
      try {
        const kelId = currentUser?.kelompokId || 'kelompok-1';

        // 1. Fetch Santri for Musyrif's group
        const qSantri = query(collection(db, 'santri'), where('kelompokId', '==', kelId));
        const snapSantri = await getDocs(qSantri);
        const santriList: Santri[] = [];
        snapSantri.forEach(doc => santriList.push(doc.data() as Santri));

        // 2. Fetch existing absensi records for today & this sholat
        const qExisting = query(
          collection(db, 'absensi'),
          where('kelompokId', '==', kelId),
          where('tanggal', '==', todayStr),
          where('waktuSholat', '==', waktuSholatKey)
        );
        const snapExisting = await getDocs(qExisting);
        const existingMap = new Map<string, AbsensiRecord>();
        snapExisting.forEach(doc => {
          const rec = doc.data() as AbsensiRecord;
          existingMap.set(rec.santriId, rec);
        });

        // 3. Map into state
        const initialStates: SantriAbsenState[] = santriList.map(s => {
          const existing = existingMap.get(s.id);
          return {
            santri: s,
            status: existing ? existing.status : null,
            alasanAlpha: existing?.alasanAlpha || 'tanpa_keterangan',
            catatan: existing?.catatan || ''
          };
        });

        setAbsenList(initialStates);
      } catch (err) {
        console.error('Error loading form:', err);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [currentUser?.kelompokId, todayStr, waktuSholatKey]);

  // Bulk action: Mark all as Hadir Berjamaah
  const handleMarkAllBerjamaah = () => {
    setAbsenList(prev => prev.map(item => ({
      ...item,
      status: 'berjamaah'
    })));
  };

  const handleStatusChange = (santriId: string, status: StatusSholat) => {
    setAbsenList(prev => prev.map(item => {
      if (item.santri.id === santriId) {
        return {
          ...item,
          status,
          alasanAlpha: status === 'alpha' ? 'tanpa_keterangan' : item.alasanAlpha
        };
      }
      return item;
    }));
  };

  const handleAlasanChange = (santriId: string, val: string) => {
    setAbsenList(prev => prev.map(item => {
      if (item.santri.id === santriId) {
        return { ...item, alasanAlpha: val };
      }
      return item;
    }));
  };

  const handleCatatanChange = (santriId: string, val: string) => {
    setAbsenList(prev => prev.map(item => {
      if (item.santri.id === santriId) {
        return { ...item, catatan: val };
      }
      return item;
    }));
  };

  const handleSave = async () => {
    setErrorMessage(null);
    // Validation check: ensure no santri is unselected
    const unselected = absenList.filter(i => i.status === null);
    if (unselected.length > 0) {
      setErrorMessage(`Harap pilih status kehadiran untuk semua santri! (${unselected.length} santri belum dipilih)`);
      return;
    }

    setSaving(true);
    try {
      const batch = writeBatch(db);
      const nowIso = new Date().toISOString();

      for (const item of absenList) {
        const id = `abs-${todayStr}-${item.santri.id}-${waktuSholatKey}`;
        const record: AbsensiRecord = {
          id,
          santriId: item.santri.id,
          santriNama: item.santri.nama,
          nis: item.santri.nis,
          kelompokId: item.santri.kelompokId,
          kelompokNama: item.santri.kelompokNama,
          kelasId: item.santri.kelasId,
          kelasNama: item.santri.kelasNama,
          musyrifId: currentUser?.id || 'user-musyrif-1',
          musyrifNama: currentUser?.name || 'Musyrif',
          tanggal: todayStr,
          waktuSholat: waktuSholatKey,
          status: item.status!,
          alasanAlpha: item.status === 'alpha' ? item.alasanAlpha : null,
          catatan: item.catatan || null,
          createdAt: nowIso,
          updatedAt: nowIso
        };

        const docRef = doc(db, 'absensi', id);
        batch.set(docRef, record, { merge: true });
      }

      await batch.commit();
      onSuccess();
    } catch (err: any) {
      console.error('Error saving attendance:', err);
      setErrorMessage(err.message || 'Gagal menyimpan data absensi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-gray-500 font-medium">Memuat data santri...</p>
      </div>
    );
  }

  const unselectedCount = absenList.filter(i => i.status === null).length;
  const berjamaahCount = absenList.filter(i => i.status === 'berjamaah').length;
  const munfaridCount = absenList.filter(i => i.status === 'munfarid').length;
  const absentCount = absenList.filter(i => i.status === 'sakit' || i.status === 'izin' || i.status === 'alpha').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-950 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Waktu Pengisian: {sholatConfig.batasAwalPengisian} - {sholatConfig.batasAkhirPengisian}</span>
        </span>
      </div>

      {/* Main Title Card */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 rounded-2xl p-6 text-white shadow-md border border-teal-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-400/30">
            <Mosque className="w-3.5 h-3.5" />
            <span>Absen Sholat {sholatConfig.nama}</span>
          </div>
          <h1 className="text-xl font-black text-white">
            {currentUser?.kelompokNama || 'Kamar Madinah'}
          </h1>
          <p className="text-xs text-teal-200 mt-1">
            {formatIndonesianDate(todayStr)} • Total {absenList.length} Santri
          </p>
        </div>

        {/* Quick Bulk Action Button */}
        <button
          onClick={handleMarkAllBerjamaah}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-emerald-400 shadow-xs flex items-center gap-2 transition-all"
          title="Tandai semua santri sebagai Hadir Berjamaah"
        >
          <CheckCheck className="w-4 h-4 text-amber-300" />
          <span>Pilih Semua Hadir Berjamaah</span>
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
          <p className="text-[11px] text-gray-500">Berjamaah</p>
          <p className="text-lg font-black text-emerald-600">{berjamaahCount}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
          <p className="text-[11px] text-gray-500">Munfarid</p>
          <p className="text-lg font-black text-sky-600">{munfaridCount}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
          <p className="text-[11px] text-gray-500">Sakit / Izin / Alpha</p>
          <p className="text-lg font-black text-rose-600">{absentCount}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
          <p className="text-[11px] text-gray-500">Belum Dipilih</p>
          <p className={`text-lg font-black ${unselectedCount > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
            {unselectedCount}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Santri Attendance Form Table / Cards */}
      <div className="space-y-3">
        {absenList.map((item, index) => {
          const { santri, status, alasanAlpha, catatan } = item;
          return (
            <div 
              key={santri.id}
              className={`bg-white rounded-xl border p-3.5 sm:p-4 shadow-2xs transition-all ${
                status === null 
                  ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/10' 
                  : 'border-gray-200 hover:border-teal-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                
                {/* Santri Profile Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-gray-400 w-5 text-center flex-shrink-0">{index + 1}.</span>
                  <div className="w-9 h-9 rounded-full bg-teal-800 text-amber-300 font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                    {santri.nama.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{santri.nama}</h3>
                    <p className="text-[11px] text-gray-500 truncate">NIS: {santri.nis} • {santri.kelasNama}</p>
                  </div>
                </div>

                {/* Status Selector Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap items-center gap-1.5 w-full lg:w-auto">
                  
                  {/* Hadir Berjamaah */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(santri.id, 'berjamaah')}
                    className={`px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[40px] sm:min-h-0 ${
                      status === 'berjamaah'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Berjamaah</span>
                  </button>

                  {/* Hadir Munfarid */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(santri.id, 'munfarid')}
                    className={`px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[40px] sm:min-h-0 ${
                      status === 'munfarid'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
                    }`}
                  >
                    <Mosque className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Munfarid</span>
                  </button>

                  {/* Sakit */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(santri.id, 'sakit')}
                    className={`px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[40px] sm:min-h-0 ${
                      status === 'sakit'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <Thermometer className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Sakit</span>
                  </button>

                  {/* Izin */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(santri.id, 'izin')}
                    className={`px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[40px] sm:min-h-0 ${
                      status === 'izin'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Izin</span>
                  </button>

                  {/* Alpha */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(santri.id, 'alpha')}
                    className={`px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[40px] sm:min-h-0 col-span-2 sm:col-span-1 ${
                      status === 'alpha'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Alpha</span>
                  </button>
                </div>
              </div>

              {/* Conditional Inputs: Reason for Alpha & Notes */}
              {(status === 'alpha' || status === 'sakit' || status === 'izin' || catatan) && (
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {status === 'alpha' && (
                    <div>
                      <label className="block text-rose-800 font-semibold mb-1">Alasan Alpha (Wajib Pilih):</label>
                      <select
                        value={alasanAlpha}
                        onChange={(e) => handleAlasanChange(santri.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 bg-rose-50/50 text-rose-900 font-medium"
                      >
                        <option value="tanpa_keterangan">Tanpa Keterangan</option>
                        <option value="ketiduran">Ketiduran di Kamar</option>
                        <option value="terlambat">Terlambat Bangun</option>
                        <option value="kegiatan_lain">Ada Kegiatan Lain</option>
                      </select>
                    </div>
                  )}

                  <div className={status === 'alpha' ? '' : 'md:col-span-2'}>
                    <label className="block text-gray-600 font-medium mb-1">Catatan Tambahan (Opsional):</label>
                    <input
                      type="text"
                      placeholder="Contoh: Demam di UKS, izin keperluan keluarga..."
                      value={catatan}
                      onChange={(e) => handleCatatanChange(santri.id, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:border-teal-500 focus:outline-hidden text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Floating Save Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-gray-600">
          {unselectedCount > 0 ? (
            <span className="text-amber-700 font-semibold flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Masih ada {unselectedCount} santri yang belum dipilih statusnya</span>
            </span>
          ) : (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Semua {absenList.length} santri telah terisi lengkap</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBack}
            className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-amber-300 font-extrabold text-xs shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Absensi'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
