# [Issue] Migrasi Aset Visual: Konversi WebP & Penggantian Model Vektor SVG dengan Foto Katalog Cititex (Baju, Outfit Model & Color Swatch)

> **Catatan untuk Pelaksana (Junior Developer / Model AI):**  
> Dokumen ini dirancang sebagai panduan kerja langkah-demi-langkah (*step-by-step implementation guide*). Harap ikuti urutan fase yang sudah disusun, perhatikan catatan teknis, dan verifikasi setiap langkah menggunakan checklist *Definition of Done* di bagian akhir.

---

## 1. Ringkasan & Tujuan

Saat ini storefront dan dashboard admin GrowtexVibe menampilkan visual pakaian menggunakan ilustrasi vektor SVG statis (`GarmentVisual.vue`) dengan warna *flat hex*. Proyek telah memiliki tangkapan aset lengkap dari Cititex Indonesia di dalam folder `CititexAssets/output/` yang mencakup foto produk riil, foto model outfit (*front full-body*, *half-body*, *back*), swatch tekstur warna asli (*fabric texture*), dan *size guide*.

**Tujuan Issue:**
1. Mengonversi seluruh aset gambar Cititex (`.jpg`, `.jpeg`, `.png`) ke format modern **WebP** guna mempercepat pemuatan halaman (*page load performance*).
2. Mengaudit dan mengidentifikasi gambar yang memiliki latar belakang transparan (*no background*).
3. Menggantikan representasi vektor SVG (`GarmentVisual.vue`) di seluruh antarmuka aplikasi dengan gambar foto asli dari katalog Cititex.
4. Menggantikan *color palette* bulatan warna solid CSS hex dengan gambar swatch kain asli (`-swatch.webp`).
5. Menyesuaikan tampilan galeri dengan varian tampilan outfit (tampak depan produk, model *half-body*, model *full-body*, tampak belakang, dan panduan ukuran).
6. Menyesuaikan *overlay customizer* sablon DTF agar presisi di atas foto produk/outfit riil.

---

## 2. Informasi Penting Hasil Audit Aset (`CititexAssets/output`)

Berdasarkan investigasi terhadap `CititexAssets/output/catalogue.json` dan 1.784 file gambar yang ada:

### Ringkasan Aset
- **Total Kategori:** 5 kategori (`t-shirts`, `jacket-and-hoodies`, `polo-t-shirt`, `sport-t-shirts`, `headwear`).
- **Total Produk:** 29 produk unik Cititex / New States Apparel.
- **Total Varian Warna:** 353 varian warna.
- **Total File Gambar:** 1.784 file (ukuran total ~119.4 MB).
- **Jenis Tampilan per Warna:**
  - `front_side` (foto produk depan): 353 file (contoh: `black.jpg`)
  - `front_half_body` (foto model setengah badan): 353 file (contoh: `black-half-body.jpg`)
  - `front_full_body` (foto model seluruh badan): 353 file (contoh: `black-full-body.jpg`)
  - `back_full_body` (foto model/tampak belakang): 353 file (contoh: `black-back.jpg`)
  - `color` (swatch tekstur kain warna): 353 file (contoh: `black-swatch.jpg`)
  - `size_guide` (tabel ukuran produk): 19 file

### ⚠️ Informasi Status Transparansi Gambar (*No Background Report*)
> **HASIL TEMUAN AUDIT:**  
> - Dari 1.784 file, terdapat 290 file yang secara format biner adalah PNG (walau berekstensi `.jpg`).
> - **Tidak ada gambar dengan latar transparan bawaan (*zero transparent background*)**. Seluruh foto produk dan model memiliki latar belakang studio padat (*solid studio background*) bernuansa abu-abu/putih netral studio (`#d9d9d9` hingga `#f2f2f2`).
> - **Rekomendasi Implementasi:**
>   - Gunakan latar kontainer gambar bernuansa netral (`bg-[#f4f4f4]` atau `bg-surface`) agar menyatu mulus dengan latar studio foto Cititex.
>   - Untuk pratinjau sablon DTF (`DtfCustomizer.vue`), terapkan `mix-blend-mode: multiply` pada layer artwork desain sehingga sablon menyatu natural dengan serat pakaian foto asli tanpa terhalang latar.

---

## 3. Rencana Kerja Bertahap (Fase Pelaksanaan)

