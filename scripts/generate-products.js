/**
 * Menghasilkan `web/src/data/products.json` dari katalog Cititex hasil scraping.
 *
 * Jalankan setelah `scripts/convert-to-webp.js`:
 *   node scripts/generate-products.js
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const CATALOGUE = path.join(ROOT, 'web', 'public', 'products', 'catalogue.json')
const SWATCHES = path.join(ROOT, 'web', 'public', 'products', 'swatch-colors.json')
const OUTPUT = path.join(ROOT, 'web', 'src', 'data', 'products.json')

const APPAREL_SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const YOUTH_SIZES = ['XS', 'S', 'M', 'L']
const HEADWEAR_SIZES = ['All Size']

const CARE_APPAREL = 'Cuci mesin suhu dingin, balik sebelum disetrika, jangan pakai pemutih.'
const CARE_FLEECE = 'Cuci dengan suhu maksimal 30°C, hindari pengeringan suhu tinggi.'
const CARE_JACKET = 'Cuci tangan atau putaran lembut, jangan diperas, keringkan dengan diangin-anginkan.'
const CARE_HEADWEAR = 'Bersihkan dengan kain lembap, jangan direndam, keringkan di tempat teduh.'

const META = {
  'new-states-apparel-premium-cotton-t-shirt-7200-99': {
    price: 89000,
    compareAtPrice: 109000,
    material: '100% Cotton Combed 30s',
    weight: '150 gsm',
    sizes: APPAREL_SIZES,
    stock: 240,
    rating: 4.9,
    reviews: 1284,
    popular: true,
    description:
      'Kaos premium cotton combed dengan permukaan halus dan jahitan rapi. Nyaman dipakai harian, jatuh sempurna, dan siap disablon DTF.',
  },
  'new-states-apparel-softstyle-3600-87': {
    price: 79000,
    compareAtPrice: 95000,
    material: '100% Cotton Softstyle',
    weight: '145 gsm',
    sizes: APPAREL_SIZES,
    stock: 320,
    rating: 4.9,
    reviews: 1102,
    popular: true,
    description:
      'Kaos softstyle dengan serat lembut dan ringan. Pilihan favorit untuk merchandise komunitas dan seragam event.',
  },
  'new-states-apparel-heavyweight-t-shirt-5400-95': {
    price: 119000,
    material: 'Cotton Combed 24s Heavy',
    weight: '210 gsm',
    sizes: APPAREL_SIZES,
    stock: 140,
    rating: 4.8,
    reviews: 486,
    description:
      'Kaos heavyweight dengan body tebal dan kokoh. Tidak transparan dan membentuk silhouette boxy yang modern.',
  },
  'new-states-apparel-premium-cotton-ringer-7250-97': {
    price: 99000,
    material: '100% Cotton Combed 30s',
    weight: '150 gsm',
    sizes: APPAREL_SIZES,
    stock: 160,
    rating: 4.7,
    reviews: 214,
    isNew: true,
    description:
      'Kaos ringer dengan aksen leher dan lengan kontras. Gaya retro yang bersih untuk keseharian.',
  },
  'new-states-apparel-premium-cotton-youth-t-shirt-72y00-129': {
    price: 75000,
    material: '100% Cotton Combed 30s',
    weight: '150 gsm',
    sizes: YOUTH_SIZES,
    stock: 180,
    rating: 4.8,
    reviews: 176,
    description:
      'Kaos premium cotton untuk anak dengan bahan lembut dan nyaman. Tersedia banyak warna untuk seragam keluarga.',
  },
  'new-states-apparel-premium-cotton-raglan-34-7260-98': {
    price: 105000,
    material: 'Cotton Combed 30s + Poly',
    weight: '160 gsm',
    sizes: APPAREL_SIZES,
    stock: 120,
    rating: 4.7,
    reviews: 158,
    isNew: true,
    description:
      'Kaos raglan lengan 3/4 dengan kombinasi dua warna yang sporty. Nyaman untuk aktivitas harian dan komunitas.',
  },
  'new-states-apparel-premium-cotton-long-sleeve-7280-94': {
    price: 115000,
    material: '100% Cotton Combed 30s',
    weight: '160 gsm',
    sizes: APPAREL_SIZES,
    stock: 150,
    rating: 4.8,
    reviews: 342,
    description:
      'Kaos lengan panjang premium cotton dengan jahitan rapi. Pas untuk layering maupun dipakai tunggal.',
  },
  'new-states-apparel-heavy-weight-long-sleeve-5480-124': {
    price: 135000,
    material: 'Cotton Combed 24s Heavy',
    weight: '210 gsm',
    sizes: APPAREL_SIZES,
    stock: 90,
    rating: 4.8,
    reviews: 121,
    isNew: true,
    description:
      'Lengan panjang heavyweight dengan ketebalan ekstra. Hangat, kokoh, dan tetap nyaman sepanjang hari.',
  },
  'new-states-apparel-super-blend-hooded-sweatshirt-9500-103': {
    price: 249000,
    compareAtPrice: 289000,
    material: 'Cotton Super Blend Fleece',
    weight: '280 gsm',
    sizes: APPAREL_SIZES,
    stock: 84,
    rating: 4.9,
    reviews: 624,
    popular: true,
    care: CARE_FLEECE,
    description:
      'Hoodie super blend dengan tudung dua lapis dan kantong kanguru. Tebal, hangat, dan mempertahankan bentuk.',
  },
  'new-states-apparel-super-blend-crewneck-sweatshirt-9000-118': {
    price: 209000,
    compareAtPrice: 239000,
    material: 'Cotton Super Blend Fleece',
    weight: '260 gsm',
    sizes: APPAREL_SIZES,
    stock: 96,
    rating: 4.9,
    reviews: 512,
    popular: true,
    care: CARE_FLEECE,
    description:
      'Crewneck super blend tanpa tudung yang minimalis. Rib leher kokoh, sempurna untuk layering.',
  },
  'new-states-apparel-super-blend-full-zip-hooded-sweatshirt-9600-102': {
    price: 289000,
    material: 'Cotton Super Blend Fleece',
    weight: '280 gsm',
    sizes: APPAREL_SIZES,
    stock: 52,
    rating: 4.8,
    reviews: 187,
    care: CARE_FLEECE,
    description:
      'Hoodie full zip dengan ritsleting depan dan tudung dua lapis. Praktis untuk cuaca dingin dan gaya kasual.',
  },
  'new-states-apparel-windbreaker-9810-122': {
    price: 269000,
    material: 'Polyester Taslan',
    weight: '210 gsm',
    sizes: APPAREL_SIZES,
    stock: 44,
    rating: 4.7,
    reviews: 96,
    care: CARE_JACKET,
    description:
      'Jaket windbreaker ringan dengan lapisan penahan angin. Cocok untuk aktivitas luar ruang.',
  },
  'new-states-apparel-coaches-jacket-9820-123': {
    price: 259000,
    material: 'Cotton Twill',
    weight: '240 gsm',
    sizes: APPAREL_SIZES,
    stock: 38,
    rating: 4.7,
    reviews: 74,
    care: CARE_JACKET,
    description:
      'Jaket coaches dengan kerah klasik dan kancing snap. Gaya sporty yang rapi untuk sehari-hari.',
  },
  'new-states-apparel-bomber-jacket-9830-127': {
    price: 299000,
    material: 'Polyester Bomber',
    weight: '250 gsm',
    sizes: APPAREL_SIZES,
    stock: 30,
    rating: 4.8,
    reviews: 63,
    isNew: true,
    care: CARE_JACKET,
    description:
      'Bomber jacket dengan siluet modern dan bahan nyaman. Statement piece yang mudah dipadukan.',
  },
  'new-states-apparel-easy-care-polo-shirt-8165-139': {
    price: 149000,
    material: 'Cotton Pique Easy Care',
    weight: '200 gsm',
    sizes: APPAREL_SIZES,
    stock: 130,
    rating: 4.8,
    reviews: 289,
    description:
      'Polo easy care dengan kerah rapi dan bahan mudah dirawat. Presentasi profesional tanpa terlihat kaku.',
  },
  'new-states-apparel-premium-cotton-polo-shirt-8100-96': {
    price: 159000,
    compareAtPrice: 179000,
    material: 'Cotton Pique Lacoste',
    weight: '220 gsm',
    sizes: APPAREL_SIZES,
    stock: 110,
    rating: 4.8,
    reviews: 356,
    popular: true,
    description:
      'Polo premium cotton pique dengan sirkulasi udara baik. Nyaman untuk kerja maupun santai.',
  },
  'new-states-apparel-dri-fit-t-shirt-2720-138': {
    price: 99000,
    material: 'Polyester Dri-Fit',
    weight: '140 gsm',
    sizes: APPAREL_SIZES,
    stock: 210,
    rating: 4.8,
    reviews: 432,
    popular: true,
    description:
      'Kaos dri-fit dengan teknologi cepat kering. Ringan, adem, dan nyaman untuk olahraga.',
  },
  'new-states-apparel-dri-fit-t-shirt-2700-130': {
    price: 95000,
    material: 'Polyester Dri-Fit',
    weight: '140 gsm',
    sizes: APPAREL_SIZES,
    stock: 190,
    rating: 4.7,
    reviews: 268,
    description:
      'Kaos dri-fit basic dengan bahan ringan dan cepat kering. Pilihan tepat untuk aktivitas aktif.',
  },
  'new-states-apparel-dri-fit-t-shirt-2701-131': {
    price: 109000,
    material: 'Polyester Dri-Fit',
    weight: '145 gsm',
    sizes: APPAREL_SIZES,
    stock: 120,
    rating: 4.7,
    reviews: 143,
    description:
      'Kaos dri-fit dua warna dengan potongan sporty. Nyaman dipakai untuk latihan maupun lari.',
  },
  '6089m-premium-classic-snapback-29': {
    price: 169000,
    material: 'Wool Blend',
    weight: '12 oz',
    sizes: HEADWEAR_SIZES,
    stock: 75,
    rating: 4.8,
    reviews: 132,
    care: CARE_HEADWEAR,
    description: 'Snapback premium classic dengan bahan wool blend dan ukuran adjustable.',
  },
  '6089mc-yupoong-classic-snapback-multicam-117': {
    price: 189000,
    material: 'Wool Blend Multicam',
    weight: '12 oz',
    sizes: HEADWEAR_SIZES,
    stock: 40,
    rating: 4.9,
    reviews: 61,
    isNew: true,
    care: CARE_HEADWEAR,
    description: 'Snapback multicam dengan pola kamuflase modern dan bahan wool blend.',
  },
  '6245cm-low-profile-cotton-twill-dad-hat-60': {
    price: 149000,
    material: 'Cotton Twill',
    weight: '10 oz',
    sizes: HEADWEAR_SIZES,
    stock: 90,
    rating: 4.7,
    reviews: 118,
    care: CARE_HEADWEAR,
    description: 'Dad hat low profile dari cotton twill. Simpel, ringan, dan mudah dipadukan.',
  },
  '6277-flexfit-wooly-combed-34': {
    price: 179000,
    material: 'Wool Blend Stretch',
    weight: '12 oz',
    sizes: HEADWEAR_SIZES,
    stock: 65,
    rating: 4.8,
    reviews: 97,
    popular: true,
    care: CARE_HEADWEAR,
    description: 'Flexfit wooly combed dengan bahan stretch dan bentuk yang nyaman.',
  },
  '6677-flexfit-pro-style-wool-35': {
    price: 189000,
    material: 'Pro-Style Wool',
    weight: '12 oz',
    sizes: HEADWEAR_SIZES,
    stock: 48,
    rating: 4.8,
    reviews: 54,
    care: CARE_HEADWEAR,
    description: 'Flexfit pro-style wool dengan profil rapi dan bahan premium.',
  },
  '180-flexfit-delta-84': {
    price: 199000,
    material: 'Delta Performance Fabric',
    weight: '10 oz',
    sizes: HEADWEAR_SIZES,
    stock: 42,
    rating: 4.8,
    reviews: 47,
    care: CARE_HEADWEAR,
    description: 'Flexfit delta dengan bahan ringan dan teknologi jahitan modern.',
  },
  '110m-one-ten-mesh-snapback--136': {
    price: 159000,
    material: 'Cotton Twill + Mesh',
    weight: '11 oz',
    sizes: HEADWEAR_SIZES,
    stock: 58,
    rating: 4.7,
    reviews: 66,
    care: CARE_HEADWEAR,
    description: 'Snapback mesh one ten dengan panel belakang breathable.',
  },
  '6606-retro-trucker-85': {
    price: 149000,
    material: 'Cotton Twill + Mesh',
    weight: '11 oz',
    sizes: HEADWEAR_SIZES,
    stock: 85,
    rating: 4.8,
    reviews: 109,
    care: CARE_HEADWEAR,
    description: 'Retro trucker dengan panel mesh dan gaya klasik yang tak lekang waktu.',
  },
  '6245mc-yupoong-multicam-low-profile-119': {
    price: 189000,
    material: 'Cotton Twill Multicam',
    weight: '10 oz',
    sizes: HEADWEAR_SIZES,
    stock: 36,
    rating: 4.8,
    reviews: 42,
    isNew: true,
    care: CARE_HEADWEAR,
    description: 'Low profile dad hat dengan pola multicam dan bahan cotton twill.',
  },
  '6277mc-the-one-and-only-original-flexfit-in-multicam-116': {
    price: 209000,
    material: 'Wool Blend Multicam Stretch',
    weight: '12 oz',
    sizes: HEADWEAR_SIZES,
    stock: 32,
    rating: 4.9,
    reviews: 38,
    isNew: true,
    care: CARE_HEADWEAR,
    description: 'Flexfit multicam dengan pola kamuflase dan bahan stretch nyaman.',
  },
}

const CATEGORY_MAP = {
  't-shirts': 'kaos',
  'polo-t-shirt': 'polo',
  'jacket-and-hoodies': 'hoodie',
  'sport-t-shirts': 'sport',
  headwear: 'headwear',
}

const publicPath = (localPath) => `/products/${localPath}`

const catalogue = JSON.parse(fs.readFileSync(CATALOGUE, 'utf8'))
const swatchHex = JSON.parse(fs.readFileSync(SWATCHES, 'utf8'))

const products = []

for (const category of catalogue.categories) {
  const categoryId = CATEGORY_MAP[category.slug]
  if (!categoryId) continue

  for (const source of category.products) {
    const meta = META[source.slug]
    if (!meta) {
      console.warn(`Metadata belum ada untuk ${source.slug}`)
      continue
    }

    const colors = source.colors.map((color) => {
      const files = Object.fromEntries(color.files.map((file) => [file.viewType, file.localPath]))
      const swatchPath = files.color
      return {
        name: color.colorName,
        hex: (swatchPath && swatchHex[swatchPath]) || '#d0cfd6',
        swatchImage: swatchPath ? publicPath(swatchPath) : undefined,
        images: {
          front: publicPath(files.front_side ?? swatchPath ?? ''),
          halfBody: files.front_half_body ? publicPath(files.front_half_body) : undefined,
          fullBody: files.front_full_body ? publicPath(files.front_full_body) : undefined,
          back: files.back_full_body ? publicPath(files.back_full_body) : undefined,
          swatch: swatchPath ? publicPath(swatchPath) : undefined,
        },
      }
    })

    const name = source.name.replace(/^New States Apparel\s+/i, '').replace(/\s+/g, ' ').trim()

    products.push({
      id: source.slug,
      name,
      category: categoryId,
      price: meta.price,
      compareAtPrice: meta.compareAtPrice,
      description: meta.description,
      material: meta.material,
      weight: meta.weight,
      care: meta.care ?? CARE_APPAREL,
      colors,
      sizes: meta.sizes,
      stock: meta.stock,
      rating: meta.rating,
      reviews: meta.reviews,
      popular: Boolean(meta.popular),
      isNew: Boolean(meta.isNew),
      sizeGuideUrl: source.sizeGuide ? publicPath(source.sizeGuide.localPath) : undefined,
    })
  }
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
fs.writeFileSync(OUTPUT, `${JSON.stringify(products, null, 2)}\n`)

console.log(`Ditulis ${products.length} produk ke ${path.relative(ROOT, OUTPUT)}`)
console.log(`Total varian warna: ${products.reduce((sum, product) => sum + product.colors.length, 0)}`)
