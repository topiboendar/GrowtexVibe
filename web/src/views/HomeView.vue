<script setup lang="ts">
import { FwbRating } from 'flowbite-vue'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Quote,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import ProductVisual from '@/components/ProductVisual.vue'
import ProductCard from '@/components/ProductCard.vue'
import {
  CATEGORIES,
  COLOR_SWATCHES,
  colorImage,
  formatIDR,
  POPULAR_SWATCHES,
  productColor,
  productsApi,
  SEED_PRODUCTS,
  type Product,
} from '@/api'

const route = useRoute()
const router = useRouter()

const products = ref<Product[]>([])
const loading = ref(true)
const activeColor = ref('')

const heroProduct =
  SEED_PRODUCTS.find((product) => product.id === 'new-states-apparel-premium-cotton-t-shirt-7200-99') ??
  SEED_PRODUCTS[0]!
const heroColor = ref(heroProduct.colors[0]?.name ?? '')
const heroSwatches = computed(() => heroProduct.colors.slice(0, 6))
const heroImage = computed(() =>
  colorImage(productColor(heroProduct, heroColor.value), 'fullBody'),
)

const categoryPreview = Object.fromEntries(
  CATEGORIES.map((category) => {
    const product = SEED_PRODUCTS.find((item) => item.category === category.id)
    return [category.id, colorImage(product?.colors[0], 'front')]
  }),
) as Record<Product['category'], string>

const featuredColors = computed(() => COLOR_SWATCHES.filter((color) => color.swatchImage).slice(0, 18))

const dtfPreview = colorImage(
  SEED_PRODUCTS.find((product) => product.category === 'kaos')?.colors[0],
  'front',
)

const activeCategory = computed(() => {
  const value = route.query.kategori
  return typeof value === 'string' && value ? value : 'all'
})

const searchTerm = computed({
  get: () => (typeof route.query.q === 'string' ? route.query.q : ''),
  set: (value: string) => {
    const query = { ...route.query }
    if (value) query.q = value
    else delete query.q
    router.replace({ query })
  },
})

const popularProducts = computed(() => products.value.filter((product) => product.popular).slice(0, 4))

const filteredProducts = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return products.value.filter((product) => {
    const matchCategory = activeCategory.value === 'all' || product.category === activeCategory.value
    const matchColor =
      !activeColor.value ||
      product.colors.some((color) => color.hex.toLowerCase() === activeColor.value.toLowerCase())
    const matchSearch =
      !term ||
      product.name.toLowerCase().includes(term) ||
      product.material.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    return matchCategory && matchColor && matchSearch
  })
})

const hasFilter = computed(
  () => Boolean(searchTerm.value) || activeCategory.value !== 'all' || Boolean(activeColor.value),
)

function setCategory(id: string) {
  const query = { ...route.query }
  if (id === 'all') delete query.kategori
  else query.kategori = id
  router.replace({ query, hash: '#koleksi' })
}

function resetFilters() {
  activeColor.value = ''
  router.replace({ query: {}, hash: '#koleksi' })
}

function pickColor(hex: string) {
  activeColor.value = activeColor.value === hex ? '' : hex
  router.replace({ query: route.query, hash: '#koleksi' })
}

const values = [
  {
    icon: Scissors,
    title: 'Tanpa minimum order',
    body: 'Pesan satu pcs pun tetap diproses dengan standar yang sama.',
  },
  {
    icon: Timer,
    title: 'Produksi 1–2 hari',
    body: 'Desain dikonfirmasi hari ini, sablon dikerjakan besok.',
  },
  {
    icon: ShieldCheck,
    title: 'Bahan terkurasi',
    body: 'Cotton combed & fleece pilihan, jahitan rapi dan tahan lama.',
  },
]

const steps = [
  { title: 'Pilih produk', body: 'Tentukan model, warna, dan ukuran dari katalog.' },
  { title: 'Unggah desain', body: 'Atur area sablon DTF langsung dari halaman produk.' },
  { title: 'Kami produksi', body: 'Pesanan dicetak, di-press, lalu dikirim ke alamatmu.' },
]

const partners = [
  'KOPI KALA',
  'RUANG TENGAH',
  'SORE STUDIO',
  'KOMUNITAS LARI',
  'ARSIP ID',
  'TANAH CERITA',
]