```
[Fase 1: Batch Convert WebP]
       │
       ▼
[Fase 2: Integrasi Aset ke Frontend (Public Directory)]
       │
       ▼
[Fase 3: Pemetaan Kategori & Katalog Data (api.ts)]
       │
       ▼
[Fase 4: Refactor Komponen Visual (GarmentVisual -> ProductVisual)]
       │
       ▼
[Fase 5: Penyesuaian Galeri Outfit & DTF Customizer]
       │
       ▼
[Fase 6: Penggantian Color Swatch Tekstur Kain]
       │
       ▼
[Fase 7: Verifikasi & Testing (Typecheck & Build)]
```

---

## 4. Rincian Teknis per Fase

### Fase 1: Batch Convert Gambar ke WebP

Konversi semua file gambar di `CititexAssets/output` yang berformat `.jpg`, `.jpeg`, dan `.png` menjadi format `.webp`.

1. **Buat Script Konverter:**
   Buat file script otomasi di root project atau dalam folder scripts, misalnya `scripts/convert-to-webp.js`:
   - Gunakan pustaka image processing seperti `sharp` (dapat diinstall via `bun add -d sharp` atau `npm.cmd install sharp`).
   - Kualitas WebP disarankan: `quality: 85` (kompresi optimal tanpa degradasi visual signifikan).
   - Simpan file output dengan ekstensi `.webp` di samping file asli atau langsung menggantikan referensinya.
   - Perbarui file `CititexAssets/output/catalogue.json` agar `localPath` menunjuk ke ekstensi `.webp`.

   *Contoh implementasi script konversi:*
   ```javascript
   import fs from 'node:fs';
   import path from 'node:path';
   import sharp from 'sharp';

   const ROOT_DIR = path.resolve('CititexAssets/output');

   async function processDirectory(dir) {
     const entries = fs.readdirSync(dir, { withFileTypes: true });
     for (const entry of entries) {
       const fullPath = path.join(dir, entry.name);
       if (entry.isDirectory()) {
         await processDirectory(fullPath);
       } else if (/\.(jpg|jpeg|png)$/i.test(entry.name) && !entry.name.endsWith('.webp')) {
         const webpPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
         await sharp(fullPath)
           .webp({ quality: 85, effort: 4 })
           .toFile(webpPath);
         console.log(`Converted: ${entry.name} -> ${path.basename(webpPath)}`);
       }
     }
   }
   ```

2. **Perbarui `catalogue.json`:**
   Pastikan seluruh properti `localPath` dalam `CititexAssets/output/catalogue.json` yang sebelumnya berakhiran `.jpg` diperbarui menjadi `.webp`.

---

### Fase 2: Integrasi Aset ke Aplikasi Frontend (`web/public`)

Agar gambar dapat diakses secara statis oleh browser pada Vite dev server dan build produksi:
1. Pindahkan atau buat *symlink/copy* folder aset gambar yang sudah menjadi WebP ke dalam direktori publik frontend:
   - Target lokasi: `web/public/products/`
   - Struktur yang dihasilkan:
     ```text
     web/public/products/
     ├── catalogue.json
     ├── t-shirts/
     │   └── new-states-apparel-premium-cotton-t-shirt-7200-99/
     │       ├── black.webp
     │       ├── black-swatch.webp
     │       ├── black-half-body.webp
     │       ├── black-full-body.webp
     │       ├── black-back.webp
     │       └── size-guide.webp
     ├── jacket-and-hoodies/
     ├── polo-t-shirt/
     ├── sport-t-shirts/
     └── headwear/
     ```
2. Pastikan rute publik Vite dapat memuat gambar melalui URL absolut seperti:  
   `/products/t-shirts/new-states-apparel-premium-cotton-t-shirt-7200-99/black.webp`

---

### Fase 3: Pemetaan Model Kategori & Pembaruan Tipe Data (`web/src/api.ts`)

Katalog saat ini mendefinisikan kategori: `kaos`, `polo`, `hoodie`, `oversized`, `totebag`.  
Kategori aset Cititex meliputi: `t-shirts`, `jacket-and-hoodies`, `polo-t-shirt`, `sport-t-shirts`, `headwear`.

