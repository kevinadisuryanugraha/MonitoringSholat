import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { invalidateCache } from '../../lib/queryCache';
import { Santri, Kelas, Kelompok } from '../../types';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Filter, 
  UserPlus,
  School,
  Building2
} from 'lucide-react';

export const MasterSantri: React.FC = () => {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedKelompok, setSelectedKelompok] = useState('');

  // Modal form state
  const [showModal, setShowModal] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  
  const [formData, setFormData] = useState({
    nama: '',
    nis: '',
    kelasId: '',
    kelompokId: '',
    fotoUrl: '',
    isActive: true
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sSnap, kSnap, kelSnap] = await Promise.all([
        getDocs(collection(db, 'santri')),
        getDocs(collection(db, 'kelas')),
        getDocs(collection(db, 'kelompok'))
      ]);

      const sList: Santri[] = []; sSnap.forEach(d => sList.push(d.data() as Santri));
      const kList: Kelas[] = []; kSnap.forEach(d => kList.push(d.data() as Kelas));
      const kelList: Kelompok[] = []; kelSnap.forEach(d => kelList.push(d.data() as Kelompok));

      setSantriList(sList);
      setKelasList(kList);
      setKelompokList(kelList);
    } catch (err) {
      console.error('Fetch master santri err:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSantri(null);
    setFormData({
      nama: '',
      nis: `2025${Math.floor(100 + Math.random() * 900)}`,
      kelasId: kelasList[0]?.id || '',
      kelompokId: kelompokList[0]?.id || '',
      fotoUrl: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (s: Santri) => {
    setEditingSantri(s);
    setFormData({
      nama: s.nama,
      nis: s.nis,
      kelasId: s.kelasId,
      kelompokId: s.kelompokId,
      fotoUrl: s.fotoUrl || '',
      isActive: s.isActive
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nis || !formData.kelasId || !formData.kelompokId) {
      alert('Harap isi semua bidang wajib!');
      return;
    }

    setSaving(true);
    try {
      const selectedK = kelasList.find(k => k.id === formData.kelasId);
      const selectedKel = kelompokList.find(k => k.id === formData.kelompokId);

      const id = editingSantri ? editingSantri.id : `santri-${Date.now()}`;
      const newSantri: Santri = {
        id,
        nama: formData.nama,
        nis: formData.nis,
        kelasId: formData.kelasId,
        kelasNama: selectedK?.namaKelas || 'Kelas',
        kelompokId: formData.kelompokId,
        kelompokNama: selectedKel?.namaKelompok || 'Kamar',
        fotoUrl: formData.fotoUrl || null,
        isActive: formData.isActive,
        createdAt: editingSantri ? editingSantri.createdAt : new Date().toISOString()
      };

      // Optimistic update: update state lokal terlebih dulu
      if (editingSantri) {
        setSantriList(prev => prev.map(s => s.id === id ? newSantri : s));
      } else {
        setSantriList(prev => [...prev, newSantri]);
      }

      await setDoc(doc(db, 'santri', id), newSantri, { merge: true });
      
      // Invalidasi cache setelah write
      invalidateCache('santri');
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Gagal menyimpan santri:', err);
      alert('Gagal menyimpan data santri');
      fetchData(); // Refresh data jika gagal
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (santri: Santri) => {
    try {
      const updated = { ...santri, isActive: !santri.isActive };
      // Optimistic: update state lokal dulu
      setSantriList(prev => prev.map(s => s.id === santri.id ? updated : s));
      await setDoc(doc(db, 'santri', santri.id), updated, { merge: true });
      invalidateCache('santri');
    } catch (err) {
      console.error('Gagal mengubah status:', err);
      fetchData();
    }
  };

  // Filtered santri list
  const filteredSantri = santriList.filter(s => {
    const matchesSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis.includes(searchQuery);
    const matchesKelas = selectedKelas ? s.kelasId === selectedKelas : true;
    const matchesKelompok = selectedKelompok ? s.kelompokId === selectedKelompok : true;
    return matchesSearch && matchesKelas && matchesKelompok;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            <span>Master Data Santri</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Kelola data seluruh santri, NIS, kelas, dan kamar/kelompok</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-teal-800 hover:bg-teal-900 text-amber-300 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Santri Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama santri atau NIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 text-xs"
          />
        </div>

        {/* Filter Kelas */}
        <select
          value={selectedKelas}
          onChange={(e) => setSelectedKelas(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 text-xs bg-white text-gray-700"
        >
          <option value="">-- Semua Kelas --</option>
          {kelasList.map(k => (
            <option key={k.id} value={k.id}>{k.namaKelas}</option>
          ))}
        </select>

        {/* Filter Kelompok */}
        <select
          value={selectedKelompok}
          onChange={(e) => setSelectedKelompok(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 text-xs bg-white text-gray-700"
        >
          <option value="">-- Semua Kamar / Kelompok --</option>
          {kelompokList.map(k => (
            <option key={k.id} value={k.id}>{k.namaKelompok}</option>
          ))}
        </select>

      </div>

      {/* Table / Card List Santri */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-500">Memuat data santri...</p>
          </div>
        ) : filteredSantri.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-teal-600" />
            <p className="text-xs font-semibold">Data santri tidak ditemukan</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-teal-50 text-teal-900 font-bold border-b border-teal-100">
                  <tr>
                    <th className="p-3.5">Santri</th>
                    <th className="p-3.5">NIS</th>
                    <th className="p-3.5">Kelas</th>
                    <th className="p-3.5">Kamar / Kelompok</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSantri.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3.5 font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-800 text-amber-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {s.nama.charAt(0)}
                        </div>
                        <span>{s.nama}</span>
                      </td>
                      <td className="p-3.5 text-gray-600 font-mono">{s.nis}</td>
                      <td className="p-3.5 text-gray-800 font-medium">{s.kelasNama}</td>
                      <td className="p-3.5 text-teal-800 font-medium">{s.kelompokNama}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleActive(s)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {s.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100"
                          title="Edit Santri"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredSantri.map((s) => (
                <div key={s.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-full bg-teal-800 text-amber-300 font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                      {s.nama.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-gray-900 truncate">{s.nama}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${
                          s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {s.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        NIS: {s.nis} • {s.kelasNama} ({s.kelompokNama})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-2 rounded-lg bg-teal-50 text-teal-800 border border-teal-100 flex-shrink-0"
                    title="Edit Santri"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900">
                {editingSantri ? 'Edit Data Santri' : 'Tambah Santri Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Nama Lengkap Santri *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Ali"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Nomor Induk Santri (NIS) *</label>
                <input
                  type="text"
                  required
                  placeholder="2025001"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Pilih Kelas *</label>
                <select
                  required
                  value={formData.kelasId}
                  onChange={(e) => setFormData({ ...formData, kelasId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-teal-500"
                >
                  {kelasList.map(k => (
                    <option key={k.id} value={k.id}>{k.namaKelas}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Pilih Kamar / Kelompok *</label>
                <select
                  required
                  value={formData.kelompokId}
                  onChange={(e) => setFormData({ ...formData, kelompokId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-teal-500"
                >
                  {kelompokList.map(k => (
                    <option key={k.id} value={k.id}>{k.namaKelompok}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-teal-800 rounded"
                />
                <label htmlFor="isActive" className="text-gray-700 font-medium">Santri Status Aktif</label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-teal-800 text-amber-300 font-bold hover:bg-teal-900"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Santri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
