import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { AbsensiRecord, WaktuSholatKey, Santri, KonfigurasiWaktuSholat } from '../../types';
import { DEFAULT_SHOLAT_CONFIG } from '../../lib/seedData';
import { Mosque } from '../common/MosqueIcon';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ClipboardList, 
  Calendar, 
  Users, 
  ChevronRight, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface Props {
  onNavigateToForm: (waktu: WaktuSholatKey) => void;
  onNavigateToHistory: () => void;
}

export const MusyrifDashboard: React.FC<Props> = ({ onNavigateToForm, onNavigateToHistory }) => {
  const { currentUser } = useAuth();
  const [todayAbsensi, setTodayAbsensi] = useState<AbsensiRecord[]>([]);
  const [groupSantri, setGroupSantri] = useState<Santri[]>([]);
  const [sholatConfigs, setSholatConfigs] = useState<KonfigurasiWaktuSholat[]>(DEFAULT_SHOLAT_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);

  const todayStr = new Date().toISOString().split('T')[0];

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
    if (!currentUser?.kelompokId) {
      setLoading(false);
      return;
    }

    // 1. Fetch group santri
    const fetchSantri = async () => {
      try {
        const q = query(collection(db, 'santri'), where('kelompokId', '==', currentUser.kelompokId));
        const snap = await getDocs(q);
        const list: Santri[] = [];
        snap.forEach(doc => list.push(doc.data() as Santri));
        setGroupSantri(list);
      } catch (err) {
        console.error('Fetch santri err:', err);
      }
    };

    fetchSantri();

    // 2. Listen to today's absensi records for this group
    const qAbs = query(
      collection(db, 'absensi'),
      where('kelompokId', '==', currentUser.kelompokId),
      where('tanggal', '==', todayStr)
    );

    const unsubscribe = onSnapshot(qAbs, (snap) => {
      const records: AbsensiRecord[] = [];
      snap.forEach(doc => records.push(doc.data() as AbsensiRecord));
      setTodayAbsensi(records);
      setLoading(false);
    }, (err) => {
      console.error('Snap absensi err:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.kelompokId, todayStr]);

  const getSholatStats = (waktuKey: WaktuSholatKey) => {
    const records = todayAbsensi.filter(a => a.waktuSholat === waktuKey);
    const totalSantri = groupSantri.length || 8;
    const filledCount = records.length;
    const isFilled = filledCount > 0;

    const berjamaah = records.filter(r => r.status === 'berjamaah').length;
    const munfarid = records.filter(r => r.status === 'munfarid').length;
    const tidakHadir = records.filter(r => r.status === 'sakit' || r.status === 'izin' || r.status === 'alpha').length;

    return {
      isFilled,
      filledCount,
      totalSantri,
      berjamaah,
      munfarid,
      tidakHadir
    };
  };

  const completedPrayersCount = sholatConfigs.filter(cfg => getSholatStats(cfg.id).isFilled).length;
  const progressPercent = Math.round((completedPrayersCount / 5) * 100);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 p-6 text-white shadow-lg border border-teal-700">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>{formatIndonesianDate(todayStr)}</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Assalamu'alaikum, {currentUser?.name}
            </h1>
            <p className="text-sm text-teal-100 mt-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Penanggung Jawab: <strong className="text-white">{currentUser?.kelompokNama || 'Kamar Madinah'}</strong></span>
              <span className="text-teal-300">• ({groupSantri.length} Santri)</span>
            </p>
          </div>

          <div className="bg-teal-950/60 backdrop-blur-xs px-4 py-3 rounded-xl border border-teal-700/60 flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-teal-200">Progres Absen Hari Ini</p>
              <p className="text-xl font-black text-amber-300">{completedPrayersCount} / 5 <span className="text-xs font-normal text-teal-200">Sholat</span></p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-amber-400/80 bg-teal-900 flex items-center justify-center font-bold text-xs text-white">
              {progressPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Grid 5 Cards Sholat */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Mosque className="w-5 h-5 text-teal-700" />
              <span>Absensi Sholat 5 Waktu Hari Ini</span>
            </h2>
            <p className="text-xs text-gray-500">Pilih waktu sholat untuk mengisi atau mengedit daftar kehadiran santri</p>
          </div>
          <button 
            onClick={onNavigateToHistory}
            className="text-xs text-teal-800 font-semibold hover:text-teal-900 flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200"
          >
            <span>Riwayat Absen</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {sholatConfigs.map((cfg) => {
            const stats = getSholatStats(cfg.id);
            return (
              <div 
                key={cfg.id}
                className={`rounded-xl border p-4 transition-all hover:shadow-md flex flex-col justify-between relative overflow-hidden bg-white ${
                  stats.isFilled 
                    ? 'border-emerald-200 bg-emerald-50/20' 
                    : 'border-amber-200 bg-white hover:border-amber-400'
                }`}
              >
                {/* Header status badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase text-teal-900 tracking-wider">
                    {cfg.nama}
                  </span>
                  {stats.isFilled ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Sudah Diisi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      Belum Diisi
                    </span>
                  )}
                </div>

                {/* Time Window */}
                <p className="text-[11px] text-gray-500 flex items-center gap-1 mb-3">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>Batas: {cfg.batasAwalPengisian} - {cfg.batasAkhirPengisian}</span>
                </p>

                {/* Stats Breakdown if filled */}
                {stats.isFilled ? (
                  <div className="bg-gray-50 rounded-lg p-2 mb-4 text-xs space-y-1 border border-gray-100">
                    <div className="flex justify-between text-emerald-800">
                      <span>Berjamaah:</span>
                      <strong className="font-bold">{stats.berjamaah} santri</strong>
                    </div>
                    <div className="flex justify-between text-sky-800">
                      <span>Munfarid:</span>
                      <strong>{stats.munfarid} santri</strong>
                    </div>
                    {stats.tidakHadir > 0 && (
                      <div className="flex justify-between text-rose-700 font-semibold">
                        <span>Absen/Sakit/Izin:</span>
                        <span>{stats.tidakHadir} santri</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50/60 rounded-lg p-3 mb-4 text-center border border-amber-100/80">
                    <p className="text-xs text-amber-900 font-medium">
                      Belum dicatat untuk {groupSantri.length || 8} santri
                    </p>
                  </div>
                )}

                {/* Action button */}
                <button
                  onClick={() => onNavigateToForm(cfg.id)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                    stats.isFilled 
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' 
                      : 'bg-teal-800 hover:bg-teal-900 text-amber-300'
                  }`}
                >
                  <span>{stats.isFilled ? 'Edit / Lihat Absen' : 'Isi Absen Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Santri Group Overview List */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-700" />
              <span>Daftar Santri {currentUser?.kelompokNama || 'Kamar Madinah'}</span>
            </h3>
            <p className="text-xs text-gray-500">Santri yang menjadi tanggung jawab musyrif hari ini</p>
          </div>
          <span className="text-xs text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Total {groupSantri.length} Santri
          </span>
        </div>

        {groupSantri.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-teal-600" />
            <p className="text-xs font-medium">Belum ada data santri di kelompok ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {groupSantri.map((s) => (
              <div key={s.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-800 text-amber-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {s.nama.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{s.nama}</p>
                  <p className="text-[11px] text-gray-500">NIS: {s.nis} • {s.kelasNama}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