1. **Perbarui / Tambah Tipe Data `ProductColor` & `ProductImageSet` di `web/src/api.ts`:**
   ```typescript
   export interface ProductColorImages {
     front: string        // URL ke black.webp
     halfBody?: string    // URL ke black-half-body.webp
     fullBody?: string    // URL ke black-full-body.webp
     back?: string        // URL ke black-back.webp
     swatch: string       // URL ke black-swatch.webp
   }

   export interface ProductColor {
     name: string
     hex: string          // Tetap simpan hex sebagai fallback aksesibilitas / border
     swatchImage?: string // URL swatch tekstur kain asli
     images: ProductColorImages
   }

   export interface Product {
     id: string
     name: string
     category: CategoryId
     price: number
     compareAtPrice?: number
     description: string
     material: string
     weight: string
     care: string
     colors: ProductColor[]
     sizes: string[]
     stock: number
     rating: number
     reviews: number
     popular: boolean
     isNew: boolean
     sizeGuideUrl?: string // URL ke size-guide.webp
   }
   ```

2. **Perbarui Pemetaan Kategori:**
   Sesuaikan `CATEGORIES` agar mencerminkan lini pakaian riil:
   - `t-shirts` (Kaos Reguler / Premium Cotton)
   - `polo` (Polo Shirt)
   - `hoodie` (Jacket & Hoodies)
   - `sport-t-shirts` (Dri-Fit Activewear)
   - `headwear` (Topi Snapback & Trucker)

3. **Perbarui `SEED_PRODUCTS` di `web/src/api.ts`:**
   Ganti data seed produk dummy dengan produk asli dari Cititex (`New States Apparel Premium Cotton 7200`, `NSA Super Blend Hoodie 9500`, `NSA Easy Care Polo 8165`, dll.) lengkap dengan varian warna dan path gambarnya.

---

### Fase 4: Refactor Komponen Vektor SVG Menjadi Gambar Foto Asli

File yang saat ini me-render vektor SVG baju adalah `web/src/components/GarmentVisual.vue`.

1. **Ubah atau Buat Komponen Baru (`ProductVisual.vue` atau adaptasi `GarmentVisual.vue`):**
   - Terima props:
     - `src?: string` (URL gambar aktif)
     - `alt?: string`
     - `viewMode?: 'front' | 'half-body' | 'full-body' | 'back'`
     - `fallbackColor?: string`
   - Render tag `<img>` berformat WebP dengan `object-contain` atau `object-cover`.
   - Berikan *fallback visual* yang anggun jika gambar belum dimuat / gagal dimuat.
   - Pertahankan rasio aspek kartu (`aspect-[4/5]`) agar layout tidak bergeser (*zero layout shift*).

2. **Daftar File yang Perlu Diupdate (Menggantikan `GarmentVisual`):**
   - `web/src/components/ProductCard.vue`
   - `web/src/views/HomeView.vue` (Hero section, kategori, custom DTF teaser)
   - `web/src/views/ProductDetailView.vue` (Galeri utama, thumbnail warna)
   - `web/src/components/CartDrawer.vue` (Thumbnail item keranjang)
   - `web/src/views/CheckoutView.vue` (Ringkasan pesanan)
   - `web/src/views/InvoiceView.vue` (Detail item invoice)
   - `web/src/views/LoginView.vue` & `RegisterView.vue` (Ilustrasi dekoratif samping)
   - `web/src/views/admin/AdminProductsView.vue` (Tabel & thumbnail admin)
   - `web/src/views/admin/AdminOrdersView.vue` (Daftar pesanan admin)

---

### Fase 5: Halaman Detail Produk & Tampilan Model Outfit (`ProductDetailView.vue`)

1. **Galeri Multi-View Model Outfit:**
   Pada halaman detail produk (`web/src/views/ProductDetailView.vue`):
   - Sediakan tombol tab atau thumbnail untuk memilih sudut pandang outfit:
     1. **Produk Saja (Front Flat):** Gambar depan baju (`front_side`).
     2. **Model Half-Body:** Foto model setengah badan memakai baju terkait (`front_half_body`).
     3. **Model Full-Body:** Foto model tampak utuh beserta celana/outfit lengkap (`front_full_body`).
     4. **Tampak Belakang:** Foto model tampak belakang (`back_full_body`).
   - Ketika pengguna mengganti warna, seluruh sudut pandang model otomatis sinkron dengan warna yang dipilih.

2. **Panduan Ukuran Modal / Popover:**
   - Tombol *"Panduan ukuran"* di `ProductDetailView.vue` harus membuka modal yang menampilkan gambar `sizeGuideUrl` (misal `size-guide.webp`) dari produk terkait.

