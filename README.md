AmayStream – React + Vite + TMDB

Aplikasi sederhana untuk menampilkan daftar film populer, pencarian film, dan halaman detail film menggunakan TMDB API.

Menjalankan secara lokal

1. Install dependencies:

```bash
npm install
```

2. Buat file `.env` di root dan isi API key TMDB v3:

```bash
VITE_TMDB_API_KEY=YOUR_TMDB_V3_API_KEY
```

3. Jalankan dev server:

```bash
npm run dev
```

Buka `http://localhost:5173`.

Jika belum punya API key TMDB, daftar di situs TMDB lalu buat API Key v3. Masukkan ke `.env` seperti contoh di atas.

Struktur

- `src/services/tmdb.ts`: Client TMDB
- `src/pages/Home.tsx`: List dan pencarian film
- `src/pages/MovieDetail.tsx`: Detail film, pemeran, dan film serupa

Catatan

- Menggunakan TMDB v3 (api_key pada query string)
- Gambar dari `image.tmdb.org`
