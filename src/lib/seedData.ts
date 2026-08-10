import { collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { UserAccount, Kelas, Kelompok, Santri, KonfigurasiWaktuSholat, AbsensiRecord, WaktuSholatKey } from '../types';

export const DEFAULT_SHOLAT_CONFIG: KonfigurasiWaktuSholat[] = [
  { id: 'subuh', nama: 'Subuh', batasAwalPengisian: '04:00', batasAkhirPengisian: '07:00', urutan: 1 },
  { id: 'dzuhur', nama: 'Dzuhur', batasAwalPengisian: '11:30', batasAkhirPengisian: '14:30', urutan: 2 },
  { id: 'ashar', nama: 'Ashar', batasAwalPengisian: '15:00', batasAkhirPengisian: '17:30', urutan: 3 },
  { id: 'maghrib', nama: 'Maghrib', batasAwalPengisian: '17:45', batasAkhirPengisian: '19:30', urutan: 4 },
  { id: 'isya', nama: 'Isya', batasAwalPengisian: '19:30', batasAkhirPengisian: '22:00', urutan: 5 },
];

export const DEMO_USERS: UserAccount[] = [
  {
    id: 'user-musyrif-1',
    name: 'Ustadz Ahmad Fauzi, S.Pd.I',
    email: 'musyrif@pesantren.sch.id',
    role: 'musyrif',
    kelompokId: 'kelompok-1',
    kelompokNama: 'Kamar Madinah (Gedung A)',
    kelasId: 'kelas-1',
    kelasNama: 'Kelas 7A',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-musyrif-2',
    name: 'Ustadz Zulkifli, S.Ag',
    email: 'zulkifli@pesantren.sch.id',
    role: 'musyrif',
    kelompokId: 'kelompok-2',
    kelompokNama: 'Kamar Makkah (Gedung B)',
    kelasId: 'kelas-2',
    kelasNama: 'Kelas 8A',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-walikelas-1',
    name: 'Ustadz Ridwan, M.Pd',
    email: 'walikelas@pesantren.sch.id',
    role: 'wali_kelas',
    kelasId: 'kelas-1',
    kelasNama: 'Kelas 7A',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-walikelas-2',
    name: 'Ustadzah Syarifah, S.Pd',
    email: 'syarifah@pesantren.sch.id',
    role: 'wali_kelas',
    kelasId: 'kelas-2',
    kelasNama: 'Kelas 8A',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-kepala-1',
    name: 'K.H. Mansur Hidayat, M.Ag',
    email: 'kepala@pesantren.sch.id',
    role: 'kepala_sekolah',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const DEMO_KELAS: Kelas[] = [
  { id: 'kelas-1', namaKelas: 'Kelas 7A (Tsanawiyah)', waliKelasId: 'user-walikelas-1', waliKelasNama: 'Ustadz Ridwan, M.Pd', jumlahSantri: 8, createdAt: new Date().toISOString() },
  { id: 'kelas-2', namaKelas: 'Kelas 8A (Tsanawiyah)', waliKelasId: 'user-walikelas-2', waliKelasNama: 'Ustadzah Syarifah, S.Pd', jumlahSantri: 6, createdAt: new Date().toISOString() },
  { id: 'kelas-3', namaKelas: 'Kelas 9B (Tsanawiyah)', waliKelasId: null, waliKelasNama: 'Ustadz Abdullah', jumlahSantri: 5, createdAt: new Date().toISOString() },
];

export const DEMO_KELOMPOK: Kelompok[] = [
  { id: 'kelompok-1', namaKelompok: 'Kamar Madinah (Gedung A)', musyrifId: 'user-musyrif-1', musyrifNama: 'Ustadz Ahmad Fauzi, S.Pd.I', kelasId: 'kelas-1', kelasNama: 'Kelas 7A (Tsanawiyah)', createdAt: new Date().toISOString() },
  { id: 'kelompok-2', namaKelompok: 'Kamar Makkah (Gedung B)', musyrifId: 'user-musyrif-2', musyrifNama: 'Ustadz Zulkifli, S.Ag', kelasId: 'kelas-2', kelasNama: 'Kelas 8A (Tsanawiyah)', createdAt: new Date().toISOString() },
  { id: 'kelompok-3', namaKelompok: 'Kamar Jeddah (Gedung C)', musyrifId: 'user-musyrif-1', musyrifNama: 'Ustadz Ahmad Fauzi, S.Pd.I', kelasId: 'kelas-3', kelasNama: 'Kelas 9B (Tsanawiyah)', createdAt: new Date().toISOString() },
];

export const DEMO_SANTRI: Santri[] = [
  // Kamar Madinah (Kelompok 1) - Kelas 7A
  { id: 'santri-1', nama: 'Muhammad Ali Ridho', nis: '2025001', kelasId: 'kelas-1', kelasNama: 'Kelas 7A (Tsanawiyah)', kelompokId: 'kelompok-1', kelompokNama: 'Kamar Madinah (Gedung A)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-2', nama: 'Ahmad Faisal Rahman', nis: '2025002', kelasId: 'kelas-1', kelasNama: 'Kelas 7A (Tsanawiyah)', kelompokId: 'kelompok-1', kelompokNama: 'Kamar Madinah (Gedung A)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-3', nama: 'Bilal Habasyi Putra', nis: '2025003', kelasId: 'kelas-1', kelasNama: 'Kelas 7A (Tsanawiyah)', kelompokId: 'kelompok-1', kelompokNama: 'Kamar Madinah (Gedung A)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-4', nama: 'Danish Al-Ghazali', nis: '2025004', kelasId: 'kelas-1', kelasNama: 'Kelas 7A (Tsanawiyah)', kelompokId: 'kelompok-1', kelompokNama: 'Kamar Madinah (Gedung A)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-5', nama: 'Faris Hibatullah', nis: '2025005', kelasId: 'kelas-1', kelasNama: 'Kelas 7A (Tsanawiyah)', kelompokId: 'kelompok-1', kelompokNama: 'Kamar Madinah (Gedung A)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-6', nama: 'Habibie Umar Al-Faruq', nis: '2025006', kelasId: 'kelas-1', kelasNama: 'Kelas 7A (Tsanawiyah)', kelompokId: 'kelompok-1', kelompokNama: 'Kamar Madinah (Gedung A)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-7', nama: 'Ibrahim Nu`man', nis: '2025007', kelasId: 'kelas-1', kelasNama: 'Kelas 7A (Tsanawiyah)', kelompokId: 'kelompok-1', kelompokNama: 'Kamar Madinah (Gedung A)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-8', nama: 'Luqman Hakim', nis: '2025008', kelasId: 'kelas-1', kelasNama: 'Kelas 7A (Tsanawiyah)', kelompokId: 'kelompok-1', kelompokNama: 'Kamar Madinah (Gedung A)', isActive: true, createdAt: new Date().toISOString() },

  // Kamar Makkah (Kelompok 2) - Kelas 8A
  { id: 'santri-9', nama: 'Naufal Az-Zahir', nis: '2024011', kelasId: 'kelas-2', kelasNama: 'Kelas 8A (Tsanawiyah)', kelompokId: 'kelompok-2', kelompokNama: 'Kamar Makkah (Gedung B)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-10', nama: 'Rafi Mubarak', nis: '2024012', kelasId: 'kelas-2', kelasNama: 'Kelas 8A (Tsanawiyah)', kelompokId: 'kelompok-2', kelompokNama: 'Kamar Makkah (Gedung B)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-11', nama: 'Salman Al-Farisi', nis: '2024013', kelasId: 'kelas-2', kelasNama: 'Kelas 8A (Tsanawiyah)', kelompokId: 'kelompok-2', kelompokNama: 'Kamar Makkah (Gedung B)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-12', nama: 'Tariq Ziyad', nis: '2024014', kelasId: 'kelas-2', kelasNama: 'Kelas 8A (Tsanawiyah)', kelompokId: 'kelompok-2', kelompokNama: 'Kamar Makkah (Gedung B)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-13', nama: 'Usamah Bin Zaid', nis: '2024015', kelasId: 'kelas-2', kelasNama: 'Kelas 8A (Tsanawiyah)', kelompokId: 'kelompok-2', kelompokNama: 'Kamar Makkah (Gedung B)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-14', nama: 'Zaki Al-Attas', nis: '2024016', kelasId: 'kelas-2', kelasNama: 'Kelas 8A (Tsanawiyah)', kelompokId: 'kelompok-2', kelompokNama: 'Kamar Makkah (Gedung B)', isActive: true, createdAt: new Date().toISOString() },

  // Kamar Jeddah (Kelompok 3) - Kelas 9B
  { id: 'santri-15', nama: 'Affan Maulidi', nis: '2023021', kelasId: 'kelas-3', kelasNama: 'Kelas 9B (Tsanawiyah)', kelompokId: 'kelompok-3', kelompokNama: 'Kamar Jeddah (Gedung C)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-16', nama: 'Baqir Shadiq', nis: '2023022', kelasId: 'kelas-3', kelasNama: 'Kelas 9B (Tsanawiyah)', kelompokId: 'kelompok-3', kelompokNama: 'Kamar Jeddah (Gedung C)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-17', nama: 'Dzaki Hamizan', nis: '2023023', kelasId: 'kelas-3', kelasNama: 'Kelas 9B (Tsanawiyah)', kelompokId: 'kelompok-3', kelompokNama: 'Kamar Jeddah (Gedung C)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-18', nama: 'Fathan Habib', nis: '2023024', kelasId: 'kelas-3', kelasNama: 'Kelas 9B (Tsanawiyah)', kelompokId: 'kelompok-3', kelompokNama: 'Kamar Jeddah (Gedung C)', isActive: true, createdAt: new Date().toISOString() },
  { id: 'santri-19', nama: 'Ghazi Ramadhan', nis: '2023025', kelasId: 'kelas-3', kelasNama: 'Kelas 9B (Tsanawiyah)', kelompokId: 'kelompok-3', kelompokNama: 'Kamar Jeddah (Gedung C)', isActive: true, createdAt: new Date().toISOString() },
];

export async function seedInitialData(force = false) {
  try {
    const santriSnap = await getDocs(collection(db, 'santri'));
    if (!force && !santriSnap.empty) {
      console.log('Database already populated.');
      return false;
    }

    console.log('Seeding initial data into Firestore...');

    // 1. Users
    for (const user of DEMO_USERS) {
      await setDoc(doc(db, 'users', user.id), user);
    }

    // 2. Kelas
    for (const k of DEMO_KELAS) {
      await setDoc(doc(db, 'kelas', k.id), k);
    }

    // 3. Kelompok
    for (const kel of DEMO_KELOMPOK) {
      await setDoc(doc(db, 'kelompok', kel.id), kel);
    }

    // 4. Santri
    for (const s of DEMO_SANTRI) {
      await setDoc(doc(db, 'santri', s.id), s);
    }

    // 5. Konfigurasi Sholat
    for (const cfg of DEFAULT_SHOLAT_CONFIG) {
      await setDoc(doc(db, 'konfigurasi_sholat', cfg.id), cfg);
    }

    // 6. Generate 7 days of attendance records for rich initial dashboards
    const batch = writeBatch(db);
    const sholatKeys: WaktuSholatKey[] = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    
    // Dates from 6 days ago up to today
    const dates: string[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    let recordCounter = 0;
    for (const dateStr of dates) {
      for (const santri of DEMO_SANTRI) {
        for (const sholat of sholatKeys) {
          recordCounter++;
          const id = `abs-${dateStr}-${santri.id}-${sholat}`;
          
          // Realistic distribution: 82% berjamaah, 8% munfarid, 4% sakit, 3% izin, 3% alpha
          let status: 'berjamaah' | 'munfarid' | 'sakit' | 'izin' | 'alpha' = 'berjamaah';
          let alasanAlpha = null;
          let catatan = null;

          // Make student Danish Al-Ghazali (santri-4) have lower attendance for warning alerts
          if (santri.id === 'santri-4' && (sholat === 'subuh' || sholat === 'isya')) {
            const rand = Math.random();
            if (rand < 0.6) {
              status = 'alpha';
              alasanAlpha = 'ketiduran';
              catatan = 'Ketiduran di kamar';
            } else {
              status = 'munfarid';
            }
          } else {
            const rand = Math.random();
            if (rand < 0.82) {
              status = 'berjamaah';
            } else if (rand < 0.90) {
              status = 'munfarid';
              catatan = 'Masyaallah munfarid di masjid';
            } else if (rand < 0.94) {
              status = 'sakit';
              catatan = 'Demam di UKS';
            } else if (rand < 0.97) {
              status = 'izin';
              catatan = 'Izin ke kamar mandi/keperluan ustadz';
            } else {
              status = 'alpha';
              alasanAlpha = 'tanpa_keterangan';
            }
          }

          const recordDoc: AbsensiRecord = {
            id,
            santriId: santri.id,
            santriNama: santri.nama,
            nis: santri.nis,
            kelompokId: santri.kelompokId,
            kelompokNama: santri.kelompokNama,
            kelasId: santri.kelasId,
            kelasNama: santri.kelasNama,
            musyrifId: santri.kelompokId === 'kelompok-1' ? 'user-musyrif-1' : (santri.kelompokId === 'kelompok-2' ? 'user-musyrif-2' : 'user-musyrif-1'),
            musyrifNama: santri.kelompokId === 'kelompok-1' ? 'Ustadz Ahmad Fauzi, S.Pd.I' : 'Ustadz Zulkifli, S.Ag',
            tanggal: dateStr,
            waktuSholat: sholat,
            status,
            alasanAlpha,
            catatan,
            createdAt: `${dateStr}T12:00:00.000Z`,
            updatedAt: `${dateStr}T12:00:00.000Z`,
          };

          const docRef = doc(db, 'absensi', id);
          batch.set(docRef, recordDoc);
        }
      }
    }

    await batch.commit();
    console.log(`Successfully seeded ${recordCounter} absensi records and master data!`);
    return true;
  } catch (error) {
    console.error('Error seeding data:', error);
    return false;
  }
}
