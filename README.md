# GrowtexVibe

Backend API starter berbasis **Bun**, **ElysiaJS**, **Drizzle ORM**, dan **MySQL**.

## Tech Stack

- [Bun](https://bun.sh/) — runtime & package manager
- [ElysiaJS](https://elysiajs.com/) — web framework
- [Drizzle ORM](https://orm.drizzle.team/) + [drizzle-kit](https://orm.drizzle.team/docs/kit-overview) — ORM & migrasi
- [MySQL](https://www.mysql.com/) via `mysql2`

## Requirements

- Bun v1.2+
- MySQL 8+

## Setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Salin environment file dan sesuaikan kredensial database:

   ```bash
   cp .env.example .env
   ```

3. Buat database MySQL (sesuai `DB_NAME`):

   ```sql
   CREATE DATABASE growtexvibe;
   ```

4. Jalankan migrasi:

   ```bash
   bun run db:migrate
   ```

5. Jalankan server:

   ```bash
   bun run dev
   ```

Server berjalan di `http://localhost:3000`.

## Scripts

| Script              | Deskripsi                                              |
| ------------------- | ------------------------------------------------------ |
| `bun run dev`       | Menjalankan server dengan watch mode                   |
| `bun run start`     | Menjalankan server tanpa watch mode                    |
| `bun run typecheck` | Type checking                                          |
| `bun run db:generate` | Generate file migrasi dari perubahan schema          |
| `bun run db:migrate`  | Apply migrasi ke database                            |
| `bun run db:push`     | Push schema langsung ke database (tanpa file migrasi) |
| `bun run db:studio`   | Buka Drizzle Studio                                  |

## Struktur Project

```text
.
├── drizzle/                  # File migrasi hasil generate drizzle-kit
├── src/
│   ├── db/
│   │   ├── index.ts          # Koneksi MySQL + instance Drizzle
│   │   └── schema.ts         # Definisi schema tabel
│   ├── modules/
│   │   └── health/
│   │       ├── route.ts      # Route module health check
│   │       └── service.ts    # Logic pengecekan kesehatan
│   ├── env.ts                # Validasi environment variable
│   └── index.ts              # Entry point Elysia server
├── drizzle.config.ts
└── .env.example
```

## Endpoints

| Method | Path      | Deskripsi                                     |
| ------ | --------- | --------------------------------------------- |
| `GET`  | `/`       | Info service                                  |
| `GET`  | `/health` | Status service & koneksi database (`200`/`503`) |

## Menambah Module Baru

1. Definisikan tabel di `src/db/schema.ts`.
2. Jalankan `bun run db:generate` lalu `bun run db:migrate`.
3. Buat folder baru di `src/modules/<nama-module>` berisi `route.ts` dan `service.ts`.
4. Daftarkan route module tersebut pada `src/index.ts`.
