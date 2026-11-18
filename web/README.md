# GrowtexStore — Frontend

Storefront dan dashboard admin untuk **GrowtexVibe**, dibangun dengan **Vue 3**, **Vite**, **TypeScript**, **Tailwind CSS v4**, dan **Flowbite / Flowbite Vue**.

Tampilan mengacu pada nuansa editorial Cititex, namun dibuat lebih minimalis: palet krem–hitam, aksen hijau tua, tipografi Plus Jakarta Sans, dan layout mobile-first yang melebar ke desktop.

## Requirements

- [Bun](https://bun.sh/) v1.2+

## Setup

```bash
cd web
bun install
```

Salin environment file (opsional):

```bash
cp .env.example .env
```

| Variable            | Default                 | Deskripsi                                                       |
| ------------------- | ----------------------- | --------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:3000` | Base URL backend ElysiaJS. Kosongkan untuk memakai proxy Vite.   |

Jalankan dev server:

```bash
bun run dev
```

Aplikasi tersedia di `http://localhost:5173`. Saat `VITE_API_BASE_URL` kosong, seluruh request `/api/*` diproxy ke `http://localhost:3000`.

## Scripts

| Script            | Deskripsi                              |
| ----------------- | -------------------------------------- |
| `bun run dev`     | Dev server dengan HMR                  |
| `bun run build`   | Type-check (`vue-tsc`) + build produksi |
| `bun run preview` | Preview hasil build                    |

## Mode Demo

Backend saat ini baru menyediakan `/` dan `/health`, sehingga frontend memiliki fallback otomatis:

- Setiap request ke backend dicoba terlebih dahulu (timeout 4 detik).
- Bila endpoint belum ada (`404`), server error (`5xx`), atau tidak dapat dihubungi, aplikasi beralih ke **mode demo** memakai `localStorage`.
- Banner _"Mode demo — data tersimpan lokal di browser Anda"_ muncul di storefront dan dashboard.

Data demo disimpan pada key berikut:

| Key           | Isi                                  |
| ------------- | ------------------------------------ |
| `gv:products` | Katalog produk (mendukung CRUD admin) |
| `gv:orders`   | Pesanan contoh & pesanan baru        |
| `gv:users`    | Akun demo yang terdaftar             |
| `gv:session`  | Sesi login (token + user)            |
| `gv:cart`     | Isi keranjang                        |

Akun demo:

| Role     | Email                    | Password      |
| -------- | ------------------------ | ------------- |
| Admin    | `admin@growtexstore.id`  | `admin123`    |
| Customer | `budi@example.com`       | `customer123` |

Untuk mereset data demo, hapus key `gv:*` di Application → Local Storage browser.

## Rute

| Path                | Halaman                                             |
| ------------------- | --------------------------------------------------- |
| `/`                 | Beranda: hero, keunggulan, katalog, DTF, testimoni  |
| `/products/:id`     | Detail produk + kustom sablon DTF                   |
| `/checkout`         | Form kontak, alamat, pembayaran, ringkasan pesanan  |
| `/invoice/:id`      | Invoice pesanan (siap cetak)                        |
| `/login`, `/register` | Autentikasi customer/admin                        |
| `/admin/orders`     | Dashboard pesanan + update status                   |
| `/admin/products`   | CRUD produk, harga, stok, warna, ukuran             |

Rute `/admin/*` dilindungi guard `requiresAuth` + `requiresAdmin`; pengunjung tanpa sesi admin diarahkan ke halaman masuk.

## Struktur

```text
web/
├── public/favicon.svg
├── src/
│   ├── api.ts                 # Tipe, seed data, client API + fallback demo
│   ├── style.css              # Tailwind v4, token desain, komponen (.btn/.field/.card)
│   ├── App.vue                # Layout store vs admin
│   ├── components/
│   │   ├── Navbar.vue         # Header, pencarian, menu mobile, akun
│   │   ├── Footer.vue         # CTA, newsletter, tautan, sosial
│   │   ├── ProductCard.vue    # Kartu katalog + quick add
│   │   ├── CartDrawer.vue     # Keranjang samping
│   │   ├── DtfCustomizer.vue  # Upload artwork, area & ukuran cetak
│   │   ├── GarmentVisual.vue  # Mock apparel SVG (warna reaktif)
│   │   └── AdminShell.vue     # Sidebar/topbar dashboard
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── ProductDetailView.vue
│   │   ├── CheckoutView.vue
│   │   ├── InvoiceView.vue
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   └── admin/
│   │       ├── AdminOrdersView.vue
│   │       └── AdminProductsView.vue
│   ├── router/index.ts        # Rute, guard, judul dokumen
│   └── stores/
│       ├── auth.ts            # Sesi + persistensi
│       └── cart.ts            # Keranjang, ongkir, gratis ongkir
├── .env.example
├── vite.config.ts             # Alias @, proxy /api → :3000
└── tsconfig.app.json
```

## Integrasi Backend

Kontrak endpoint yang dipanggil client (dapat diimplementasikan bertahap di ElysiaJS):

| Method  | Path                     | Fungsi                     |
| ------- | ------------------------ | -------------------------- |
| `GET`   | `/products`              | Daftar produk              |
| `GET`   | `/products/:id`          | Detail produk              |
| `POST`  | `/products`              | Tambah produk (admin)      |
| `PATCH` | `/products/:id`          | Ubah produk (admin)        |
| `DELETE`| `/products/:id`          | Hapus produk (admin)       |
| `POST`  | `/auth/login`            | Masuk                      |
| `POST`  | `/auth/register`         | Daftar                     |
| `GET`   | `/auth/me`               | Profil sesi aktif          |
| `POST`  | `/orders`                | Buat pesanan               |
| `GET`   | `/orders`                | Daftar pesanan (admin)     |
| `GET`   | `/orders/:id`            | Detail invoice             |
| `PATCH` | `/orders/:id/status`     | Ubah status pesanan (admin)|

Token dikirim sebagai `Authorization: Bearer <token>`. Error `4xx` selain `404` diteruskan apa adanya (mis. validasi login), sedangkan `404`/`5xx`/koneksi gagal memicu mode demo.

## Catatan Desain

- Token warna & utilitas kustom ada di `src/style.css` (`--color-canvas`, `--color-accent`, `.btn`, `.field`, `.chip`, `.card`, dll.).
- Semua halaman diuji tanpa overflow horizontal pada lebar 360 px.
- Bagian sponsor dan testimoni masih berupa placeholder, siap diganti data nyata.
- Invoice mendukung `window.print()` dengan gaya cetak khusus (`@media print`).
- Tema dikunci ke mode terang; varian `dark:` Flowbite dinetralkan agar komponen tidak berubah gelap saat OS memakai dark mode.
