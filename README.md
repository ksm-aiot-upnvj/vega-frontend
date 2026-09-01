# VEGA LMS - Frontend 🚀

VEGA (Virtual Education & Growth Academy) adalah platform *Learning Management System* (LMS) internal untuk KSM IoT & AI. Repository ini memuat aplikasi antarmuka pengguna (Frontend) yang dibangun agar peserta dapat belajar dengan materi terstruktur dan mentor dapat mengelola kelas.

## 🛠 Teknologi Utama

Frontend ini dibangun menggunakan framework dan tools modern:
- **[Next.js](https://nextjs.org/) (App Router)**: Framework React untuk rendering (SSR/CSR) dan routing.
- **[React](https://react.dev/)**: Library utama untuk membangun antarmuka pengguna (UI).
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework untuk *styling* secara cepat dan terstandarisasi.
- **[TypeScript](https://www.typescriptlang.org/)**: Untuk *type safety* dan kemudahan dalam penulisan kode terstruktur.
- **[Lucide React](https://lucide.dev/)**: Kumpulan ikon yang minimalis dan elegan.

## 📦 Panduan Instalasi & Menjalankan Aplikasi

Pastikan kamu sudah meng-install [Node.js](https://nodejs.org/) dan direkomendasikan menggunakan `pnpm` sebagai package manager.

1. **Copy file Environment (Konfigurasi URL Backend)**
   ```bash
   cp .env.example .env
   ```
   > Pastikan isi file `.env` sudah mengarah ke backend yang tepat, misalnya `NEXT_PUBLIC_API_URL=http://localhost:8000`.

2. **Install Semua Dependencies**
   ```bash
   pnpm install
   ```

3. **Jalankan Server Development**
   ```bash
   pnpm run dev
   ```

4. **Buka Aplikasi di Browser**
   Buka [http://localhost:3000](http://localhost:3000) di browser favorit kamu. Halaman akan otomatis melakukan *hot-reload* ketika kamu menyimpan perubahan di text editor.

## 📂 Struktur Direktori

Berikut penjelasan singkat mengenai folder-folder penting yang ada di dalam repository ini:

- `app/` - Semua halaman routing Next.js terbaru (App Router) ada di sini.
  - `admin/` - Halaman khusus untuk peran Admin (manajemen *user* dan *course* global).
  - `dashboard/` - Halaman utama (*dashboard*) setelah login.
  - `courses/` - Halaman bagi murid (*member*) untuk melihat modul belajar dan kuis.
  - `mentor/` - Halaman khusus untuk peran Mentor dalam mengelola course miliknya.
- `components/` - Seluruh komponen UI yang *reusable* (tombol, input, layout tabel, form, modal).
- `lib/` - Logic atau fungsi umum (seperti `api.ts` untuk memanggil API backend, dan utilitas styling).
- `types/` - Definisi interface/type dari TypeScript untuk objek-objek (misalnya *User*, *Course*, *Quiz*).

## 🚀 Build & Deploy (Production)

Untuk mem-build proyek secara lokal dan menjalankannya selayaknya di production:

```bash
pnpm run build
pnpm run start
```

Platform yang disarankan untuk *deployment* aplikasi ini adalah [Vercel](https://vercel.com) yang bisa terkoneksi langsung dengan GitHub repository secara otomatis.

Selamat berkontribusi untuk pengembangan frontend VEGA LMS! ✨
