<script setup lang="ts">
import { FwbRating } from 'flowbite-vue'
import {
  Check,
  ChevronRight,
  Minus,
  Plus,
  Ruler,
  RotateCcw,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import DtfCustomizer from '@/components/DtfCustomizer.vue'
import ProductVisual from '@/components/ProductVisual.vue'
import ProductCard from '@/components/ProductCard.vue'
import {
  CATEGORIES,
  colorImage,
  dtfUnitPrice,
  formatIDR,
  productsApi,
  type DtfOption,
  type Product,
  type ProductView,
} from '@/api'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const cart = useCartStore()

const product = ref<Product | null>(null)
const related = ref<Product[]>([])
const loading = ref(true)
const notFound = ref(false)

const selectedColor = ref('')
const selectedSize = ref('')
const qty = ref(1)
const added = ref(false)
const sizeError = ref('')
const galleryView = ref<ProductView>('front')
const sizeGuideOpen = ref(false)

const dtf = ref<DtfOption>({ enabled: false, position: 'depan', size: 'a4' })

const categoryLabel = computed(
  () => CATEGORIES.find((category) => category.id === product.value?.category)?.label ?? 'Koleksi',
)

const activeColor = computed(
  () => product.value?.colors.find((color) => color.name === selectedColor.value) ?? product.value?.colors[0],
)

const galleryOptions = computed(() => {
  const images = activeColor.value?.images
  const options: { value: ProductView; label: string }[] = [
    { value: 'front', label: 'Produk' },
    { value: 'halfBody', label: 'Model' },
    { value: 'fullBody', label: 'Outfit' },
    { value: 'back', label: 'Belakang' },
  ]
  return options.filter((option) => Boolean(images?.[option.value]))
})

const galleryImage = computed(() => colorImage(activeColor.value, galleryView.value))
const garmentBackImage = computed(() => colorImage(activeColor.value, 'back'))

const dtfPrice = computed(() => dtfUnitPrice(dtf.value))
const unitPrice = computed(() => (product.value?.price ?? 0) + dtfPrice.value)
const lineTotal = computed(() => unitPrice.value * qty.value)
const maxQty = computed(() => Math.min(product.value?.stock ?? 1, 20))

async function load(id: string) {
  loading.value = true
  notFound.value = false
  added.value = false
  sizeError.value = ''

  try {
    const data = await productsApi.get(id)
    product.value = data
    selectedColor.value = data.colors[0]?.name ?? ''
    selectedSize.value = data.sizes.length === 1 ? data.sizes[0]! : ''
    qty.value = 1
    galleryView.value = 'front'
    sizeGuideOpen.value = false
    dtf.value = { enabled: false, position: 'depan', size: 'a4' }

    const all = await productsApi.list()
    related.value = all
      .filter((item) => item.category === data.category && item.id !== data.id)
      .slice(0, 4)
  } catch {
    notFound.value = true
    product.value = null
  } finally {
    loading.value = false
  }
}

function changeQty(delta: number) {
  qty.value = Math.min(maxQty.value, Math.max(1, qty.value + delta))
}

function addToCart() {
  if (!product.value) return
  if (!selectedSize.value) {
    sizeError.value = 'Pilih ukuran terlebih dahulu.'
    return
  }
  sizeError.value = ''
  cart.addItem(product.value, {
    color: selectedColor.value,
    size: selectedSize.value,
    qty: qty.value,
    dtf: dtf.value.enabled ? dtf.value : null,
  })
  added.value = true
  window.setTimeout(() => (added.value = false), 2200)
}

onMounted(() => load(String(route.params.id)))

watch(
  () => route.params.id,
  (id) => {
    if (id) load(String(id))
  },
)

watch(
  () => activeColor.value?.name,
  () => {
    if (!galleryOptions.value.some((option) => option.value === galleryView.value)) {
      galleryView.value = 'front'
    }
  },
)
</script>

<template>
  <div class="pb-24 lg:pb-0">
    <div class="container-page pt-5 sm:pt-6">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-1.5 text-[11px] text-muted" aria-label="Breadcrumb">
        <RouterLink to="/" class="transition-colors hover:text-ink">Beranda</RouterLink>
        <ChevronRight class="size-3" />
        <RouterLink
          :to="{ name: 'home', query: { kategori: product?.category }, hash: '#koleksi' }"
          class="transition-colors hover:text-ink"
        >
          {{ categoryLabel }}
        </RouterLink>
        <ChevronRight class="size-3" />
        <span class="truncate font-medium text-ink">{{ product?.name ?? 'Produk' }}</span>
      </nav>

      <!-- Loading -->
      <div v-if="loading" class="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div class="skeleton aspect-[4/5]" />
        <div class="space-y-3">
          <div class="skeleton h-4 w-24" />
          <div class="skeleton h-8 w-2/3" />
          <div class="skeleton h-5 w-32" />
          <div class="skeleton h-24" />
          <div class="skeleton h-40" />
        </div>
      </div>

      <!-- Not found -->
      <div v-else-if="notFound" class="flex flex-col items-center py-20 text-center">
        <span class="badge">404</span>
        <h1 class="mt-3 text-xl font-semibold">Produk tidak ditemukan</h1>
        <p class="mt-1 max-w-sm text-sm text-muted">
          Produk mungkin sudah tidak tersedia. Silakan kembali ke koleksi untuk melihat pilihan lain.
        </p>
        <RouterLink :to="{ name: 'home', hash: '#koleksi' }" class="btn btn-primary mt-5">
          Kembali ke koleksi
        </RouterLink>
      </div>

      <!-- Content -->
      <div v-else-if="product" class="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <!-- Gallery -->
        <div class="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div class="relative overflow-hidden rounded-[2rem] border border-line bg-[#e0e0e0]">
            <div class="aspect-[4/5] w-full">
              <ProductVisual
                :src="galleryImage"
                :alt="`${product.name} — ${selectedColor}`"
                eager
              />
            </div>
            <div class="absolute top-4 left-4 flex flex-col gap-1.5">
              <span v-if="product.isNew" class="badge-ink">Baru</span>
              <span class="badge">{{ product.weight }}</span>
            </div>

            <!-- View switcher -->
            <div
              v-if="galleryOptions.length > 1"
              class="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 bg-gradient-to-t from-ink/45 to-transparent p-3"
            >
              <button
                v-for="option in galleryOptions"
                :key="option.value"
                type="button"
                class="rounded-full px-3 py-1.5 text-[10.5px] font-semibold transition-colors"
                :class="
                  galleryView === option.value
                    ? 'bg-surface text-ink shadow-soft'
                    : 'bg-white/15 text-white backdrop-blur hover:bg-white/25'
                "
                @click="galleryView = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- Color thumbnails -->
          <div class="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              v-for="color in product.colors"
              :key="color.name"
              type="button"
              class="relative w-16 shrink-0 overflow-hidden rounded-xl border bg-surface transition-colors sm:w-20"
              :class="selectedColor === color.name ? 'border-ink' : 'border-line hover:border-ink/30'"
              :aria-label="`Warna ${color.name}`"
              @click="selectedColor = color.name"
            >
              <div class="aspect-square w-full">
                <ProductVisual
                  :src="colorImage(color, 'front')"
                  :alt="`${color.name} ${product.name}`"
                />
              </div>
              <span class="block truncate border-t border-line px-1 py-1 text-center text-[9px] font-medium text-muted">
                {{ color.name }}
              </span>
            </button>
          </div>

          <p class="mt-2 text-[10.5px] text-muted">
            Swatch mini menampilkan tekstur kain asli. Pilih warna untuk memperbarui foto produk &
            model.
          </p>
        </div>

        <!-- Info -->
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <p class="eyebrow">{{ categoryLabel }}</p>
            <span class="size-1 rounded-full bg-line" />
            <span class="text-[11px] text-muted">{{ product.material }}</span>
          </div>

          <h1 class="mt-2 text-2xl leading-tight font-semibold tracking-[-0.02em] sm:text-3xl">
            {{ product.name }}
          </h1>

          <div class="mt-2 flex items-center gap-2">
            <FwbRating :rating="Math.round(product.rating)" size="sm" />
            <span class="text-[11.5px] text-muted">
              {{ product.rating.toFixed(1) }} · {{ product.reviews }} ulasan
            </span>
          </div>

          <div class="mt-4 flex flex-wrap items-baseline gap-2">
            <p class="text-2xl font-semibold tracking-tight">{{ formatIDR(product.price) }}</p>
            <p v-if="product.compareAtPrice" class="text-sm text-muted line-through">
              {{ formatIDR(product.compareAtPrice) }}
            </p>
            <span v-if="product.compareAtPrice" class="badge-warn">
              Hemat {{ formatIDR(product.compareAtPrice - product.price) }}
            </span>
          </div>
          <p class="mt-1 text-[11.5px] text-muted">Harga per pcs · belum termasuk sablon DTF.</p>

          <p class="mt-4 text-[13.5px] leading-relaxed text-muted">{{ product.description }}</p>

          <div class="mt-6 space-y-5">
            <!-- Color -->
            <div>
              <div class="flex items-center justify-between">
                <p class="label mb-0">Warna</p>
                <p class="text-[11.5px] font-medium text-ink">{{ selectedColor }}</p>
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="color in product.colors"
                  :key="color.name"
                  type="button"
                  class="size-11 overflow-hidden rounded-full border transition-transform hover:scale-105"
                  :class="
                    selectedColor === color.name
                      ? 'border-ink ring-2 ring-ink/20 ring-offset-2'
                      : 'border-ink/15'
                  "
                  :style="{ backgroundColor: color.hex }"
                  :aria-label="color.name"
                  :title="color.name"
                  @click="selectedColor = color.name"
                >
                  <img
                    v-if="color.swatchImage"
                    :src="color.swatchImage"
                    :alt="`Swatch ${color.name}`"
                    class="size-full object-cover"
                    loading="lazy"
                  />
                </button>
              </div>
            </div>

            <!-- Size -->
            <div>
              <div class="flex items-center justify-between">
                <p class="label mb-0">Ukuran</p>
                <button
                  class="flex items-center gap-1 text-[11px] font-medium text-muted hover:text-ink"
                  :disabled="!product.sizeGuideUrl"
                  @click="sizeGuideOpen = true"
                >
                  <Ruler class="size-3.5" /> Panduan ukuran
                </button>
              </div>
              <div class="mt-2 grid grid-cols-5 gap-2">
                <button
                  v-for="size in product.sizes"
                  :key="size"
                  type="button"
                  class="flex h-11 items-center justify-center rounded-xl border text-[12.5px] font-semibold transition-colors"
                  :class="
                    selectedSize === size
                      ? 'border-ink bg-ink text-white'
                      : 'border-line bg-surface hover:border-ink/30'
                  "
                  @click="selectedSize = size"
                >
                  {{ size }}
                </button>
              </div>
              <p v-if="sizeError" class="error-text">{{ sizeError }}</p>
            </div>

            <!-- Qty -->
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="label mb-0">Jumlah</p>
                <p class="mt-1 text-[11px] text-muted">Stok tersedia {{ product.stock }} pcs</p>
              </div>
              <div class="flex items-center rounded-full border border-line bg-surface">
                <button
                  class="flex size-11 items-center justify-center text-muted transition-colors hover:text-ink disabled:opacity-40"
                  :disabled="qty <= 1"
                  aria-label="Kurangi jumlah"
                  @click="changeQty(-1)"
                >
                  <Minus class="size-4" />
                </button>
                <span class="w-9 text-center text-sm font-semibold">{{ qty }}</span>
                <button
                  class="flex size-11 items-center justify-center text-muted transition-colors hover:text-ink disabled:opacity-40"
                  :disabled="qty >= maxQty"
                  aria-label="Tambah jumlah"
                  @click="changeQty(1)"
                >
                  <Plus class="size-4" />
                </button>
              </div>
            </div>

            <!-- DTF -->
            <DtfCustomizer
              v-model="dtf"
              :product-category="product.category"
              :garment-image="colorImage(activeColor, 'front')"
              :garment-back-image="garmentBackImage"
            />

            <!-- Price summary + CTA -->
            <div class="rounded-3xl border border-line bg-surface p-4">
              <dl class="space-y-1.5 text-[12.5px]">
                <div class="flex justify-between text-muted">
                  <dt>Harga produk</dt>
                  <dd class="text-ink">{{ formatIDR(product.price * qty) }}</dd>
                </div>
                <div v-if="dtfPrice > 0" class="flex justify-between text-muted">
                  <dt>Sablon DTF ({{ qty }} pcs)</dt>
                  <dd class="text-ink">{{ formatIDR(dtfPrice * qty) }}</dd>
                </div>
                <div class="flex justify-between border-t border-line pt-2 text-[15px] font-semibold">
                  <dt>Total</dt>
                  <dd>{{ formatIDR(lineTotal) }}</dd>
                </div>
              </dl>

              <button class="btn btn-primary btn-block btn-lg mt-3.5" @click="addToCart">
                <Check v-if="added" class="size-4" />
                <ShoppingBag v-else class="size-4" />
                {{ added ? 'Ditambahkan ke keranjang' : 'Tambah ke keranjang' }}
              </button>
            </div>

            <!-- Perks -->
            <ul class="grid gap-2.5 sm:grid-cols-2">
              <li class="flex items-center gap-2 text-[11.5px] text-muted">
                <Truck class="size-4 shrink-0 text-accent" /> Gratis ongkir di atas Rp500.000
              </li>
              <li class="flex items-center gap-2 text-[11.5px] text-muted">
                <RotateCcw class="size-4 shrink-0 text-accent" /> Penukaran ukuran 3 hari
              </li>
            </ul>

            <!-- Details -->
            <div class="divide-y divide-line rounded-2xl border border-line bg-surface">
              <details class="group px-4 py-3.5" open>
                <summary class="flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold">
                  Spesifikasi bahan
                  <Plus class="size-4 text-muted transition-transform group-open:rotate-45" />
                </summary>
                <div class="mt-2.5 space-y-1.5 text-[12.5px] text-muted">
                  <p><span class="font-medium text-ink">Material:</span> {{ product.material }}</p>
                  <p><span class="font-medium text-ink">Berat:</span> {{ product.weight }}</p>
                  <p><span class="font-medium text-ink">Ukuran tersedia:</span> {{ product.sizes.join(', ') }}</p>
                </div>
              </details>
              <details class="group px-4 py-3.5">
                <summary class="flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold">
                  Perawatan
                  <Plus class="size-4 text-muted transition-transform group-open:rotate-45" />
                </summary>
                <p class="mt-2.5 text-[12.5px] leading-relaxed text-muted">{{ product.care }}</p>
              </details>
              <details class="group px-4 py-3.5">
                <summary class="flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold">
                  Pengiriman &amp; produksi
                  <Plus class="size-4 text-muted transition-transform group-open:rotate-45" />
                </summary>
                <p class="mt-2.5 text-[12.5px] leading-relaxed text-muted">
                  Pesanan tanpa sablon diproses dalam 1 hari kerja. Dengan sablon DTF estimasi
                  produksi 1–2 hari kerja, lalu dikirim via kurir pilihan.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Related -->
    <section v-if="related.length > 0" class="section container-page border-t border-line">
      <div class="flex items-end justify-between gap-4 pt-10 sm:pt-0">
        <div>
          <p class="eyebrow">Lengkapi koleksi</p>
          <h2 class="h-section mt-2">Produk serupa</h2>
        </div>
        <RouterLink
          :to="{ name: 'home', query: { kategori: product?.category }, hash: '#koleksi' }"
          class="shrink-0 text-sm font-semibold underline decoration-line underline-offset-4 hover:decoration-ink"
        >
          Lihat semua
        </RouterLink>
      </div>
      <div class="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <ProductCard v-for="item in related" :key="item.id" :product="item" />
      </div>
    </section>

    <!-- Mobile sticky action -->
    <div
      v-if="product"
      class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
    >
      <div class="flex items-center gap-3">
        <div class="min-w-0 flex-1">
          <p class="truncate text-[10.5px] text-muted">{{ selectedColor }} · {{ selectedSize || 'Pilih ukuran' }}</p>
          <p class="text-[15px] font-semibold tracking-tight">{{ formatIDR(lineTotal) }}</p>
        </div>
        <button class="btn btn-primary shrink-0 px-6" @click="addToCart">
          <Check v-if="added" class="size-4" />
          <ShoppingBag v-else class="size-4" />
          {{ added ? 'Ditambahkan' : 'Tambah' }}
        </button>
      </div>
    </div>
    <!-- Size guide modal -->
    <Teleport to="body">
      <div
        v-if="sizeGuideOpen && product?.sizeGuideUrl"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm"
        @click.self="sizeGuideOpen = false"
      >
        <div class="w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
          <div class="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p class="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
                Panduan ukuran
              </p>
              <p class="mt-0.5 text-sm font-semibold">{{ product.name }}</p>
            </div>
            <button class="icon-btn size-10" aria-label="Tutup panduan ukuran" @click="sizeGuideOpen = false">
              <X class="size-5" />
            </button>
          </div>
          <div class="max-h-[70vh] overflow-auto bg-[#e0e0e0] p-3">
            <img
              :src="product.sizeGuideUrl"
              :alt="`Panduan ukuran ${product.name}`"
              class="mx-auto w-full max-w-xl rounded-2xl"
            />
          </div>
          <p class="border-t border-line px-4 py-2.5 text-[10.5px] text-muted">
            Ukuran dalam cm. Toleransi produksi ±1–2 cm.
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>
