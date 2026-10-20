# 🏆 RankHub — Universal Ranking & Leaderboard Platform

RankHub adalah platform papan peringkat (*leaderboard*) dan lelang prioritas modular berbasis **Next.js 15+ App Router, Tailwind CSS, TypeScript, dan Framer Motion** yang siap di-deploy secara instan ke **Vercel**.

Platform ini dapat digunakan untuk berbagai skenario:
1. **Lelang Urutan Bot SubSecond Priority Queue**: Menentukan urutan antrean eksekusi millisecond berdasarkan penawaran tertinggi yang sudah lunas (*verified*).
2. **Turnamen & Speedrun Pemrograman**: Pengurutan waktu eksekusi tersingkat (*lowest first / ms latency*).
3. **Papan Peringkat Universal**: Voting, lelang proyek, antrean audit VIP, dan kompetisi publik.

---

## ⚡ Fitur Utama

- **Universal Multi-Board**: Buat dan kelola banyak papan peringkat secara independen dengan konfigurasi fleksibel:
  - Logika pengurutan: **Highest First (Desc)** atau **Lowest First (Asc)**.
  - Format skor/unit: **Rupiah (`Rp`)**, **Milidetik (`ms`)**, **Angka Murni**, atau teks kustom.
  - Status papan: `ACTIVE`, `LOCKED` (final/ditutup), `ARCHIVED`.
  - Target Deadline dengan **Live Real-time Countdown Timer**.
  - Visibilitas: `PUBLIC` (tampil di direktori) atau `UNLISTED` (link rahasia).
