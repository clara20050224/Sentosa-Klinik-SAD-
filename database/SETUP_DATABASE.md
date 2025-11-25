# 📋 Panduan Setup Database Klinik Sentosa

## Langkah-langkah Setup Database

### 1. Pastikan PostgreSQL Berjalan

**Windows:**
- Buka Services (Win + R, ketik `services.msc`)
- Cari "postgresql" dan pastikan statusnya "Running"
- Jika tidak running, klik kanan → Start

**Atau dari Command Prompt:**
```bash
# Cek status
pg_ctl status -D "C:\Program Files\PostgreSQL\15\data"
# Start jika belum running
pg_ctl start -D "C:\Program Files\PostgreSQL\15\data"
```

### 2. Buat Database

Buka Command Prompt atau PowerShell, lalu jalankan:

```bash
# Login ke PostgreSQL
psql -U postgres

# Atau jika perlu password:
psql -U postgres -W
```

Kemudian di psql prompt, jalankan:
```sql
CREATE DATABASE klinik_sentosa;
\q
```

**Atau langsung dari command line:**
```bash
psql -U postgres -c "CREATE DATABASE klinik_sentosa;"
```

### 3. Jalankan Schema SQL

Dari folder root project (`d:\klinik-sentosa`), jalankan:

```bash
psql -U postgres -d klinik_sentosa -f database/schema.sql
```

**Atau jika perlu password:**
```bash
psql -U postgres -d klinik_sentosa -W -f database/schema.sql
```

### 4. (Opsional) Jalankan Seeds untuk Data Demo

Untuk menambahkan data demo/test accounts:

```bash
psql -U postgres -d klinik_sentosa -f database/seeds_sql.sql
```

**Atau jika perlu password:**
```bash
psql -U postgres -d klinik_sentosa -W -f database/seeds_sql.sql
```

### 5. Verifikasi Database

Login ke database dan cek tabel:

```bash
psql -U postgres -d klinik_sentosa
```

Di psql prompt:
```sql
-- Lihat semua tabel
\dt

-- Cek data users
SELECT id, name, email, role FROM users;

-- Keluar
\q
```

## 🔐 Test Accounts (setelah menjalankan seeds_sql.sql)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@klinik.com | admin123 |
| Dokter | dokter@klinik.com | dokter123 |
| Resepsionis | resepsionis@klinik.com | resepsionis123 |
| Apoteker | apoteker@klinik.com | apoteker123 |
| Kasir | kasir@klinik.com | kasir123 |
| Pasien 1 | pasien1@klinik.com | pasien123 |
| Pasien 2 | pasien2@klinik.com | pasien123 |
| Pasien 3 | pasien3@klinik.com | pasien123 |

## ⚙️ Konfigurasi Backend .env

Pastikan file `backend/.env` memiliki konfigurasi yang benar:

```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_postgres_password_here
DB_NAME=klinik_sentosa

# JWT Configuration
JWT_SECRET=klinik_sentosa_super_secret_2025
JWT_EXPIRES_IN=7d
```

**Ganti `your_postgres_password_here` dengan password PostgreSQL Anda!**

## 🐛 Troubleshooting

### Error: "database klinik_sentosa does not exist"
**Solusi:** Jalankan langkah 2 untuk membuat database

### Error: "relation does not exist"
**Solusi:** Jalankan langkah 3 untuk menjalankan schema SQL

### Error: "password authentication failed"
**Solusi:** 
- Pastikan password di `.env` sesuai dengan password PostgreSQL
- Atau coba reset password PostgreSQL

### Error: "could not connect to server"
**Solusi:**
- Pastikan PostgreSQL service berjalan (langkah 1)
- Cek apakah port 5432 tidak terblokir firewall

## ✅ Checklist Setup

- [ ] PostgreSQL service berjalan
- [ ] Database `klinik_sentosa` sudah dibuat
- [ ] Schema SQL sudah dijalankan (semua tabel terbuat)
- [ ] Seeds SQL sudah dijalankan (opsional, untuk data demo)
- [ ] File `backend/.env` sudah dikonfigurasi dengan benar
- [ ] Backend server bisa connect ke database (cek console saat start)

## 🚀 Setelah Setup

Setelah semua langkah selesai, restart backend server:

```bash
cd backend
npm run dev
```

Anda seharusnya melihat:
```
✅ Database connected.
✅ Backend running on http://localhost:5000
```

Jika masih ada error, cek console backend untuk detail error yang lebih lengkap.

