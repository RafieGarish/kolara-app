# Kolara.app

Kolara adalah prototipe dashboard kolaborasi tim untuk melihat progres kerja dalam satu tempat. Aplikasi menyediakan ringkasan aktivitas, pengelolaan tugas dan proyek, kalender, direktori tim, chat demo, serta laporan yang dapat diekspor ke CSV.

## Fitur dan halaman

| Route | Halaman | Isi utama |
| --- | --- | --- |
| `/` | Overview | Ringkasan progres, tugas, proyek, dan agenda mendatang. |
| `/tasks` | My tasks | Daftar tugas pribadi dengan pengelompokan dan tampilan list atau board. |
| `/board` | Kanban Board | Papan tugas berbasis status. |
| `/projects` | Projects | Daftar, progres, dan detail proyek. |
| `/team` | Team | Anggota tim, undangan, serta panel chat demo. |
| `/calendar` | Calendar | Kalender rapat, milestone, deadline, dan tugas. |
| `/reports` | Reports | Ringkasan performa dan insight proyek, dengan ekspor CSV. |

Antarmuka juga memiliki sidebar responsif, notifikasi, dialog, serta animasi transisi. Sebagian tautan seperti Settings dan Help masih berupa placeholder demo.

## Teknologi

- Next.js 16 App Router dan React 19
- TypeScript
- Tailwind CSS 4 dengan stylesheet khusus Kolara
- Zustand untuk state sisi klien
- Radix UI dan komponen UI lokal di `components/ui`
- Framer Motion dan Lucide React

## Menjalankan secara lokal

Persyaratan: Node.js 20.9 atau lebih baru dan npm.

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) setelah server pengembangan berjalan.

## Perintah yang tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan Next.js. |
| `npm run build` | Membuat build produksi. |
| `npm run start` | Menjalankan build produksi yang sudah dibuat. |
| `npm run lint` | Memeriksa source menggunakan ESLint. |

Untuk menjalankan versi produksi:

```bash
npm run build
npm run start
```

## Struktur proyek

```text
app/                  Route dan root layout App Router
components/           Komponen halaman, layout, chat, dan UI
lib/data/             Data contoh dan konfigurasi laporan/chat
lib/stores/           State aplikasi berbasis Zustand
lib/types.ts          Tipe data TypeScript
public/               Aset statis
```

Route didefinisikan melalui `page.tsx` di dalam direktori `app`. Shell aplikasi bersama, provider tema, dan metadata diletakkan di `app/layout.tsx`.

## Catatan data

Proyek ini saat ini berfungsi sebagai prototipe frontend. Data awal disediakan secara lokal di `lib/data` dan `lib/stores`, lalu perubahan disimpan di state aplikasi selama sesi berjalan. Belum ada backend, database, autentikasi, atau penyimpanan persisten lintas sesi. Chat menggunakan balasan simulasi; ekspor laporan membuat file CSV langsung di browser.
