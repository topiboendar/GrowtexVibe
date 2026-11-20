/**
 * Konversi seluruh aset Cititex (jpg/jpeg/png) menjadi WebP.
 *
 * - Menulis file .webp di samping file asli di `CititexAssets/output`.
 * - Menyalin hasil .webp + catalogue.json ke `web/public/products`.
 * - Menghitung warna rata-rata swatch kain untuk keperluan fallback hex.
 *
 * Jalankan: node scripts/convert-to-webp.js
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC_DIR = path.join(ROOT, 'CititexAssets', 'output')
const PUBLIC_DIR = path.join(ROOT, 'web', 'public', 'products')
const QUALITY = 82
const CONCURRENCY = 8

const swatchColors = {}
let originalBytes = 0
let webpBytes = 0
let converted = 0
let skipped = 0
let failed = 0

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(full))
    else if (/\.(jpe?g|png)$/i.test(entry.name) && !/\.webp$/i.test(entry.name)) files.push(full)
  }
  return files
}

async function convert(file) {
  const relative = path.relative(SRC_DIR, file)
  const webp = file.replace(/\.(jpe?g|png)$/i, '.webp')
  const stat = fs.statSync(file)
  originalBytes += stat.size

  if (fs.existsSync(webp) && fs.statSync(webp).size > 0) {
    skipped += 1
    webpBytes += fs.statSync(webp).size
  } else {
    try {
      await sharp(file).rotate().webp({ quality: QUALITY, effort: 4 }).toFile(webp)
      converted += 1
      webpBytes += fs.statSync(webp).size
    } catch (error) {
      failed += 1
      console.error(`Gagal: ${relative} — ${error.message}`)
      return
    }
  }

  // Warna rata-rata untuk swatch kain.
  if (/-swatch\.(jpe?g|png)$/i.test(file)) {
    try {
      const { data } = await sharp(webp)
        .resize(1, 1, { fit: 'cover' })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
      const hex = `#${[data[0], data[1], data[2]]
        .map((channel) => channel.toString(16).padStart(2, '0'))
        .join('')}`
      swatchColors[relative.replace(/\.(jpe?g|png)$/i, '.webp').replaceAll('\\', '/')] = hex
    } catch {
      /* abaikan swatch yang gagal dibaca */
    }
  }
}

async function mapLimit(items, limit, worker) {
  let index = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index++]
      await worker(current)
    }
  })
  await Promise.all(runners)
}

function copyTree(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const from = path.join(dir, entry.name)
    const to = path.join(PUBLIC_DIR, path.relative(SRC_DIR, from))
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true })
      copyTree(from)
    } else if (/\.webp$/i.test(entry.name) || entry.name === 'catalogue.json') {
      fs.mkdirSync(path.dirname(to), { recursive: true })
      fs.copyFileSync(from, to)
    }
  }
}

const files = walk(SRC_DIR)
console.log(`Ditemukan ${files.length} gambar untuk dikonversi…`)

await mapLimit(files, CONCURRENCY, convert)

// Perbarui catalogue.json ke ekstensi .webp.
const cataloguePath = path.join(SRC_DIR, 'catalogue.json')
const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'))

function rewritePath(entry) {
  if (!entry) return
  if (entry.localPath) entry.localPath = entry.localPath.replace(/\.(jpe?g|png)$/i, '.webp')
}

for (const category of catalogue.categories) {
  for (const product of category.products) {
    for (const color of product.colors) {
      for (const file of color.files) rewritePath(file)
    }
    rewritePath(product.sizeGuide)
  }
}

catalogue.convertedToWebp = {
  convertedAt: new Date().toISOString(),
  quality: QUALITY,
  files: files.length,
  originalBytes,
  webpBytes,
}

fs.writeFileSync(cataloguePath, `${JSON.stringify(catalogue, null, 2)}\n`)

fs.mkdirSync(PUBLIC_DIR, { recursive: true })
copyTree(SRC_DIR)

fs.writeFileSync(
  path.join(PUBLIC_DIR, 'swatch-colors.json'),
  `${JSON.stringify(swatchColors, null, 2)}\n`,
)

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`
console.log(`Selesai: ${converted} dikonversi, ${skipped} dilewati, ${failed} gagal.`)
console.log(`Ukuran: ${mb(originalBytes)} → ${mb(webpBytes)} (${Math.round((1 - webpBytes / originalBytes) * 100)}% lebih kecil)`)
console.log(`Swatch warna terdeteksi: ${Object.keys(swatchColors).length}`)
console.log(`Aset publik: ${PUBLIC_DIR}`)