- **Podium Top 3 Interaktif**: Podium animasi Gold (#1), Silver (#2), dan Bronze (#3) dengan ketinggian dinamis, efek glow, dan selebrasi confetti.
- **Tabel Peringkat Responsif**:
  - Filter status instan (`Semua`, `Lunas / Verified`, `Pending`).
  - Pencarian cepat berdasarkan nama alias atau NIM.
  - **Fitur Privasi (Masking)**: Sensor digit NIM/identitas publik otomatis (`211201****0088`).
  - Tombol salin identitas satu-klik.
- **Panel Admin Terproteksi (`/admin`)**:
  - Akses aman dilindungi **Admin Master Secret / PIN**.
  - Manajemen Papan: Tambah, edit, kunci lelang, dan hapus papan.
  - Manajemen Peserta: Tambah manual, ubah status pembayaran (*Pending* ➡️ *Paid/Verified*), edit skor, dan hapus peserta.
- **Ekspor Data & Sinkronisasi Bot**:
  - Download format **JSON** dan **CSV (Excel)** langsung dari antarmuka.
  - Dedicated Integration API: Endpoint `/api/boards/[slug]/ranks?format=queue` dirancang khusus untuk ditarik langsung oleh **Cloudflare Worker** atau bot SubSecond.

---

## 📁 Struktur Direktori

```text
RankHub/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/route.ts                     # Autentikasi Admin PIN/Secret & Session
│   │   │   ├── boards/
│   │   │   │   ├── route.ts                      # GET all boards, POST create board
│   │   │   │   └── [slug]/
│   │   │   │       ├── route.ts                  # GET board detail, PATCH, DELETE
│   │   │   │       ├── participants/route.ts     # POST, PATCH, DELETE peserta
│   │   │   │       └── ranks/route.ts            # External Bot Integration Endpoint (CORS enabled)
│   │   │   └── reset/route.ts                    # Reset database ke seed data
│   │   ├── board/[slug]/
│   │   │   ├── page.tsx                          # Tampilan publik papan peringkat & podium
│   │   │   └── board-client-controls.tsx         # Kontrol interaktif publik (submit bid, share, export)
│   │   ├── admin/
│   │   │   ├── page.tsx                          # Admin Dashboard & Console
│   │   │   ├── admin-board-modal.tsx             # Modal form tambah/edit papan
│   │   │   └── admin-participant-modal.tsx       # Modal form tambah/edit peserta
│   │   ├── layout.tsx                            # Root Layout (Dark Neon Theme)
│   │   ├── page.tsx                              # Homepage direktori papan peringkat
│   │   └── globals.css                           # Tailwind CSS & Glassmorphism styles
│   ├── components/
│   │   ├── navbar.tsx                            # Header navigasi & status
│   │   ├── countdown-timer.tsx                   # Live cutoff countdown timer
│   │   ├── podium.tsx                            # Podium 3D Top 3 dengan confetti
│   │   ├── leaderboard-table.tsx                 # Tabel klasemen realtime & privacy mask
│   │   ├── submit-bid-modal.tsx                  # Form pengajuan tawaran publik
│   │   └── export-modal.tsx                      # Modal ekspor data & kode integrasi bot
│   ├── lib/
│   │   ├── auth.ts                               # Validasi Admin Secret (Header/Cookie/Query)
│   │   ├── seed-data.ts                          # Initial mock data realistis
│   │   ├── storage.ts                            # Persistent Storage Layer (File/Memory/KV Ready)
│   │   └── utils.ts                              # Formatter mata uang, ms, masking NIM, sorting
│   └── types/
│       └── index.ts                              # Skema tipe data TypeScript lengkap
├── .env.example
├── package.json
└── README.md
```

---

## 🤖 Integrasi Eksternal (Cloudflare Worker SubSecond Bot)

Endpoint `/api/boards/[slug]/ranks` telah dilengkapi header CORS (`*`) dan mendukung parameter query berikut:

| Parameter | Default | Keterangan |
| :--- | :--- | :--- |
| `format` | `standard` | Setel `format=queue` untuk format array ringkas bot SubSecond |
| `status` | `VERIFIED` | Filter status (`VERIFIED`, `PENDING`, atau `ALL`) |
| `limit` | *Semua* | Batas jumlah entri teratas (misal: `limit=10`) |
| `secret` | - | Masukkan admin secret untuk mendapatkan identifier / NIM asli tanpa sensor |

### Contoh Request cURL
```bash
curl -X GET "https://rankhub.vercel.app/api/boards/lelang-subsecond-w10/ranks?format=queue" \
  -H "x-api-key: rankhub2026"
```

### Contoh JSON Output (`format=queue`)
```json
{
  "success": true,
  "board": {
    "slug": "lelang-subsecond-w10",
    "title": "Lelang SubSecond Priority Queue W10",
    "status": "ACTIVE",
    "sortOrder": "DESC",
    "unitType": "CURRENCY_IDR"
  },
  "count": 5,
  "queue": [
    {
      "priorityIndex": 1,
      "identifier": "21120120140088",
      "alias": "CyberSniper_99",
      "bidValue": 550000,
      "status": "VERIFIED",
      "delayOffsetMs": 5,
      "meta": { "telegram": "@cybersniper", "tier": "Alpha" }
    },
    {
      "priorityIndex": 2,
      "identifier": "21120120140042",
      "alias": "Mhs_FastTrack",
      "bidValue": 480000,
      "status": "VERIFIED",
      "delayOffsetMs": 15
    }
  ],
  "timestamp": "2026-10-20T23:30:00.000Z"
}
```

---

## 🚀 Menjalankan Secara Lokal

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Jalankan server development**:
   ```bash
   pnpm dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

3. **Login ke Admin Panel**:
   - URL: [http://localhost:3000/admin](http://localhost:3000/admin)
   - Default Master Secret: `rankhub2026`

---

## 🌐 Deploy ke Vercel

1. Push repository ini ke GitHub / GitLab.
2. Impor project ke **Vercel**.
3. Di bagian **Environment Variables**, tambahkan:
   - `ADMIN_SECRET`: Kata sandi rahasia admin pilihan Anda (misal: `MySuperSecretPin123`).
4. Klik **Deploy**! Aplikasi langsung aktif tanpa perlu konfigurasi database eksternal terlebih dahulu.
