# Supabase Setup untuk Live Chat

## Langkah-langkah Setup

### 1. Dapatkan Supabase Credentials

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda (atau buat project baru)
3. Buka **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 2. Setup Database Tables

1. Buka **SQL Editor** di Supabase Dashboard
2. Copy dan paste seluruh isi file `supabase-migration.sql`
3. Klik **Run** untuk menjalankan migration
4. Verifikasi tables sudah dibuat:
   - `matches`
   - `chat_messages`
   - `match_viewers`

### 3. Chat Real-time Setup

**Catatan:** Chat menggunakan **Broadcast Channel** yang tidak memerlukan Replication/Realtime enabled. Fitur ini tersedia untuk semua user tanpa perlu Early Access.

**Tidak perlu enable Replication di Supabase Dashboard!** Chat akan bekerja secara real-time menggunakan WebSocket broadcast.

### 4. Setup Environment Variables

Buat file `.env` di root project (atau update yang sudah ada):

```bash
# Supabase
VITE_SUPABASE_URL=https://emgkbitylbsozlsgeuig.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Catatan:**

- `VITE_SUPABASE_URL` sudah ada dari kredensial yang diberikan
- `VITE_SUPABASE_ANON_KEY` perlu didapatkan dari Supabase Dashboard (Settings → API → anon public)

### 5. Test Setup

1. Restart dev server: `npm run dev`
2. Buka halaman sports player: `/sports/:source/:id/watch`
3. Live Chat seharusnya muncul di sidebar (desktop) atau bawah (mobile)
4. Register username dan kirim pesan test

## Struktur Database

### `matches`

- `id` (TEXT, PRIMARY KEY): Match ID format `source:id`
- `title` (TEXT): Judul pertandingan
- `created_at`, `updated_at`: Timestamps

### `chat_messages`

- `id` (UUID, PRIMARY KEY): Auto-generated
- `match_id` (TEXT): Foreign key ke `matches.id`
- `username` (TEXT): Username pengirim
- `message` (TEXT): Isi pesan
- `created_at`: Timestamp

### `match_viewers`

- `match_id` (TEXT, PRIMARY KEY): Foreign key ke `matches.id`
- `viewer_count` (INTEGER): Jumlah viewer real-time
- `updated_at`: Timestamp

## Features

✅ **Real-time Chat**: Pesan muncul otomatis tanpa refresh (menggunakan Broadcast Channel - tidak perlu Replication enabled)  
✅ **Online Viewer Count**: Menampilkan jumlah viewer yang sedang online (menggunakan Presence API)  
✅ **Username Persistence**: Username disimpan di localStorage  
✅ **Auto-scroll**: Chat otomatis scroll ke pesan terbaru  
✅ **Responsive**: Mobile-friendly design

**Catatan:**

- Chat menggunakan **Broadcast Channel** yang tersedia untuk semua user (tidak perlu Early Access)
- Viewer count menampilkan **online viewers** (yang sedang membuka halaman), bukan total views

## Troubleshooting

### Chat tidak muncul

- Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sudah di-set
- Check browser console untuk error
- Pastikan SQL migration sudah dijalankan

### Chat tidak real-time (harus refresh)

- Chat menggunakan **Broadcast Channel** yang tidak memerlukan Replication enabled
- Check browser console untuk error subscription
- Pastikan channel berhasil subscribe (lihat log "Chat subscribed to broadcast channel")
- Jika masih tidak bekerja, coba refresh halaman dan check network tab untuk WebSocket connection

### Pesan tidak terkirim

- Check Row Level Security (RLS) policies di Supabase
- Pastikan tabel `chat_messages` memiliki permission untuk `anon` role
- Check browser console untuk error

### Viewer count tidak update atau menampilkan total views

- Viewer count sekarang menggunakan **Presence API** untuk tracking online viewers
- Jika masih menampilkan total views, pastikan menggunakan versi terbaru dari kode
- Check browser console untuk error presence tracking
- Pastikan tidak ada multiple instances yang track viewer (cek dependency array di useEffect)
