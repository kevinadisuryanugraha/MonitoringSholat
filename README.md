# 🕌 SholTrack — Sistem Monitoring Ibadah Sholat 5 Waktu Santri

<div align="center">

**Aplikasi monitoring absensi sholat untuk Pesantren dan Sekolah Islam**

[![Tech](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v12-FFCA28?logo=firebase)](https://firebase.google.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)

</div>

---

## 📋 Fitur Utama

### 👤 3 Role Pengguna
| Role | Tanggung Jawab |
|---|---|
| **Musyrif** | Mengisi absensi sholat harian per santri di kamar/kelompok |
| **Wali Kelas** | Memonitor kehadiran sholat santri per kelas, melihat tren & leaderboard |
| **Kepala Sekolah** | Manajemen penuh: CRUD master data, laporan, analitik, konfigurasi |

### 📊 Modul Aplikasi
- **Dashboard Real-time** — Statistik kehadiran sholat 5 waktu hari ini
- **Form Absensi** — Input status per santri (Berjamaah, Munfarid, Sakit, Izin, Alpha)
- **Laporan** — Harian, Mingguan, Bulanan
- **Ekspor** — Excel (.xlsx) dan PDF
- **Cetak Rapor A4** — Rapor evaluasi ibadah sholat individual santri
- **Analitik & Insight** — Sholat paling diabai, hari kehadiran terendah, santri perlu konseling
- **Manajemen Data** — CRUD Santri, Kelas, Kelompok, User, Konfigurasi Waktu Sholat

---

## 🚀 Menjalankan Aplikasi

### Prasyarat
- Node.js 18+
- npm

### Instalasi
```bash
npm install
```

### Environment
Copy `.env.example` ke `.env` dan isi konfigurasi:
```bash
cp .env.example .env
```

### Development
```bash
npm run dev
```
Akses di `http://localhost:3000`

### Build Production
```bash
npm run build
```

### Test
```bash
npm test
```

---

## 🔐 Akun Demo

Login dengan password: **`demo123`**

| Role | Email |
|---|---|
| Musyrif | `musyrif@pesantren.sch.id` |
| Wali Kelas | `walikelas@pesantren.sch.id` |
| Kepala Sekolah | `kepala@pesantren.sch.id` |

> **Catatan**: Akun demo menggunakan Firebase Auth. Untuk development, aplikasi juga mendukung demo mode tanpa login (role switcher di navbar).

---

## 🗂️ Struktur Proyek

```
src/
├── main.tsx                          # Entry React
├── App.tsx                           # Root component + React Router
├── index.css                         # Tailwind import
├── types/index.ts                    # TypeScript type definitions
├── lib/
│   ├── firebase.ts                   # Firebase init (Auth + Firestore)
│   ├── queryCache.ts                 # Lapisan cache Firestore
│   └── seedData.ts                   # Seed data (19 santri, 5 user, demo data)
├── context/
│   └── AuthContext.tsx               # Auth provider + login gate
└── components/
    ├── auth/LoginPage.tsx            # Halaman login
    ├── common/
    │   ├── ErrorBoundary.tsx         # Error boundary global
    │   ├── MosqueIcon.tsx            # SVG ikon masjid
    │   ├── StatusBadge.tsx           # Badge status sholat
    │   ├── Navbar.tsx                # Top navbar
    │   ├── Sidebar.tsx               # Desktop sidebar
    │   ├── MobileNav.tsx             # Bottom mobile nav
    │   └── NotificationDrawer.tsx    # Drawer notifikasi
    ├── musyrif/
    │   ├── MusyrifDashboard.tsx      # Dashboard musyrif
    │   ├── FormAbsensiSholat.tsx     # Form absensi
    │   └── RiwayatAbsensiMusyrif.tsx # Riwayat absensi
    ├── walikelas/
    │   └── WaliKelasDashboard.tsx    # Dashboard wali kelas
    ├── kepalasekolah/
    │   ├── KepalaSekolahDashboard.tsx # Dashboard kepala sekolah
    │   ├── MasterSantri.tsx          # CRUD santri
    │   ├── MasterKelasKelompok.tsx   # CRUD kelas & kelompok
    │   ├── KonfigurasiSholat.tsx     # Konfigurasi waktu
    │   └── UserManagement.tsx        # Manajemen user
    ├── laporan/
    │   ├── LaporanHarian.tsx         # Laporan harian + export
    │   ├── LaporanMingguan.tsx       # Laporan mingguan + export
    │   ├── LaporanBulanan.tsx        # Laporan bulanan + chart
    │   └── CetakRaporSantri.tsx      # Cetak rapor A4
    └── analytics/
        └── AnalitikInsight.tsx       # Insight analitik sholat
```

---

## 🔒 Keamanan

- **Firestore Security Rules**: Hanya user terautentikasi yang bisa mengakses data. Role-based access control (Kepala Sekolah = full access, Musyrif = write absensi kelompok sendiri).
- **API Key Firebase**: API key Firebase aman di client-side. Keamanan diatur melalui Firestore Security Rules.
- **Auth Gate**: Aplikasi memerlukan autentikasi untuk mengakses data (dengan fallback demo mode untuk development).

---

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|---|---|
| React 19 | UI framework |
| TypeScript 5.8 | Type safety |
| Vite 6 | Build tool |
| Tailwind CSS v4 | Styling |
| Firebase v12 | Auth + Firestore database |
| React Router v7 | Client-side routing |
| Recharts | Grafik & chart |
| jsPDF | Ekspor PDF |
| XLSX (SheetJS) | Ekspor Excel |
| Lucide React | Ikon |
| Vitest | Testing |

---

## 📐 Arsitektur

- **React Router v7** — Deep-linking support untuk semua halaman
- **Query Cache Layer** — Mengurangi Firestore reads berulang (TTL 5 menit)
- **Optimistic UI** — CRUD operation dengan instant feedback
- **Error Boundary** — Isolasi error per komponen, mencegah crash aplikasi penuh
- **Role-based UI** — Sidebar, navigasi, dan konten menyesuaikan role user

---

## 📝 Lisensi

Private — Pondok Pesantren & Islamic School