---

### Fase 6: Penggantian Color Swatch Tekstur Kain Asli

1. **Pada `ProductDetailView.vue`:**
   Ganti tombol pemilihan warna yang sebelumnya menggunakan bulatan `background-color: color.hex` menjadi bulatan atau kotak bersudut tumpul yang menggunakan gambar tekstur kain asli:
   ```html
   <button
     v-for="color in product.colors"
     :key="color.name"
     type="button"
     class="size-11 overflow-hidden rounded-full border transition-transform hover:scale-105"
     :class="selectedColor === color.name ? 'border-ink ring-2 ring-ink ring-offset-2' : 'border-line'"
     :title="color.name"
     @click="selectColor(color)"
   >
     <img :src="color.swatchImage" :alt="color.name" class="size-full object-cover" />
   </button>
   ```

2. **Pada `HomeView.vue` (Bagian *Shop By Color*):**
   Ganti palet warna di beranda agar memanfaatkan tekstur swatch kain asli dari Cititex, sehingga calon pembeli melihat tekstur bahan kain yang realistis.

3. **Pada `ProductCard.vue`:**
   Mini-swatch di bawah kartu produk juga menggunakan `color.swatchImage` sebagai thumbnail mini (dengan fallback hex).

---

### Fase 7: Penyesuaian Customizer Sablon DTF (`DtfCustomizer.vue`)

1. **Sinkronisasi Gambar Baju pada Pratinjau Sablon:**
   - Pratinjau DTF di `DtfCustomizer.vue` harus menampilkan gambar pakaian asli sesuai warna yang dipilih pengguna.
   - Posisi sablon:
     - Jika posisi = `'belakang'`, otomatis ganti gambar dasar pakaian ke `back_full_body` (`-back.webp`).
     - Jika posisi = `'depan'` atau `'dada-kiri'`, gunakan gambar `front_side` atau `front_half_body`.
2. **Efek Sablon Realistis:**
   - Gunakan `mix-blend-mode: multiply` dan sedikit `drop-shadow` pada elemen artwork sablon agar tekstur lipatan baju pada foto tetap terlihat samar menembus tinta sablon.

---

## 5. Checklist Validasi & Acceptance Criteria (Definition of Done)

Sebelum menyatakan tugas selesai, pelaksana wajib memastikan semua kriteria berikut terpenuhi:

- [ ] **Konversi WebP Selesai:**
  - Semua file `.jpg`, `.jpeg`, `.png` di aset terkait telah berhasil dikonversi ke format `.webp`.
  - Ukuran file aset berkurang drastis dibanding JPEG/PNG asli tanpa penurunan kualitas yang kasat mata.
- [ ] **Laporan Background Terverifikasi:**
  - Telah dipahami dan diterapkan bahwa foto Cititex memiliki background studio netral, dan komponen UI telah diatur menggunakan warna dasar yang serasi (`bg-surface` / `bg-canvas`).
- [ ] **Pemberian Aset Statis:**
  - Folder gambar WebP dapat diakses melalui browser di direktori publik frontend tanpa broken image (HTTP 404).
- [ ] **Model Vektor SVG Berhasil Diganti:**
  - Tidak ada lagi bentuk pakaian kartun/vektor SVG di `ProductCard`, `ProductDetailView`, `HomeView`, `CartDrawer`, `Checkout`, `Invoice`, maupun dashboard admin.
- [ ] **Galeri Model Outfit Berfungsi Penuh:**
  - Pengguna dapat beralih antara tampak depan produk, model *half-body*, model *full-body*, dan tampak belakang.
  - Mengubah pilihan warna akan langsung memperbarui foto produk dan foto model secara bersamaan.
  - Gambar *Size Guide* muncul dengan benar saat tombol panduan ukuran diklik.
- [ ] **Color Swatch Nyata:**
  - Pemilihan warna menampilkan gambar swatch serat kain asli (`-swatch.webp`), bukan hanya lingkaran warna polos.
- [ ] **DTF Customizer Terintegrasi:**
  - Desain sablon dapat diposisikan di atas foto baju riil dan pratinjau tampak belakang menampilkan foto belakang pakaian.
- [ ] **Code Quality & Build:**
  - Jalankan `bun run build` atau `npm.cmd run build` di direktori `web/` dan pastikan **lulus tanpa error TypeScript (`vue-tsc`) maupun Vite build error**.
