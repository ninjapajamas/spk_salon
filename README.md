# SPK dan Reservasi Jharmy Salon

Aplikasi React + Vite untuk katalog perawatan, rekomendasi, dan reservasi Jharmy Salon. Konsultasi serta rekomendasi dapat digunakan tanpa login, sedangkan pelanggan wajib login sebelum membuat reservasi.

## Fitur

- Katalog perawatan salon tersedia dari menu publik **Perawatan**.
- Login pelanggan diperlukan hanya saat membuat reservasi.
- Registrasi akun pelanggan.
- Konsultasi tanpa login tetap tersedia.
- Pengecekan ketersediaan jadwal dan penonaktifan otomatis pada jam yang sudah dipesan.
- Popup reservasi berhasil beserta kode dan QR reservasi.
- Dashboard pelanggan berisi reservasi akan datang, belum/sudah dilakukan, rekomendasi lanjutan, catatan salon, dan pengaturan akun.
- Form konsultasi dengan nama, WhatsApp, jadwal, area perawatan, kondisi, tujuan, riwayat, dan catatan.
- Rekomendasi treatment dari data layanan salon yang aktif.
- Tampilan hasil yang ramah pelanggan tanpa rincian rumus atau tabel perhitungan.
- Dashboard admin untuk memantau konsultasi, follow up, dan treatment populer.
- Admin hanya dapat masuk melalui URL khusus; tidak ada menu Admin pada navigasi publik.
- Pemindai QR admin (kamera atau input kode manual) untuk memvalidasi kedatangan dan otomatis mengubah status menjadi **Sudah melakukan perawatan**.
- Kelola treatment: tambah, edit, nonaktifkan, dan hapus layanan.
- Kelola atribut: tambah, edit, dan hapus atribut rekomendasi.
- Kelola data pelanggan, status reservasi, dan catatan salon.

## URL Aplikasi

```text
Beranda:     http://localhost:5173/
Perawatan:   http://localhost:5173/treatments
Login admin: http://localhost:5173/login?role=admin
Scan QR:     http://localhost:5173/admin/scan
```

Halaman admin dilindungi autentikasi. Jika URL admin dibuka tanpa sesi admin, aplikasi akan mengarahkan pengguna ke login admin.

## Akun Demo Lokal

Admin:

```text
Email: admin@jharmysalon.local
Password: admin123
```

Pelanggan:

```text
Email: siti@example.com
Password: pelanggan123
```

## Menjalankan Project

```bash
npm install
```

Jalankan schema database terlebih dahulu:

```bash
$env:PGPASSWORD='123'
psql -h localhost -U postgres -d salon -f database/salon_schema.sql
```

Jalankan backend API:

```bash
npm run server
```

Jalankan React/Vite di terminal lain:

```bash
npm run dev
```

Vite akan meneruskan request `/api` ke backend `http://127.0.0.1:3001`.

Build produksi:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Database PostgreSQL

Schema database ada di:

```text
database/salon_schema.sql
```

Database lokal yang digunakan:

```text
Database: salon
User: postgres
Password: 123
Host: localhost
```

Menjalankan schema:

```bash
$env:PGPASSWORD='123'
psql -h localhost -U postgres -d salon -f database/salon_schema.sql
```

Schema mencakup tabel `users`, `consultation_profiles`, `treatments`, `attributes`, `treatment_attributes`, `recommendations`, dan `recommendation_details`.

Backend Express ada di folder `server/` dan menggunakan koneksi PostgreSQL dari environment variable. Nilai defaultnya sudah disesuaikan untuk database lokal `salon`.

Endpoint utama:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/treatments`
- `POST /api/treatments`
- `GET /api/attributes`
- `POST /api/attributes`
- `GET /api/consultations`
- `POST /api/consultations`
- `GET /api/availability?date=YYYY-MM-DD`
- `POST /api/reservations`
- `POST /api/reservations/scan`
- `PUT /api/consultations/:id/salon-note`
- `PUT /api/users/:id`

Catatan: sesi login tetap disimpan di `localStorage` browser agar pengguna tidak langsung logout saat refresh. Data utama seperti user, treatment, atribut, konsultasi, rekomendasi, dan detail rekomendasi tersimpan di PostgreSQL melalui API.
