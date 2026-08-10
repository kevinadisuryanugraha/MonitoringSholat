import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { invalidateCache } from '../../lib/queryCache';
import { UserAccount, UserRole, Kelas, Kelompok } from '../../types';
import { UserCog, UserPlus, Search, Edit3, X, Check, Shield } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'musyrif' as UserRole,
    kelompokId: '',
    kelasId: '',
    isActive: true
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [uSnap, kSnap, kelSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'kelas')),
        getDocs(collection(db, 'kelompok'))
      ]);

      const uList: UserAccount[] = []; uSnap.forEach(d => uList.push(d.data() as UserAccount));
      const kList: Kelas[] = []; kSnap.forEach(d => kList.push(d.data() as Kelas));
      const kelList: Kelompok[] = []; kelSnap.forEach(d => kelList.push(d.data() as Kelompok));

      setUsers(uList);
      setKelasList(kList);
      setKelompokList(kelList);
    } catch (err) {
      console.error('Fetch users err:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'musyrif',
      kelompokId: kelompokList[0]?.id || '',
      kelasId: kelasList[0]?.id || '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (u: UserAccount) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      kelompokId: u.kelompokId || '',
      kelasId: u.kelasId || '',
      isActive: u.isActive
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const id = editingUser ? editingUser.id : `user-${Date.now()}`;
      const selectedK = kelasList.find(k => k.id === formData.kelasId);
      const selectedKel = kelompokList.find(k => k.id === formData.kelompokId);

      const record: UserAccount = {
        id,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        kelompokId: formData.role === 'musyrif' ? formData.kelompokId : null,
        kelompokNama: formData.role === 'musyrif' ? selectedKel?.namaKelompok : null,
        kelasId: formData.role === 'wali_kelas' ? formData.kelasId : null,
        kelasNama: formData.role === 'wali_kelas' ? selectedK?.namaKelas : null,
        isActive: formData.isActive,
        createdAt: editingUser ? editingUser.createdAt : new Date().toISOString()
      };

      await setDoc(doc(db, 'users', id), record, { merge: true });
      invalidateCache('users');
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Save user err:', err);
      alert('Gagal menyimpan pengguna');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u: UserAccount) => {
    try {
      const updated = { ...u, isActive: !u.isActive };
      // Optimistic update
      setUsers(prev => prev.map(user => user.id === u.id ? updated : user));
      await setDoc(doc(db, 'users', u.id), updated, { merge: true });
      invalidateCache('users');
    } catch (err) {
      console.error('Gagal mengubah status:', err);
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-teal-700 flex-shrink-0" />
            <span>Manajemen Pengguna (User Accounts)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Pengaturan akun Musyrif, Wali Kelas, dan Kepala Sekolah</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto bg-teal-800 hover:bg-teal-900 text-amber-300 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4 flex-shrink-0" />
          <span>Registrasi User Baru</span>
        </button>
      </div>

      {/* Users List Table & Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-teal-50 text-teal-900 font-bold border-b border-teal-100">
              <tr>
                <th className="p-3.5">Nama Pengguna</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role / Peran</th>
                <th className="p-3.5">Penugasan (Kelas/Kamar)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal-700 flex-shrink-0" />
                    <span>{u.name}</span>
                  </td>
                  <td className="p-3.5 text-gray-600">{u.email}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      u.role === 'kepala_sekolah' ? 'bg-amber-100 text-amber-800' :
                      u.role === 'wali_kelas' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role === 'kepala_sekolah' ? 'Kepala Sekolah' : u.role === 'wali_kelas' ? 'Wali Kelas' : 'Musyrif'}
                    </span>
                  </td>
                  <td className="p-3.5 text-teal-800 font-medium">
                    {u.role === 'musyrif' ? u.kelompokNama || '-' : u.role === 'wali_kelas' ? u.kelasNama || '-' : 'Semua Sekolah'}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100"
                      title="Edit User"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-gray-100">
          {users.map((u) => (
            <div key={u.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-xs text-gray-900 truncate">{u.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${
                    u.role === 'kepala_sekolah' ? 'bg-amber-100 text-amber-800' :
                    u.role === 'wali_kelas' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {u.role === 'kepala_sekolah' ? 'Kepala Sekolah' : u.role === 'wali_kelas' ? 'Wali Kelas' : 'Musyrif'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                <p className="text-[11px] text-teal-800 font-semibold mt-0.5">
                  Tugas: {u.role === 'musyrif' ? u.kelompokNama || '-' : u.role === 'wali_kelas' ? u.kelasNama || '-' : 'Semua Sekolah'}
                </p>
              </div>

              <button
                onClick={() => handleOpenEdit(u)}
                className="p-2 rounded-lg bg-teal-50 text-teal-800 border border-teal-100 flex-shrink-0"
                title="Edit User"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-sm text-gray-900">{editingUser ? 'Edit User' : 'Registrasi User Baru'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Role / Peran *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 font-semibold"
                >
                  <option value="musyrif">Musyrif (Pengisi Absen Kamar)</option>
                  <option value="wali_kelas">Wali Kelas</option>
                  <option value="kepala_sekolah">Kepala Sekolah</option>
                </select>
              </div>

              {formData.role === 'musyrif' && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Kamar / Kelompok Diampu</label>
                  <select
                    value={formData.kelompokId}
                    onChange={(e) => setFormData({ ...formData, kelompokId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300"
                  >
                    {kelompokList.map(k => (
                      <option key={k.id} value={k.id}>{k.namaKelompok}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.role === 'wali_kelas' && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Kelas Diampu</label>
                  <select
                    value={formData.kelasId}
                    onChange={(e) => setFormData({ ...formData, kelasId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300"
                  >
                    {kelasList.map(k => (
                      <option key={k.id} value={k.id}>{k.namaKelas}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Batal</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-teal-800 text-amber-300 font-bold rounded-lg">
                  {saving ? 'Menyimpan...' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
