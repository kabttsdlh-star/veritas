# VERITAS Digital
**Sistem Inventarisasi dan Verifikasi Persetujuan Lingkungan Hidup**  
Dinas Lingkungan Hidup — Kabupaten Timor Tengah Selatan

---

## Tentang VERITAS

VERITAS (Verifikasi Inventarisasi Terpadu Atas SPPL) adalah aplikasi web untuk membantu DLH Kab. TTS menginventarisasi dan memverifikasi data Surat Pernyataan Pengelolaan Lingkungan (SPPL) yang terbit otomatis melalui sistem OSS-RBA tanpa mekanisme verifikasi dari DLH.

## Fitur

- **Dashboard** — Statistik, grafik sebaran per kecamatan, status KBLI, skala usaha
- **Input SPPL** — Form inventarisasi data dari portal Amdalnet/OSS
- **Verifikasi Lapangan** — Form cross-check kondisi nyata dan penilaian risiko
- **Database (2 Sheet)** — Data SPPL + Data Verifikasi, filter, dan export CSV
- **Peta Sebaran** — Visualisasi 23 kecamatan Kab. TTS
- **SOP & Panduan** — Standar prosedur dan dasar hukum

## Cara Pakai

Buka langsung di browser — tidak perlu install apapun:

```
https://<username>.github.io/veritas
```

## Cara Upload ke GitHub Pages

1. Buat repository baru di GitHub (contoh: `veritas`)
2. Upload semua file (`index.html`, `style.css`, `app.js`)
3. Buka **Settings → Pages**
4. Pilih **Source: Deploy from a branch → main → / (root)**
5. Klik **Save** — website aktif dalam 1-2 menit

## Struktur File

```
veritas/
├── index.html      # Halaman utama aplikasi
├── style.css       # Tampilan / desain
├── app.js          # Logika aplikasi dan database
└── README.md       # Dokumentasi ini
```

## Teknologi

| Komponen | Teknologi | Keterangan |
|---|---|---|
| Frontend | HTML + CSS + JavaScript | Ringan, tanpa framework |
| Database | localStorage browser | Data tersimpan di perangkat |
| Chart | Chart.js | Gratis, open source |
| Icon | Tabler Icons | Gratis, open source |
| Hosting | GitHub Pages | Gratis selamanya |

## Sinkronisasi ke Google Sheets

Data bisa di-export ke CSV lalu diimport ke Google Sheets DLH untuk:
- Backup data instansi
- Pelaporan bulanan ke pimpinan
- Koordinasi dengan DPMPTSP

## Dasar Hukum

- Permenpan No. 30 Tahun 2019
- Perbup TTS No. 73 Tahun 2016
- PP No. 22 Tahun 2021

---

**Dikembangkan dalam rangka Aktualisasi Latsar CPNS 2026**  
Yoselfina · DLH Kabupaten Timor Tengah Selatan
