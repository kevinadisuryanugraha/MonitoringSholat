import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { invalidateCache } from '../../lib/queryCache';
import { Kelas, Kelompok, UserAccount } from '../../types';
import { School, Building2, Plus, Edit3, X, UserCheck } from 'lucide-react';

export const MasterKelasKelompok: React.FC = () => {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [showKelasModal, setShowKelasModal] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [kelasForm, setKelasForm] = useState({ namaKelas: '', waliKelasId: '' });

  const [showKelompokModal, setShowKelompokModal] = useState(false);
  const [editingKelompok, setEditingKelompok] = useState<Kelompok | null>(null);
  const [kelompokForm, setKelompokForm] = useState({ namaKelompok: '', musyrifId: '', kelasId: '' });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kSnap, kelSnap, uSnap] = await Promise.all([
        getDocs(collection(db, 'kelas')),
        getDocs(collection(db, 'kelompok')),
        getDocs(collection(db, 'users'))
      ]);

      const kList: Kelas[] = []; kSnap.forEach(d => kList.push(d.data() as Kelas));
      const kelList: Kelompok[] = []; kelSnap.forEach(d => kelList.push(d.data() as Kelompok));
      const uList: UserAccount[] = []; uSnap.forEach(d => uList.push(d.data() as UserAccount));

      setKelasList(kList);
      setKelompokList(kelList);
      setUsers(uList);
    } catch (err) {
      console.error('Fetch kelas/kelompok err:', err);
    } finally {
      setLoading(false);
    }
  };

  const waliKelasUsers = users.filter(u => u.role === 'wali_kelas');
  const musyrifUsers = users.filter(u => u.role === 'musyrif');

  // Kelas Handlers
  const handleOpenKelasModal = (k?: Kelas) => {
    if (k) {
      setEditingKelas(k);
      setKelasForm({ namaKelas: k.namaKelas, waliKelasId: k.waliKelasId || '' });
    } else {
      setEditingKelas(null);
      setKelasForm({ namaKelas: '', waliKelasId: waliKelasUsers[0]?.id || '' });
    }
    setShowKelasModal(true);
  };

  const handleSaveKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const id = editingKelas ? editingKelas.id : `kelas-${Date.now()}`;
      const waliUser = users.find(u => u.id === kelasForm.waliKelasId);

      const record: Kelas = {
        id,
        namaKelas: kelasForm.namaKelas,
        waliKelasId: kelasForm.waliKelasId || null,
        waliKelasNama: waliUser ? waliUser.name : 'Belum Ditentukan',
        createdAt: editingKelas ? editingKelas.createdAt : new Date().toISOString()
      };

      await setDoc(doc(db, 'kelas', id), record, { merge: true });
      invalidateCache('kelas');
      setShowKelasModal(false);
      fetchData();
    } catch (err) {
      console.error('Save kelas err:', err);
    } finally {
      setSaving(false);
    }
  };

  // Kelompok Handlers
  const handleOpenKelompokModal = (kel?: Kelompok) => {
    if (kel) {
      setEditingKelompok(kel);
      setKelompokForm({
        namaKelompok: kel.namaKelompok,
        musyrifId: kel.musyrifId || '',
        kelasId: kel.kelasId || ''
      });
    } else {
      setEditingKelompok(null);
      setKelompokForm({
        namaKelompok: '',
        musyrifId: musyrifUsers[0]?.id || '',
        kelasId: kelasList[0]?.id || ''
      });
    }
    setShowKelompokModal(true);
  };

  const handleSaveKelompok = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const id = editingKelompok ? editingKelompok.id : `kelompok-${Date.now()}`;
      const musyrif = users.find(u => u.id === kelompokForm.musyrifId);
      const kelas = kelasList.find(k => k.id === kelompokForm.kelasId);

      const record: Kelompok = {
        id,
        namaKelompok: kelompokForm.namaKelompok,
        musyrifId: kelompokForm.musyrifId || null,
        musyrifNama: musyrif ? musyrif.name : 'Belum Ditentukan',
        kelasId: kelompokForm.kelasId || null,
        kelasNama: kelas ? kelas.namaKelas : 'Kelas',
        createdAt: editingKelompok ? editingKelompok.createdAt : new Date().toISOString()
      };

      await setDoc(doc(db, 'kelompok', id), record, { merge: true });
      invalidateCache('kelompok');
      setShowKelompokModal(false);
      fetchData();
    } catch (err) {
      console.error('Save kelompok err:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Modul Data Kelas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <School className="w-5 h-5 text-teal-700 flex-shrink-0" />
              <span>Data Kelas Pesantren</span>
            </h2>
            <p className="text-xs text-gray-500">Daftar kelas dan penugasan wali kelas</p>
          </div>

          <button
            onClick={() => handleOpenKelasModal()}
            className="self-start sm:self-auto bg-teal-800 hover:bg-teal-900 text-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span>Tambah Kelas</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {kelasList.map((k) => (
            <div key={k.id} className="p-3.5 sm:p-4 rounded-xl bg-teal-50/40 border border-teal-100 flex items-center justify-between gap-2 min-w-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-teal-950 truncate">{k.namaKelas}</h3>
                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1 truncate">
                  <UserCheck className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                  <span className="truncate">Wali: <strong>{k.waliKelasNama || 'Belum diisi'}</strong></span>
                </p>
              </div>
              <button
                onClick={() => handleOpenKelasModal(k)}
                className="p-2 rounded-lg bg-white border border-teal-200 text-teal-800 hover:bg-teal-100 flex-shrink-0 shadow-2xs"
                title="Edit Kelas"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Modul Data Kamar / Kelompok */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-700 flex-shrink-0" />
              <span>Data Kamar / Kelompok Musyrif</span>
            </h2>
            <p className="text-xs text-gray-500">Daftar kamar santri dan penugasan musyrif penanggung jawab</p>
          </div>

          <button
            onClick={() => handleOpenKelompokModal()}
            className="self-start sm:self-auto bg-teal-800 hover:bg-teal-900 text-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span>Tambah Kamar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {kelompokList.map((kel) => (
            <div key={kel.id} className="p-3.5 sm:p-4 rounded-xl bg-amber-50/30 border border-amber-200 flex items-center justify-between gap-2 min-w-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-amber-950 truncate">{kel.namaKelompok}</h3>
                <p className="text-xs text-gray-700 mt-1 truncate">
                  Musyrif: <strong>{kel.musyrifNama || 'Belum diisi'}</strong>
                </p>
                <p className="text-[11px] text-gray-500 truncate">{kel.kelasNama}</p>
              </div>
              <button
                onClick={() => handleOpenKelompokModal(kel)}
                className="p-2 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 flex-shrink-0 shadow-2xs"
                title="Edit Kamar"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Kelas */}
      {showKelasModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-sm text-gray-900">{editingKelas ? 'Edit Kelas' : 'Tambah Kelas'}</h3>
              <button onClick={() => setShowKelasModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleSaveKelas} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Nama Kelas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas 7A (Tsanawiyah)"
                  value={kelasForm.namaKelas}
                  onChange={(e) => setKelasForm({ ...kelasForm, namaKelas: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Wali Kelas Penanggung Jawab</label>
                <select
                  value={kelasForm.waliKelasId}
                  onChange={(e) => setKelasForm({ ...kelasForm, waliKelasId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300"
                >
                  <option value="">-- Pilih Wali Kelas --</option>
                  {waliKelasUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowKelasModal(false)} className="px-4 py-2 border rounded-lg">Batal</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-teal-800 text-amber-300 font-bold rounded-lg">
                  {saving ? 'Menyimpan...' : 'Simpan Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelompok */}
      {showKelompokModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-sm text-gray-900">{editingKelompok ? 'Edit Kamar/Kelompok' : 'Tambah Kamar Baru'}</h3>
              <button onClick={() => setShowKelompokModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleSaveKelompok} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Nama Kamar / Kelompok *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kamar Madinah (Gedung A)"
                  value={kelompokForm.namaKelompok}
                  onChange={(e) => setKelompokForm({ ...kelompokForm, namaKelompok: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Musyrif Penanggung Jawab</label>
                <select
                  value={kelompokForm.musyrifId}
                  onChange={(e) => setKelompokForm({ ...kelompokForm, musyrifId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300"
                >
                  <option value="">-- Pilih Musyrif --</option>
                  {musyrifUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Terkait Kelas</label>
                <select
                  value={kelompokForm.kelasId}
                  onChange={(e) => setKelompokForm({ ...kelompokForm, kelasId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {kelasList.map(k => (
                    <option key={k.id} value={k.id}>{k.namaKelas}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowKelompokModal(false)} className="px-4 py-2 border rounded-lg">Batal</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-teal-800 text-amber-300 font-bold rounded-lg">
                  {saving ? 'Menyimpan...' : 'Simpan Kamar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
