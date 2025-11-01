AmayStream – React + Vite + TMDB

Aplikasi sederhana untuk menampilkan daftar film populer, pencarian film, dan halaman detail film menggunakan TMDB API.

Menjalankan secara lokal

1. Install dependencies:

```bash
npm install
```

2. Buat file `.env` di root dan isi API key TMDB v3 dan Gemini:

```bash
VITE_TMDB_API_KEY=YOUR_TMDB_V3_API_KEY
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

3. Jalankan dev server:

```bash
npm run dev
```

Buka `http://localhost:5173`.

Jika belum punya API key TMDB, daftar di situs TMDB lalu buat API Key v3. Masukkan ke `.env` seperti contoh di atas.

Struktur

- `src/services/tmdb.ts`: Client TMDB
- `src/services/gemini.ts`: Client Gemini AI untuk pencarian film berdasarkan deskripsi
- `src/components/AISearch.tsx`: Komponen AI search dengan efek modern
- `src/pages/Home.tsx`: List dan pencarian film (termasuk AI search)
- `src/pages/MovieDetail.tsx`: Detail film, pemeran, dan film serupa

Fitur

- ✨ **AI Search**: Pencarian film menggunakan Gemini AI berdasarkan deskripsi
- 🎬 Trending movies carousel
- 🔍 Pencarian film tradisional
- 📱 Responsive design

Catatan

- Menggunakan TMDB v3 (api_key pada query string)
- Menggunakan Gemini API untuk AI search (dapatkan API key di [Google AI Studio](https://makersuite.google.com/app/apikey))
- Gambar dari `image.tmdb.org`
