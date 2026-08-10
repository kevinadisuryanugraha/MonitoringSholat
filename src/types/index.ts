export type UserRole = 'musyrif' | 'wali_kelas' | 'kepala_sekolah';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  kelompokId?: string | null; // For Musyrif (e.g. Kamar Madinah)
  kelompokNama?: string | null;
  kelasId?: string | null;    // For Wali Kelas (e.g. Kelas 7A)
  kelasNama?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Kelas {
  id: string;
  namaKelas: string;
  waliKelasId?: string | null;
  waliKelasNama?: string | null;
  jumlahSantri?: number;
  createdAt: string;
}

export interface Kelompok {
  id: string;
  namaKelompok: string; // e.g., Kamar Madinah, Kamar Makkah
  musyrifId?: string | null;
  musyrifNama?: string | null;
  kelasId?: string | null;
  kelasNama?: string | null;
  createdAt: string;
}

export interface Santri {
  id: string;
  nama: string;
  nis: string;
  kelasId: string;
  kelasNama: string;
  kelompokId: string;
  kelompokNama: string;
  fotoUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export type WaktuSholatKey = 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';

export interface KonfigurasiWaktuSholat {
  id: WaktuSholatKey;
  nama: string;
  batasAwalPengisian: string; // e.g. "04:00"
  batasAkhirPengisian: string; // e.g. "07:00"
  urutan: number;
}

export type StatusSholat = 'berjamaah' | 'munfarid' | 'sakit' | 'izin' | 'alpha';

export type AlasanAlpha = 'tanpa_keterangan' | 'ketiduran' | 'terlambat' | 'kegiatan_lain';

export interface AbsensiRecord {
  id: string;
  santriId: string;
  santriNama: string;
  nis: string;
  kelompokId: string;
  kelompokNama: string;
  kelasId: string;
  kelasNama: string;
  musyrifId: string;
  musyrifNama: string;
  tanggal: string; // YYYY-MM-DD
  waktuSholat: WaktuSholatKey;
  status: StatusSholat;
  alasanAlpha?: AlasanAlpha | string | null;
  catatan?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  read: boolean;
  targetRole?: UserRole | 'all';
  userId?: string;
}

export interface SholatStatCard {
  key: WaktuSholatKey;
  label: string;
  timeWindow: string;
  status: 'belum_diisi' | 'sudah_diisi' | 'lewat_waktu';
  totalSantri: number;
  hadirCount: number;
}
