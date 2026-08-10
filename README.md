<div align="center">

<img src="public/favicon.svg" alt="SholTrack Logo" width="80" height="80" />

# 🕌 SholTrack

### Sistem Monitoring Ibadah Sholat 5 Waktu Santri

*A comprehensive prayer attendance monitoring system for Islamic boarding schools*

---

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)

[![Status](https://img.shields.io/badge/Status-Production%20Ready-0d9488?style=flat-square)](https://sholtrack.pages.dev)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](LICENSE)
[![PRs](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

</div>

---

## 📑 Daftar Isi

- [🌐 Live Demo](#-live-demo)
- [🎯 Latar Belakang](#-latar-belakang)
- [✨ Fitur Utama](#-fitur-utama)
- [👥 Role & Alur Kerja](#-role--alur-kerja)
- [🗄️ Model Data](#-model-data)
- [🏗️ Arsitektur Sistem](#-arsitektur-sistem)
- [📂 Struktur Proyek](#-struktur-proyek)
- [🚀 Panduan Instalasi](#-panduan-instalasi)
- [🔐 Konfigurasi Firebase](#-konfigurasi-firebase)
- [⚙️ Environment Variables](#-environment-variables)
- [📊 Dashboard & Laporan](#-dashboard--laporan)
- [🧪 Testing](#-testing)
- [🚢 Deployment](#-deployment)
- [🔒 Keamanan](#-keamanan)
- [⚡ Performa](#-performa)
- [🛠️ Tech Stack](#-tech-stack)
- [📝 Changelog](#-changelog)
- [🤝 Kontribusi](#-kontribusi)
- [📄 Lisensi](#-lisensi)

---

## 🌐 Live Demo

| Environment | URL | Status |
|---|---|---|
| **Production** | [sholtrack.pages.dev](https://sholtrack.pages.dev) | 🟢 Active |
| **Preview** | [c06e1585.sholtrack.pages.dev](https://c06e1585.sholtrack.pages.dev) | 🟢 Active |

---

## 🎯 Latar Belakang

**SholTrack** dibangun untuk menyelesaikan masalah nyata di pesantren dan sekolah Islam: **monitoring kedisiplinan sholat 5 waktu santri secara digital dan real-time.**

### Masalah yang Diselesaikan

| Sebelum SholTrack | Dengan SholTrack |
|---|---|
| Pencatatan manual di kertas, mudah hilang | Digital, tersimpan aman di cloud (Firestore) |
| Sulit melacak santri yang sering alpha | **Analitik otomatis**: deteksi pola ketidakhadiran |
| Laporan rekap butuh waktu berjam-jam | **Satu klik**: export Excel/PDF instan |
| Wali kelas tidak tahu kondisi santri | **Dashboard real-time**: tren kehadiran per kelas |
| Kepala sekolah tidak bisa memantau global | **Executive dashboard**: perbandingan antar kelas |
| Rapor ibadah ditulis manual | **Cetak rapor A4**: format profesional siap print |

---

## ✨ Fitur Utama

### 🎛️ Dashboard Real-Time
- **5 Kartu Waktu Sholat** — Subuh, Dzuhur, Ashar, Maghrib, Isya
- Progres pengisian absensi per hari dengan progress bar
- Statistik berjamaah vs munfarid vs alpha per waktu sholat
- Daftar santri yang menjadi tanggung jawab musyrif

### ✍️ Form Absensi Canggih
- **5 Status Kehadiran**: Berjamaah, Munfarid, Sakit, Izin, Alpha
- **Bulk Action**: "Pilih Semua Hadir Berjamaah" dalam satu klik
- Validasi wajib — tidak bisa simpan sebelum semua santri terisi
- Input alasan Alpha (tanpa keterangan, ketiduran, terlambat, kegiatan lain)
- Catatan tambahan per santri
- Responsive: grid tombol mobile-friendly

### 📈 Laporan & Ekspor
| Jenis Laporan | Format | Keterangan |
|---|---|---|
| Harian | Excel (.xlsx), PDF | Rekap 5 waktu sholat per santri dalam 1 hari |
| Mingguan | Excel (.xlsx) | Skor dari 35 slot sholat (7 hari × 5 waktu) |
| Bulanan | Excel (.xlsx) | Rekap komprehensif: Berjamaah, Munfarid, Sakit, Izin, Alpha |
| Rapor Individu | Print-ready A4 | Format resmi dengan kop sekolah, tabel, predikat, tanda tangan |

### 📊 Analitik & Insight
- **Sholat Paling Sering Diabaikan** — Membantu musyrif fokus pengawasan
- **Hari dengan Kehadiran Terendah** — Deteksi pola mingguan
- **Santri Perlu Konseling Khusus** — Auto-flag santri alpha ≥ 3 kali

### 🛡️ Manajemen Data Master
- **CRUD Santri** — Nama, NIS, Kelas, Kamar, Status Aktif
- **CRUD Kelas** — Penugasan Wali Kelas
- **CRUD Kelompok/Kamar** — Penugasan Musyrif
- **Manajemen User** — 3 role, status aktif/nonaktif
- **Konfigurasi Waktu Sholat** — Atur batas jam pengisian per waktu sholat

---

## 👥 Role & Alur Kerja

```
┌──────────────────────────────────────────────────────────────┐
│                    🎓 KEPALA SEKOLAH                          │
│  • Dashboard eksekutif — perbandingan seluruh kelas           │
│  • CRUD master data (santri, kelas, kelompok, user)           │
│  • Konfigurasi waktu sholat                                   │
│  • Semua laporan & analitik                                   │
│  • Ekspor Excel/PDF global                                    │
└──────────────────────────┬───────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                                 ▼
┌─────────────────────┐          ┌─────────────────────┐
│  👨‍🏫 WALI KELAS       │          │  🕌 MUSYRIF           │
│  • Dashboard kelas   │          │  • Dashboard kamar   │
│  • Tren 7 hari       │◄─────────│  • ISI ABSENSI ✍️    │
│  • Leaderboard santri│  Data    │  • Riwayat absensi   │
│  • Peringatan alpha  │  Absensi │  • Real-time sync    │
│  • Cetak rapor A4    │          │                      │
└─────────────────────┘          └─────────────────────┘
```

| Role | Modul | Tanggung Jawab Utama |
|---|---|---|
| 🕌 **Musyrif** | Form Absensi, Dashboard, Riwayat | Mencatat kehadiran sholat 5 waktu setiap santri di kamar/kelompok |
| 👨‍🏫 **Wali Kelas** | Dashboard, Leaderboard, Rapor | Memonitor tren kehadiran, mengidentifikasi santri bermasalah, mencetak rapor |
| 🎓 **Kepala Sekolah** | Executive Dashboard, CRUD, Konfigurasi | Manajemen global, analitik sekolah, pengaturan sistem |

---

## 🗄️ Model Data

### Entity Relationship

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  Kelas   │──────▶│  Santri  │◀──────│ Kelompok │
└──────────┘       └────┬─────┘       └──────────┘
     │                   │                   │
     │              ┌────▼─────┐              │
     └─────────────▶│ Absensi  │◀─────────────┘
                    │  Record  │
                    └──────────┘
                         │
                    ┌────▼─────┐
                    │   User   │
                    │  Account │
                    └──────────┘
```

### Firestore Collections

| Collection | Document ID | Key Fields |
|---|---|---|
| `/users/{userId}` | Auto-generated | `name`, `email`, `role`, `kelompokId`, `kelasId`, `isActive` |
| `/kelas/{kelasId}` | `kelas-{n}` | `namaKelas`, `waliKelasId`, `waliKelasNama` |
| `/kelompok/{kelompokId}` | `kelompok-{n}` | `namaKelompok`, `musyrifId`, `musyrifNama`, `kelasId` |
| `/santri/{santriId}` | `santri-{n}` | `nama`, `nis`, `kelasId`, `kelompokId`, `isActive` |
| `/absensi/{absensiId}` | `abs-{date}-{santriId}-{sholat}` | `santriId`, `tanggal`, `waktuSholat`, `status`, `alasanAlpha`, `catatan` |
| `/konfigurasi_sholat/{sholatId}` | `subuh`..`isya` | `nama`, `batasAwalPengisian`, `batasAkhirPengisian`, `urutan` |

### Status Sholat Enum

| Status | Kode | Deskripsi |
|---|---|---|
| Hadir Berjamaah | `berjamaah` | Sholat tepat waktu bersama jamaah di masjid |
| Hadir Munfarid | `munfarid` | Sholat sendiri (tidak berjamaah) |
| Sakit | `sakit` | Tidak hadir karena kondisi kesehatan |
| Izin | `izin` | Tidak hadir dengan izin resmi |
| Alpha | `alpha` | Tidak hadir tanpa keterangan |

---

## 🏗️ Arsitektur Sistem

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                    │
│  ┌────────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ React 19   │  │ React    │  │ TanStack Query   │  │
│  │ SPA        │  │ Router 7 │  │ (Cache Layer)    │  │
│  └─────┬──────┘  └──────────┘  └──────────────────┘  │
│        │                                               │
│  ┌─────▼──────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Error      │  │ Optimis- │  │ Tailwind CSS v4  │  │
│  │ Boundary   │  │ tic UI   │  │ (Utility-first)  │  │
│  └────────────┘  └──────────┘  └──────────────────┘  │
└──────────────────────┬───────────────────────────────┘
                       │ Firebase JS SDK v12
┌──────────────────────▼───────────────────────────────┐
│                  FIREBASE CLOUD                        │
│  ┌────────────────┐  ┌────────────────────────────┐  │
│  │ Authentication │  │ Firestore (NoSQL Database)  │  │
│  │ • Email/Pass   │  │ • 6 collections            │  │
│  │ • Role-based   │  │ • Real-time listeners       │  │
│  └────────────────┘  │ • Security Rules            │  │
│                       └────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│                  DEPLOYMENT                            │
│  ┌────────────────────────────────────────────────┐   │
│  │  Cloudflare Pages • Automatic CI/CD • Global CDN│   │
│  └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### Design Patterns

| Pattern | Implementasi | Manfaat |
|---|---|---|
| **Error Boundary** | `ErrorBoundary.tsx` — class component wrapper | Isolasi crash per halaman, mencegah white screen |
| **Cache Layer** | `queryCache.ts` — TTL 5 menit, `fetchWithCache()`, `invalidateCache()` | Mengurangi Firestore reads hingga 80% |
| **Optimistic UI** | CRUD components update local state sebelum server response | UX instant, tidak ada loading spinner |
| **Role-Based Rendering** | Sidebar, Navbar, Routes menyesuaikan `currentUser.role` | Satu codebase, tiga pengalaman berbeda |
| **Compound Components** | `StatusBadge`, `MosqueIcon`, `NotificationDrawer` | Reusable, konsisten di seluruh aplikasi |

---

## 📂 Struktur Proyek

```
sholtrack/
│
├── 📄 index.html                         # HTML entry point
├── 📄 package.json                       # Dependencies & scripts
├── 📄 tsconfig.json                      # TypeScript configuration
├── 📄 vite.config.ts                     # Vite + Tailwind + Path alias
├── 📄 vitest.config.ts                   # Test runner configuration
├── 📄 firebase-applet-config.json        # Firebase project credentials
├── 📄 firebase-blueprint.json            # Firestore schema definition
├── 📄 firestore.rules                    # Security rules (role-based)
├── 📄 .env.example                       # Environment variables template
├── 📄 .gitignore
│
├── 📁 public/
│   └── 🎨 favicon.svg                    # Masjid icon favicon
│
└── 📁 src/
    ├── 🚀 main.tsx                       # React entry point
    ├── 🧩 App.tsx                        # Root component + Router + Auth Gate
    ├── 🎨 index.css                      # Tailwind CSS import
    │
    ├── 📁 types/
    │   └── 📐 index.ts                   # All TypeScript interfaces & types
    │
    ├── 📁 lib/
    │   ├── 🔥 firebase.ts                # Firebase initialization
    │   ├── 💾 queryCache.ts              # Firestore cache layer
    │   └── 🌱 seedData.ts                # Demo data generator (19 santri, 7 hari)
    │
    ├── 📁 context/
    │   └── 🔐 AuthContext.tsx            # Auth provider + demo mode + seed
    │
    ├── 📁 __tests__/
    │   └── 🧪 basic.test.ts             # Unit test samples
    │
    └── 📁 components/
        ├── 🔑 auth/
        │   └── LoginPage.tsx             # Firebase Authentication UI
        │
        ├── 🧱 common/
        │   ├── ErrorBoundary.tsx         # Global error catcher
        │   ├── MosqueIcon.tsx            # Custom SVG masjid icon
        │   ├── StatusBadge.tsx           # Sholat status badge (5 variants)
        │   ├── Navbar.tsx                # Top navigation bar
        │   ├── Sidebar.tsx               # Desktop sidebar navigation
        │   ├── MobileNav.tsx             # Bottom mobile navigation bar
        │   └── NotificationDrawer.tsx    # Slide-in notification panel
        │
        ├── 🕌 musyrif/
        │   ├── MusyrifDashboard.tsx      # Real-time prayer attendance dashboard
        │   ├── FormAbsensiSholat.tsx     # Attendance input form per student
        │   └── RiwayatAbsensiMusyrif.tsx # Attendance history by date
        │
        ├── 👨‍🏫 walikelas/
        │   └── WaliKelasDashboard.tsx    # Class monitoring & 7-day trend chart
        │
        ├── 🎓 kepalasekolah/
        │   ├── KepalaSekolahDashboard.tsx # Executive school-wide dashboard
        │   ├── MasterSantri.tsx           # Student CRUD management
        │   ├── MasterKelasKelompok.tsx    # Class & dormitory group CRUD
        │   ├── KonfigurasiSholat.tsx      # Prayer time window configuration
        │   └── UserManagement.tsx         # User account CRUD management
        │
        ├── 📊 laporan/
        │   ├── LaporanHarian.tsx          # Daily report + Excel/PDF export
        │   ├── LaporanMingguan.tsx        # Weekly recapitulation (35 prayer slots)
        │   ├── LaporanBulanan.tsx         # Monthly report + bar chart
        │   └── CetakRaporSantri.tsx       # A4 printable individual report
        │
        └── 📈 analytics/
            └── AnalitikInsight.tsx        # Prayer pattern analysis & insights
```

---

## 🚀 Panduan Instalasi

### Prasyarat

| Tools | Versi Minimum |
|---|---|
| **Node.js** | 18.x atau lebih baru |
| **npm** | 9.x atau lebih baru |
| **Firebase Project** | Blaze plan (untuk production) |

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/kevinadisuryanugraha/MonitoringSholat.git
cd MonitoringSholat

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Jalankan development server
npm run dev
```

Aplikasi akan berjalan di **`http://localhost:3000`**

### NPM Scripts

| Command | Deskripsi |
|---|---|
| `npm run dev` | Jalankan development server dengan HMR |
| `npm run build` | Build production ke folder `dist/` |
| `npm run preview` | Preview production build secara lokal |
| `npm test` | Jalankan unit tests dengan Vitest |
| `npm run lint` | TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Hapus folder `dist/` |

---

## 🔐 Konfigurasi Firebase

### 1. Buat Firebase Project

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Klik **Add Project** → ikuti wizard
3. Enable **Authentication** → pilih **Email/Password**
4. Enable **Cloud Firestore** → pilih lokasi database

### 2. Konfigurasi Firebase di Aplikasi

Update file `firebase-applet-config.json` dengan kredensial Firebase project Anda:

```json
{
  "projectId": "YOUR_PROJECT_ID",
  "appId": "YOUR_APP_ID",
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT.firebaseapp.com",
  "storageBucket": "YOUR_PROJECT.appspot.com",
  "messagingSenderId": "YOUR_SENDER_ID"
}
```

### 3. Deploy Firestore Security Rules

```bash
npx firebase deploy --only firestore:rules
```

### 4. Buat Composite Indexes

Firebase akan otomatis memberikan link untuk membuat composite index yang diperlukan saat query dijalankan pertama kali. Klik link tersebut untuk membuat index.

---

## ⚙️ Environment Variables

| Variable | Required | Deskripsi | Default |
|---|---|---|---|
| `GEMINI_API_KEY` | Optional | API key untuk Gemini AI (fitur masa depan) | - |
| `APP_URL` | Optional | URL hosting aplikasi | `http://localhost:3000` |

---

## 📊 Dashboard & Laporan

### Dashboard Musyrif
```
┌─────────────────────────────────────────────────┐
│  🕌 Assalamu'alaikum, Ustadz Ahmad Fauzi         │
│  📅 Senin, 10 Agustus 2026                       │
│  👥 Kamar Madinah (Gedung A) • 8 Santri           │
│  📊 Progres Absen Hari Ini: 3 / 5 Sholat (60%)   │
├─────────────────────────────────────────────────┤
│  [Subuh]  [Dzuhur]  [Ashar]  [Maghrib]  [Isya]  │
│  ✅Sudah  ✅Sudah   ✅Sudah   ⏳Belum   ⏳Belum  │
│  Diisi    Diisi     Diisi     Diisi     Diisi    │
├─────────────────────────────────────────────────┤
│  📋 Daftar Santri                                │
│  Muhammad Ali • Ahmad Faisal • Bilal Habasyi ... │
└─────────────────────────────────────────────────┘
```

### Dashboard Wali Kelas
- **4 Metric Cards**: Total Santri, Hadir Berjamaah, Tingkat Kehadiran, Perlu Perhatian
- **Line Chart**: Tren kehadiran 7 hari terakhir
- **Alert Box**: Santri dengan alpha ≥ 3 atau kehadiran < 70%
- **Tabel Leaderboard**: Ranking kehadiran per santri

### Dashboard Kepala Sekolah
- **4 Metric Cards**: Total Santri, Tingkat Kehadiran Sekolah, Kelas Peringkat #1, Kamar Belum Diisi
- **Bar Chart**: Perbandingan kehadiran antar kelas
- **Status Panel**: Monitoring kepatuhan musyrif mengisi absensi
- **Quick Actions**: Navigasi cepat ke master data & laporan

---

## 🧪 Testing

### Menjalankan Tests

```bash
# Semua tests
npm test

# Watch mode
npm run test:watch

# Type checking
npm run lint
```

### Struktur Test

```
src/__tests__/
└── basic.test.ts    # Unit tests untuk core logic
```

---

## 🚢 Deployment

### Cloudflare Pages (Direkomendasikan)

```bash
# 1. Build aplikasi
npm run build

# 2. Deploy ke Cloudflare Pages
npx wrangler pages deploy dist --project-name=sholtrack

# 3. Set environment variables di Cloudflare Dashboard jika diperlukan
```

### Vercel / Netlify

Cukup hubungkan repository GitHub dan set:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

## 🔒 Keamanan

| Layer | Implementasi |
|---|---|
| **Authentication** | Firebase Auth — Email/Password |
| **Authorization** | Role-based access control (Musyrif, Wali Kelas, Kepala Sekolah) |
| **Database** | Firestore Security Rules — validasi role per koleksi |
| **API Key** | Firebase API key aman di client-side, keamanan via Security Rules |
| **Error Handling** | Error Boundary global — mencegah crash aplikasi |
| **Input Validation** | Form absensi memvalidasi semua field sebelum submit |

### Firestore Security Rules (Ringkasan)

```
/users/{userId}      → Baca: semua auth, Tulis: self atau kepala_sekolah
/kelas/{kelasId}      → Baca: semua auth, Tulis: kepala_sekolah only
/kelompok/{id}        → Baca: semua auth, Tulis: kepala_sekolah only
/santri/{id}          → Baca: semua auth, Tulis: kepala_sekolah only
/absensi/{id}         → Baca: semua auth, Tulis: musyrif (kelompok sendiri) atau kepala_sekolah
/konfigurasi_sholat   → Baca: semua auth, Tulis: kepala_sekolah only
```

> 📄 Full rules: [`firestore.rules`](firestore.rules)

---

## ⚡ Performa

| Optimasi | Teknik | Dampak |
|---|---|---|
| **Query Caching** | `fetchWithCache()` — TTL 5 menit | Mengurangi Firestore reads ~80% |
| **Read Limits** | `limit(1000)` pada semua query | Mencegah query tidak terbatas |
| **Optimistic UI** | State lokal diupdate sebelum server | UX instant, perceived performance ⬆️ |
| **Batch Writes** | `writeBatch()` untuk absensi massal | Atomic, 1 network request untuk N santri |
| **Real-time Listeners** | `onSnapshot()` hanya di dashboard musyrif | Data real-time tanpa polling |
| **Client-side Filtering** | Filter data di client setelah fetch cache | Tidak ada query Firestore berulang |

---

## 🛠️ Tech Stack

### Frontend

| Teknologi | Versi | Kegunaan |
|---|---|---|
| **React** | 19.0 | UI library dengan concurrent rendering |
| **TypeScript** | 5.8 | Static type checking |
| **Vite** | 6.4 | Build tool & dev server (HMR) |
| **Tailwind CSS** | 4.1 | Utility-first CSS framework |
| **React Router** | 7.x | Client-side routing (deep linking) |
| **Recharts** | 3.x | Chart visualizations (Line, Bar) |
| **Lucide React** | 0.546 | 30+ icons, tree-shakeable |
| **Motion** | - | React animations (removed — unused) |

### Backend & Database

| Teknologi | Kegunaan |
|---|---|
| **Firebase Auth** | Authentication (Email/Password) |
| **Cloud Firestore** | NoSQL document database |
| **Firestore Security Rules** | Role-based access control |

### Export & Reporting

| Teknologi | Kegunaan |
|---|---|
| **jsPDF** | Generate PDF laporan (client-side) |
| **SheetJS (xlsx)** | Generate Excel laporan |

### Testing & Quality

| Teknologi | Kegunaan |
|---|---|
| **Vitest** | Unit test runner |
| **TypeScript** | Compile-time type checking |
| **ESLint** | Built-in via Vite |

### Deployment

| Teknologi | Kegunaan |
|---|---|
| **Cloudflare Pages** | Static site hosting, global CDN |
| **Wrangler CLI** | Cloudflare deployment tooling |

---

## 📝 Changelog

### v1.0.0 (Agustus 2026)

**Initial Release — Production Ready**

- ✅ 3 role pengguna: Musyrif, Wali Kelas, Kepala Sekolah
- ✅ Dashboard real-time dengan Firestore listener
- ✅ Form absensi 5 waktu sholat per santri
- ✅ Laporan harian, mingguan, bulanan
- ✅ Export Excel (.xlsx) & PDF
- ✅ Cetak rapor individu A4 (print-ready)
- ✅ Analitik & insight kedisiplinan sholat
- ✅ CRUD master data (santri, kelas, kelompok, user)
- ✅ Konfigurasi batas waktu pengisian sholat
- ✅ Firebase Auth + Firestore
- ✅ React Router v7 untuk deep-linking
- ✅ Cache layer dengan TTL 5 menit
- ✅ Optimistic UI untuk CRUD
- ✅ Error boundary global
- ✅ Firestore Security Rules (role-based)
- ✅ Responsive design (mobile + desktop)
- ✅ 19 santri demo + 7 hari data absensi
- ✅ Unit test setup (Vitest)
- ✅ Deploy ke Cloudflare Pages

---

## 🤝 Kontribusi

Kami menyambut kontribusi dari komunitas!

### Alur Kontribusi

1. **Fork** repository ini
2. Buat branch fitur: `git checkout -b feat/nama-fitur`
3. Commit perubahan: `git commit -m "feat: deskripsi singkat"`
4. Push ke branch: `git push origin feat/nama-fitur`
5. Buka **Pull Request** ke branch `main`

### Konvensi Commit

| Prefix | Deskripsi |
|---|---|
| `feat:` | Fitur baru |
| `fix:` | Perbaikan bug |
| `docs:` | Perubahan dokumentasi |
| `refactor:` | Refactoring kode |
| `style:` | Perubahan styling (CSS, formatting) |
| `test:` | Menambah atau memperbaiki test |
| `chore:` | Maintenance, dependencies, config |

### Panduan Kode

- Gunakan **TypeScript** strict mode
- Ikuti struktur komponen yang sudah ada
- Tambahkan **JSDoc comment** untuk fungsi kompleks
- Pastikan `npm run lint` lolos sebelum commit
- Tulis unit test untuk fitur baru

---

## 📄 Lisensi

**Private** — Pondok Pesantren & Islamic School

© 2026 SholTrack. All rights reserved.

---

<div align="center">

### Dibangun dengan ❤️ untuk Pendidikan Islam Indonesia

[![GitHub](https://img.shields.io/badge/GitHub-kevinadisuryanugraha-181717?style=flat-square&logo=github)](https://github.com/kevinadisuryanugraha/MonitoringSholat)
[![Website](https://img.shields.io/badge/Website-sholtrack.pages.dev-0d9488?style=flat-square)](https://sholtrack.pages.dev)

</div>