const testimonials = [
  {
    quote:
      'Kualitas cotton-nya jauh di atas ekspektasi. Sablon DTF-nya tidak pecah setelah beberapa kali cuci.',
    name: 'Nadia Prameswari',
    role: 'Founder, Sore Studio',
    initials: 'NP',
  },
  {
    quote:
      'Pesan 12 pcs untuk event komunitas, semuanya selesai dalam dua hari. Komunikasi cepat dan rapi.',
    name: 'Rangga Pratama',
    role: 'Koordinator Komunitas Lari',
    initials: 'RP',
  },
  {
    quote:
      'Sebagai brand kecil, kami butuh MOQ rendah tapi hasil tetap terlihat premium. GrowtexStore jawabannya.',
    name: 'Alya Rahmadani',
    role: 'Owner, Tanah Cerita',
    initials: 'AR',
  },
]

onMounted(async () => {
  try {
    products.value = await productsApi.list()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <!-- ============================== HERO ============================== -->
    <section class="relative overflow-hidden">
      <div
        class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-cream/80 to-transparent"
      />

      <div
        class="container-page grid gap-10 pt-8 pb-12 sm:pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:pt-16 lg:pb-20"
      >
        <div class="min-w-0 animate-fade-up">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-medium text-muted"
          >
            <span class="size-1.5 rounded-full bg-accent" />
            Satuan &amp; partai besar · sejak 2019
          </span>

          <h1 class="h-display mt-5">
            Kaos custom satuan
            <span class="text-muted">&amp; partai besar.</span>
          </h1>

          <p class="lead mt-4 max-w-md">
            Katalog pakaian polos terkurasi dan custom sablon DTF tanpa minimum order. Dibuat untuk
            kreator, komunitas, dan bisnis yang peduli detail.
          </p>

          <div class="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <a href="#koleksi" class="btn btn-primary btn-lg">
              Jelajahi koleksi
              <ArrowRight class="size-4" />
            </a>
            <a href="#custom-dtf" class="btn btn-outline btn-lg">
              <Sparkles class="size-4" />
              Mulai custom DTF
            </a>
          </div>

          <ul class="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] font-medium text-muted">
            <li class="flex items-center gap-1.5">
              <Check class="size-3.5 text-accent" /> Tanpa minimum order
            </li>
            <li class="flex items-center gap-1.5">
              <Check class="size-3.5 text-accent" /> Produksi 1–2 hari
            </li>
            <li class="flex items-center gap-1.5">
              <Check class="size-3.5 text-accent" /> Gratis ongkir &gt; Rp500rb
            </li>
          </ul>
        </div>

        <!-- Hero visual -->
        <div class="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:120ms] lg:max-w-none">
          <div
            class="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-cream via-cream to-sand/70"
          >
            <div class="aspect-[4/5] w-full">
              <ProductVisual
                :src="heroImage"
                :alt="`${heroProduct.name} — ${heroColor}`"
                eager
              />
            </div>

            <div
              class="absolute top-4 right-4 rounded-2xl border border-line/70 bg-surface/90 px-3 py-2 backdrop-blur"
            >
              <p class="text-[9.5px] font-semibold tracking-[0.14em] text-muted uppercase">Rating</p>
              <p class="mt-0.5 flex items-center gap-1 text-sm font-bold">
                {{ heroProduct.rating.toFixed(1) }}
                <Star class="size-3 fill-amber-400 text-amber-400" />
              </p>
            </div>

            <div
              class="absolute inset-x-4 bottom-4 rounded-2xl border border-line/70 bg-surface/95 p-3.5 backdrop-blur"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-[9.5px] font-semibold tracking-[0.14em] text-muted uppercase">
                    Best seller
                  </p>
                  <p class="mt-0.5 truncate text-sm font-semibold">{{ heroProduct.name }}</p>
                  <p class="mt-1 text-[13px] font-semibold text-accent">
                    {{ formatIDR(heroProduct.price) }}
                  </p>
                </div>
                <div class="flex flex-wrap justify-end gap-1.5">
                  <button
                    v-for="color in heroSwatches"
                    :key="color.name"
                    type="button"
                    class="group -m-2.5 flex size-11 items-center justify-center rounded-full"
                    :aria-label="`Warna ${color.name}`"
                    @click="heroColor = color.name"
                  >
                    <span
                      class="size-5 overflow-hidden rounded-full border transition-transform group-hover:scale-110"
                      :class="
                        heroColor === color.name
                          ? 'border-ink ring-1 ring-ink/20 ring-offset-2 ring-offset-surface'
                          : 'border-ink/15'
                      "
                      :style="{ backgroundColor: color.hex }"
                    >
                      <img
                        v-if="color.swatchImage"
                        :src="color.swatchImage"
                        alt=""
                        class="size-full object-cover"
                        loading="lazy"
                      />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================= VALUE PROPOSITIONS ===================== -->
    <section class="border-y border-line bg-surface">
      <div class="container-page grid gap-px py-2 sm:grid-cols-3">
        <div
          v-for="(value, index) in values"
          :key="value.title"
          class="flex gap-3.5 py-5 sm:px-5 sm:py-7"
          :class="index > 0 ? 'border-t border-line sm:border-t-0 sm:border-l' : ''"
        >
          <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <component :is="value.icon" class="size-[18px]" />
          </span>
          <div>
            <h2 class="text-[13.5px] font-semibold">{{ value.title }}</h2>
            <p class="mt-1 text-[12.5px] leading-relaxed text-muted">{{ value.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================ CATEGORIES ========================== -->
    <section class="border-t border-line bg-surface">
      <div class="container-page py-12 sm:py-14">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="eyebrow">Kategori</p>
            <h2 class="h-section mt-2">Pakaian polos</h2>
            <p class="lead mt-2 max-w-md">
              Kaos, polo, hoodie, jaket, sport dri-fit, sampai headwear — semua tersedia satuan
              maupun partai besar.
            </p>
          </div>
          <RouterLink
            :to="{ name: 'home', hash: '#koleksi' }"
            class="hidden shrink-0 items-center gap-1.5 text-sm font-semibold underline decoration-line decoration-1 underline-offset-4 transition-colors hover:decoration-ink sm:inline-flex"
          >
            Lihat semua
            <ArrowUpRight class="size-4" />
          </RouterLink>
        </div>

        <div class="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <RouterLink
            v-for="category in CATEGORIES"
            :key="category.id"
            :to="{ name: 'home', query: { kategori: category.id }, hash: '#koleksi' }"
            class="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-soft"
          >
            <div class="relative overflow-hidden bg-[#e0e0e0]">
              <div class="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-[1.04]">
                <ProductVisual
                  :src="categoryPreview[category.id]"
                  :alt="category.label"
                />
              </div>
            </div>
            <div class="flex items-center justify-between gap-2 border-t border-line px-3.5 py-3">
              <div class="min-w-0">
                <p class="truncate text-[13px] font-semibold">{{ category.label }}</p>
                <p class="truncate text-[10.5px] text-muted">{{ category.caption }}</p>
              </div>
              <ArrowUpRight
                class="size-3.5 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
              />
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ============================= POPULAR ============================ -->
    <section class="section">
      <div class="container-page">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="eyebrow">Paling populer</p>
            <h2 class="h-section mt-2">Dipilih paling sering</h2>
          </div>
          <a
            href="#koleksi"
            class="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-ink underline decoration-line decoration-1 underline-offset-4 transition-colors hover:decoration-ink sm:inline-flex"
          >
            Lihat semua
            <ArrowUpRight class="size-4" />
          </a>
        </div>

        <div v-if="loading" class="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div v-for="n in 4" :key="n" class="skeleton aspect-[3/4]" />
        </div>

        <div v-else class="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <ProductCard
            v-for="product in popularProducts"
            :key="product.id"
            :product="product"
          />
        </div>

        <a
          href="#koleksi"
          class="btn btn-outline btn-block mt-5 sm:hidden"
        >
          Lihat semua koleksi
          <ArrowRight class="size-4" />
        </a>
      </div>
    </section>

    <!-- ============================ CATALOG ============================= -->
    <section id="koleksi" class="scroll-mt-24 border-t border-line bg-surface">
      <div class="container-page section">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="eyebrow">Koleksi</p>
            <h2 class="h-section mt-2">Semua pakaian polos</h2>
            <p class="lead mt-2 max-w-md">
              Pilih kategori, warna, atau cari langsung. Semua stok tersedia untuk satuan.
            </p>
          </div>

          <div class="relative w-full sm:max-w-xs">
            <Search class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Cari produk…"
              class="field pl-10"
              aria-label="Cari produk"
            />
          </div>
        </div>

        <!-- Category chips -->
        <div class="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
          <button
            class="chip shrink-0"
            :class="activeCategory === 'all' ? 'chip-active' : ''"
            @click="setCategory('all')"
          >
            Semua
          </button>
          <button
            v-for="category in CATEGORIES"
            :key="category.id"
            class="chip shrink-0"
            :class="activeCategory === category.id ? 'chip-active' : ''"
            @click="setCategory(category.id)"
          >
            {{ category.label }}
          </button>
        </div>

        <!-- Color filter -->
        <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span class="text-[11px] font-semibold tracking-wider text-muted uppercase">Warna</span>
          <button
            v-for="color in POPULAR_SWATCHES"
            :key="color.name"
            type="button"
            class="group -mx-2.5 flex size-11 items-center justify-center rounded-full"
            :title="color.name"
            :aria-label="`Filter warna ${color.name}`"
            :aria-pressed="activeColor.toLowerCase() === color.hex.toLowerCase()"
            @click="pickColor(color.hex)"
          >
            <span
              class="size-6 overflow-hidden rounded-full border transition-transform group-hover:scale-110"
              :class="
                activeColor.toLowerCase() === color.hex.toLowerCase()
                  ? 'border-ink ring-1 ring-ink/20 ring-offset-2'
                  : 'border-ink/15'
              "
              :style="{ backgroundColor: color.hex }"
            >
              <img
                v-if="color.swatchImage"
                :src="color.swatchImage"
                alt=""
                class="size-full object-cover"
                loading="lazy"
              />
            </span>
          </button>
          <button
            v-if="hasFilter"
            class="ml-1 min-h-11 text-[11px] font-medium text-muted underline underline-offset-4 hover:text-ink"
            @click="resetFilters"
          >
            Reset
          </button>
        </div>

        <p class="mt-4 text-[11.5px] text-muted">
          Menampilkan <span class="font-semibold text-ink">{{ filteredProducts.length }}</span> produk
        </p>

        <!-- Grid -->
        <div v-if="!loading && filteredProducts.length > 0" class="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
        </div>

        <div
          v-else-if="!loading"
          class="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-14 text-center"
        >
          <span class="flex size-12 items-center justify-center rounded-full bg-cream text-muted">
            <Search class="size-5" />
          </span>
          <h3 class="mt-3 text-sm font-semibold">Tidak ada produk yang cocok</h3>
          <p class="mt-1 max-w-xs text-[12.5px] text-muted">
            Coba kata kunci lain atau reset filter untuk melihat seluruh koleksi.
          </p>
          <button class="btn btn-outline btn-sm mt-4" @click="resetFilters">Reset filter</button>
        </div>
      </div>
    </section>

    <!-- ========================= SHOP BY COLOR ========================== -->
    <section class="section border-t border-line">
      <div class="container-page">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="eyebrow">Belanja berdasarkan warna</p>
            <h2 class="h-section mt-2">Temukan paletmu</h2>
          </div>
          <a
            href="#koleksi"
            class="hidden shrink-0 text-sm font-semibold underline decoration-line underline-offset-4 hover:decoration-ink sm:block"
          >
            Lihat semua
          </a>
        </div>

        <div class="mt-7 grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3 lg:grid-cols-9">
          <button
            v-for="color in featuredColors"
            :key="color.name"
            type="button"
            class="group flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-2 py-3.5 transition-colors hover:border-ink/20"
            @click="pickColor(color.hex)"
          >
            <span
              class="size-10 overflow-hidden rounded-full border border-ink/10 shadow-inner transition-transform group-hover:scale-105"
              :style="{ backgroundColor: color.hex }"
            >
              <img
                v-if="color.swatchImage"
                :src="color.swatchImage"
                :alt="`Swatch ${color.name}`"
                class="size-full object-cover"
                loading="lazy"
              />
            </span>
            <span class="max-w-full truncate text-[11px] font-medium text-muted group-hover:text-ink">
              {{ color.name }}
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- =========================== CUSTOM DTF =========================== -->
    <section id="custom-dtf" class="scroll-mt-24 bg-ink text-cream">
      <div class="container-page section grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <span class="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase">
            <Sparkles class="size-3.5" /> DTF studio
          </span>
          <h2 class="mt-4 text-2xl leading-tight font-semibold tracking-[-0.02em] sm:text-3xl lg:text-4xl">
            Sablon DTF satuan, tanpa ribet.
          </h2>
          <p class="mt-3 max-w-md text-sm leading-relaxed text-cream/60">
            Unggah artwork, pilih area cetak, dan lihat estimasi harga secara langsung. Cocok untuk
            kaos komunitas, merchandise brand, maupun hadiah personal.
          </p>

          <ol class="mt-7 space-y-4">
            <li v-for="(step, index) in steps" :key="step.title" class="flex gap-3.5">
              <span
                class="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/20 text-[11px] font-bold"
              >
                {{ String(index + 1).padStart(2, '0') }}
              </span>
              <div>
                <p class="text-[13.5px] font-semibold">{{ step.title }}</p>
                <p class="mt-0.5 text-[12.5px] leading-relaxed text-cream/55">{{ step.body }}</p>
              </div>
            </li>
          </ol>

          <div class="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <RouterLink
              :to="{ name: 'product-detail', params: { id: 'new-states-apparel-premium-cotton-t-shirt-7200-99' } }"
              class="btn btn-light btn-lg"
            >
              Coba custom sekarang
              <ArrowRight class="size-4" />
            </RouterLink>
            <a href="https://wa.me/6281234567890" class="btn btn-lg border border-white/20 text-cream hover:bg-white/5">
              Konsultasi desain
            </a>
          </div>
        </div>

        <div class="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div class="relative overflow-hidden rounded-[2rem] bg-white/[0.06] p-6 sm:p-8">
            <div class="aspect-[4/5] w-full">
              <ProductVisual :src="dtfPreview" alt="Pratinjau kaos untuk sablon DTF" />
            </div>
            <div class="absolute inset-x-6 top-6 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 backdrop-blur">
              <p class="text-[9.5px] font-semibold tracking-[0.14em] text-cream/60 uppercase">
                Artwork preview
              </p>
              <p class="mt-0.5 text-[12px] font-medium">logo-komunitas.png · A4 · Depan</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- =========================== SPONSORSHIP ========================== -->
    <section class="border-b border-line bg-surface py-10 sm:py-12">
      <div class="container-page">
        <p class="text-center text-[10.5px] font-semibold tracking-[0.18em] text-muted uppercase">
          Dipercaya oleh komunitas &amp; brand
        </p>
      </div>

      <div class="relative mt-6 overflow-hidden">
        <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent" />
        <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent" />
        <div class="flex w-max animate-marquee items-center gap-10 pr-10 sm:gap-16 sm:pr-16">
          <template v-for="copy in 2" :key="copy">
            <span
              v-for="partner in partners"
              :key="`${copy}-${partner}`"
              class="text-[13px] font-bold tracking-[0.18em] whitespace-nowrap text-muted/45 uppercase sm:text-sm"
            >
              {{ partner }}
            </span>
          </template>
        </div>
      </div>
      <p class="container-page mt-4 text-center text-[10px] text-muted/60">
        Placeholder logo partner — akan diganti saat kerja sama aktif.
      </p>
    </section>

    <!-- =========================== TESTIMONIALS ========================= -->
    <section id="testimoni" class="section scroll-mt-24">
      <div class="container-page">
        <div class="max-w-lg">
          <p class="eyebrow">Testimoni</p>
          <h2 class="h-section mt-2">Kata mereka yang sudah mencoba</h2>
          <p class="lead mt-2">
            Placeholder ulasan pelanggan. Nantinya diisi otomatis dari pesanan yang sudah selesai.
          </p>
        </div>

        <div class="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <figure
            v-for="testimonial in testimonials"
            :key="testimonial.name"
            class="flex flex-col rounded-3xl border border-line bg-surface p-5 sm:p-6"
          >
            <Quote class="size-6 text-line" />
            <blockquote class="mt-3 flex-1 text-[13.5px] leading-relaxed text-ink/85">
              “{{ testimonial.quote }}”
            </blockquote>
            <FwbRating :rating="5" size="sm" class="mt-4" />
            <figcaption class="mt-4 flex items-center gap-2.5 border-t border-line pt-4">
              <span class="flex size-9 items-center justify-center rounded-full bg-cream text-[11px] font-bold text-muted">
                {{ testimonial.initials }}
              </span>
              <div>
                <p class="text-[12.5px] font-semibold">{{ testimonial.name }}</p>
                <p class="text-[11px] text-muted">{{ testimonial.role }}</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- ============================== CTA =============================== -->
    <section class="pb-16 sm:pb-20">
      <div class="container-page">
        <div class="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-cream to-sand/70 px-6 py-10 text-center sm:px-10 sm:py-14">
          <h2 class="mx-auto max-w-lg text-xl leading-tight font-semibold tracking-[-0.02em] sm:text-2xl lg:text-3xl">
            Siap memulai produksi pertama?
          </h2>
          <p class="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted">
            Mulai dari satu kaos, atau konsultasikan kebutuhan partai besar bersama tim kami.
          </p>
          <div class="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            <RouterLink
              :to="{ name: 'product-detail', params: { id: 'new-states-apparel-premium-cotton-t-shirt-7200-99' } }"
              class="btn btn-primary btn-lg"
            >
              Pesan sekarang
            </RouterLink>
            <a href="https://wa.me/6281234567890" class="btn btn-outline btn-lg">
              Hubungi tim penjualan
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
