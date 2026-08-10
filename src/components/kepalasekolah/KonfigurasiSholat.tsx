import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { KonfigurasiWaktuSholat } from '../../types';
import { DEFAULT_SHOLAT_CONFIG } from '../../lib/seedData';
import { Mosque } from '../common/MosqueIcon';
import { Clock, Save, CheckCircle2 } from 'lucide-react';

export const KonfigurasiSholat: React.FC = () => {
  const [configs, setConfigs] = useState<KonfigurasiWaktuSholat[]>(DEFAULT_SHOLAT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'konfigurasi_sholat'));
      if (!snap.empty) {
        const list: KonfigurasiWaktuSholat[] = [];
        snap.forEach(d => list.push(d.data() as KonfigurasiWaktuSholat));
        list.sort((a, b) => a.urutan - b.urutan);
        setConfigs(list);
      }
    } catch (err) {
      console.error('Fetch sholat config err:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, field: 'batasAwalPengisian' | 'batasAkhirPengisian', val: string) => {
    setConfigs(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, [field]: val };
      }
      return c;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const cfg of configs) {
        await setDoc(doc(db, 'konfigurasi_sholat', cfg.id), cfg, { merge: true });
      }
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Save config err:', err);
      alert('Gagal menyimpan pengaturan waktu sholat');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-700" />
            <span>Konfigurasi Waktu Pengisian Absen Sholat</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Atur batas waktu jam pengisian absen sholat 5 waktu oleh musyrif</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-800 hover:bg-teal-900 text-amber-300 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Pengaturan waktu sholat berhasil diperbarui!</span>
        </div>
      )}

      <div className="space-y-4">
        {configs.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-amber-300 font-bold flex items-center justify-center text-sm shadow-2xs">
                <Mosque className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Sholat {c.nama}</h3>
                <p className="text-xs text-gray-500">Batas pengisian absensi harian</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Batas Awal</label>
                <input
                  type="time"
                  value={c.batasAwalPengisian}
                  onChange={(e) => handleChange(c.id, 'batasAwalPengisian', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 font-mono font-bold"
                />
              </div>
              <span className="text-gray-400 mt-5">sampai</span>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Batas Akhir</label>
                <input
                  type="time"
                  value={c.batasAkhirPengisian}
                  onChange={(e) => handleChange(c.id, 'batasAkhirPengisian', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 font-mono font-bold"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
