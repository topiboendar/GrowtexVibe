<script setup lang="ts">
import { FwbModal } from 'flowbite-vue'
import { Loader2, Package, Pencil, Plus, Search, Trash2 } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'
import ProductVisual from '@/components/ProductVisual.vue'
import {
  CATEGORIES,
  COLOR_SWATCHES,
  colorImage,
  formatIDR,
  productsApi,
  SIZE_OPTIONS,
  type CategoryId,
  type Product,
  type ProductColor,
  type ProductInput,
} from '@/api'

interface FormState {
  id: string | null
  name: string
  category: CategoryId
  price: number
  compareAtPrice: number | null
  stock: number
  material: string
  weight: string
  description: string
  care: string
  colors: ProductColor[]
  sizes: string[]
}

function emptyForm(): FormState {
  return {
    id: null,
    name: '',
    category: 'kaos',
    price: 65000,
    compareAtPrice: null,
    stock: 0,
    material: 'Cotton Combed 30s',
    weight: '150 gsm',
    description: '',
    care: 'Cuci mesin suhu dingin, jangan pakai pemutih.',
    colors: [COLOR_SWATCHES[0]!],
    sizes: ['S', 'M', 'L', 'XL'],
  }
}

const products = ref<Product[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const categoryFilter = ref<CategoryId | 'all'>('all')

const formOpen = ref(false)
const form = reactive<FormState>(emptyForm())
const errors = reactive<Record<string, string>>({})
const formError = ref('')

const confirmOpen = ref(false)
const target = ref<Product | null>(null)

const stats = computed(() => {
  const totalStock = products.value.reduce((sum, product) => sum + product.stock, 0)
  const inventoryValue = products.value.reduce((sum, product) => sum + product.stock * product.price, 0)
  const categories = new Set(products.value.map((product) => product.category))

  return [
    { label: 'Total produk', value: String(products.value.length), hint: `${categories.size} kategori` },
    { label: 'Total stok', value: `${totalStock} pcs`, hint: 'seluruh varian' },
    { label: 'Nilai inventori', value: formatIDR(inventoryValue), hint: 'harga jual' },
    {
      label: 'Stok rendah',
      value: String(products.value.filter((product) => product.stock < 80).length),
      hint: 'di bawah 80 pcs',
    },
  ]
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return products.value.filter((product) => {
    const matchCategory = categoryFilter.value === 'all' || product.category === categoryFilter.value
    const matchTerm =
      !term ||
      product.name.toLowerCase().includes(term) ||
      product.material.toLowerCase().includes(term)
    return matchCategory && matchTerm
  })
})

function categoryLabel(id: CategoryId) {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id
}

async function load() {
  loading.value = true
  try {
    products.value = await productsApi.list()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  Object.assign(form, emptyForm())
  Object.keys(errors).forEach((key) => delete errors[key])
  formError.value = ''
  formOpen.value = true
}

function openEdit(product: Product) {
  Object.assign(form, {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    stock: product.stock,
    material: product.material,
    weight: product.weight,
    description: product.description,
    care: product.care,
    colors: product.colors.map((color) => ({ ...color })),
    sizes: [...product.sizes],
  })
  Object.keys(errors).forEach((key) => delete errors[key])
  formError.value = ''
  formOpen.value = true
}

function toggleColor(color: ProductColor) {
  const index = form.colors.findIndex((item) => item.hex === color.hex)
  if (index >= 0) form.colors.splice(index, 1)
  else form.colors.push({ ...color })
}

function toggleSize(size: string) {
  const index = form.sizes.indexOf(size)
  if (index >= 0) form.sizes.splice(index, 1)
  else form.sizes.push(size)
}

function isColorActive(hex: string) {
  return form.colors.some((color) => color.hex.toLowerCase() === hex.toLowerCase())
}

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (form.name.trim().length < 3) errors.name = 'Nama produk minimal 3 karakter.'
  if (!form.price || form.price < 1000) errors.price = 'Harga minimal Rp1.000.'
  if (form.compareAtPrice && form.compareAtPrice <= form.price) {
    errors.compareAtPrice = 'Harga coret harus lebih besar dari harga jual.'
  }
  if (form.stock < 0) errors.stock = 'Stok tidak boleh negatif.'
  if (form.colors.length === 0) errors.colors = 'Pilih minimal satu warna.'
  if (form.sizes.length === 0) errors.sizes = 'Pilih minimal satu ukuran.'
  if (form.description.trim().length < 20) errors.description = 'Deskripsi minimal 20 karakter.'

  return Object.keys(errors).length === 0
}

async function save() {
  formError.value = ''
  if (!validate()) return

  saving.value = true
  try {
    const payload: ProductInput = {
      name: form.name.trim(),
      category: form.category,
      price: form.price,
      compareAtPrice: form.compareAtPrice ?? undefined,
      stock: form.stock,
      material: form.material.trim(),
      weight: form.weight.trim(),
      description: form.description.trim(),
      care: form.care.trim(),
      colors: form.colors.map((color) => ({ ...color })),
      sizes: [...form.sizes],
    }

    if (form.id) {
      const updated = await productsApi.update(form.id, payload)
      const index = products.value.findIndex((product) => product.id === form.id)
      if (index >= 0) products.value[index] = updated
    } else {
      const created = await productsApi.create(payload)
      products.value.unshift(created)
    }

    formOpen.value = false
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Gagal menyimpan produk.'
  } finally {
    saving.value = false
  }
}

function askDelete(product: Product) {
  target.value = product
  confirmOpen.value = true
}

async function confirmDelete() {
  if (!target.value) return
  deleting.value = true
  try {
    await productsApi.remove(target.value.id)
    products.value = products.value.filter((product) => product.id !== target.value?.id)
    confirmOpen.value = false
    target.value = null
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="eyebrow">Katalog</p>
        <h1 class="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Produk</h1>
        <p class="mt-1 text-[12.5px] text-muted">
          Atur harga, stok, warna, dan ukuran yang tampil di toko.
        </p>
      </div>

      <button class="btn btn-primary btn-sm" @click="openCreate">
        <Plus class="size-3.5" /> Tambah produk
      </button>
    </div>

    <!-- Stats -->
    <div class="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      <div v-for="stat in stats" :key="stat.label" class="rounded-2xl border border-line bg-surface p-3.5">
        <p class="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">{{ stat.label }}</p>
        <p class="mt-1.5 truncate text-lg font-semibold tracking-tight">{{ stat.value }}</p>
        <p class="mt-0.5 text-[10px] text-muted">{{ stat.hint }}</p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div class="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
        <button class="chip shrink-0" :class="categoryFilter === 'all' ? 'chip-active' : ''" @click="categoryFilter = 'all'">
          Semua
        </button>
        <button
          v-for="category in CATEGORIES"
          :key="category.id"
          class="chip shrink-0"
          :class="categoryFilter === category.id ? 'chip-active' : ''"
          @click="categoryFilter = category.id"
        >
          {{ category.label }}
        </button>
      </div>

      <div class="relative w-full sm:max-w-xs">
        <Search class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
        <input v-model="search" type="search" placeholder="Cari produk…" class="field pl-10" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mt-4 space-y-2">
      <div v-for="n in 4" :key="n" class="skeleton h-20" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="filtered.length === 0"
      class="mt-4 flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center"
    >
      <span class="flex size-12 items-center justify-center rounded-full bg-cream text-muted">
        <Package class="size-5" />
      </span>
      <h2 class="mt-3 text-sm font-semibold">Tidak ada produk</h2>
      <p class="mt-1 max-w-xs text-[12px] text-muted">
        Ubah filter pencarian atau tambahkan produk baru.
      </p>
      <button class="btn btn-outline btn-sm mt-4" @click="openCreate">Tambah produk</button>
    </div>

    <template v-else>
      <!-- Mobile cards -->
      <div class="mt-4 space-y-2.5 lg:hidden">
        <div v-for="product in filtered" :key="product.id" class="rounded-2xl border border-line bg-surface p-3">
          <div class="flex gap-3">
            <div class="size-16 shrink-0 overflow-hidden rounded-xl bg-[#e0e0e0]">
              <ProductVisual :src="colorImage(product.colors[0], 'front')" :alt="product.name" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-[13px] font-semibold">{{ product.name }}</p>
              <p class="text-[11px] text-muted">{{ categoryLabel(product.category) }} · {{ product.weight }}</p>
              <div class="mt-1 flex items-center gap-2">
                <p class="text-[12.5px] font-semibold">{{ formatIDR(product.price) }}</p>
                <span class="text-[10.5px] text-muted">· stok {{ product.stock }}</span>
              </div>
            </div>
          </div>
          <div class="mt-2.5 flex gap-2 border-t border-line pt-2.5">
            <button class="btn btn-outline btn-sm flex-1" @click="openEdit(product)">
              <Pencil class="size-3.5" /> Edit
            </button>
            <button class="btn btn-ghost btn-sm text-danger" @click="askDelete(product)">
              <Trash2 class="size-3.5" /> Hapus
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop table -->
      <div class="mt-4 hidden overflow-hidden rounded-2xl border border-line bg-surface lg:block">
        <table class="w-full text-left text-[12.5px]">
          <thead class="border-b border-line bg-canvas/60 text-[10px] tracking-[0.1em] text-muted uppercase">
            <tr>
              <th class="px-4 py-3 font-semibold">Produk</th>
              <th class="px-4 py-3 font-semibold">Kategori</th>
              <th class="px-4 py-3 font-semibold">Harga</th>
              <th class="px-4 py-3 font-semibold">Stok</th>
              <th class="px-4 py-3 font-semibold">Varian</th>
              <th class="px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="product in filtered" :key="product.id" class="transition-colors hover:bg-canvas/60">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="size-11 shrink-0 overflow-hidden rounded-xl bg-[#e0e0e0]">
                    <ProductVisual :src="colorImage(product.colors[0], 'front')" :alt="product.name" />
                  </div>
                  <div>
                    <p class="font-medium">{{ product.name }}</p>
                    <p class="text-[11px] text-muted">{{ product.weight }} · {{ product.material }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-muted">{{ categoryLabel(product.category) }}</td>
              <td class="px-4 py-3">
                <p class="font-semibold">{{ formatIDR(product.price) }}</p>
                <p v-if="product.compareAtPrice" class="text-[11px] text-muted line-through">
                  {{ formatIDR(product.compareAtPrice) }}
                </p>
              </td>
              <td class="px-4 py-3">
                <span :class="product.stock < 80 ? 'font-semibold text-warn' : 'text-muted'">
                  {{ product.stock }} pcs
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <span
                    v-for="color in product.colors.slice(0, 4)"
                    :key="color.hex"
                    class="size-3.5 overflow-hidden rounded-full border border-ink/10"
                    :style="{ backgroundColor: color.hex }"
                    :title="color.name"
                  >
                    <img
                      v-if="color.swatchImage"
                      :src="color.swatchImage"
                      alt=""
                      class="size-full object-cover"
                      loading="lazy"
                    />
                  </span>
                  <span v-if="product.colors.length > 4" class="text-[10px] text-muted">
                    +{{ product.colors.length - 4 }}
                  </span>
                  <span class="mx-1 size-1 rounded-full bg-line" />
                  <span class="text-[11px] text-muted">{{ product.sizes.length }} ukuran</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button class="rounded-lg p-2 text-muted hover:bg-cream hover:text-ink" aria-label="Edit" @click="openEdit(product)">
                    <Pencil class="size-4" />
                  </button>
                  <button class="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-danger" aria-label="Hapus" @click="askDelete(product)">
                    <Trash2 class="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Form modal -->
    <FwbModal v-if="formOpen" size="2xl" @close="formOpen = false">
      <template #header>
        <div>
          <p class="text-[10px] font-semibold tracking-[0.14em] text-gray-500 uppercase">
            {{ form.id ? 'Edit produk' : 'Produk baru' }}
          </p>
          <p class="mt-0.5 text-sm font-semibold">{{ form.name || 'Tanpa nama' }}</p>
        </div>
      </template>

      <template #body>
        <div class="grid gap-3.5 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="label" for="p-name">Nama produk</label>
            <input id="p-name" v-model="form.name" type="text" class="field" :class="errors.name ? 'field-error' : ''" />
            <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
          </div>

          <div>
            <label class="label" for="p-category">Kategori</label>
            <select id="p-category" v-model="form.category" class="field">
              <option v-for="category in CATEGORIES" :key="category.id" :value="category.id">
                {{ category.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="label" for="p-weight">Berat bahan</label>
            <input id="p-weight" v-model="form.weight" type="text" placeholder="150 gsm" class="field" />
          </div>

          <div>
            <label class="label" for="p-price">Harga jual</label>
            <input
              id="p-price"
              v-model.number="form.price"
              type="number"
              min="0"
              step="1000"
              class="field"
              :class="errors.price ? 'field-error' : ''"
            />
            <p v-if="errors.price" class="error-text">{{ errors.price }}</p>
          </div>

          <div>
            <label class="label" for="p-compare">Harga coret <span class="font-normal normal-case">(opsional)</span></label>
            <input
              id="p-compare"
              v-model.number="form.compareAtPrice"
              type="number"
              min="0"
              step="1000"
              class="field"
              :class="errors.compareAtPrice ? 'field-error' : ''"
            />
            <p v-if="errors.compareAtPrice" class="error-text">{{ errors.compareAtPrice }}</p>
          </div>

          <div>
            <label class="label" for="p-stock">Stok</label>
            <input id="p-stock" v-model.number="form.stock" type="number" min="0" class="field" />
          </div>

          <div>
            <label class="label" for="p-material">Material</label>
            <input id="p-material" v-model="form.material" type="text" class="field" />
          </div>

          <div class="sm:col-span-2">
            <label class="label">Warna</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in COLOR_SWATCHES"
                :key="color.hex"
                type="button"
                class="flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors"
                :class="isColorActive(color.hex) ? 'border-ink bg-ink text-white' : 'border-line text-muted hover:border-ink/30'"
                @click="toggleColor(color)"
              >
                <span class="size-3 overflow-hidden rounded-full border border-black/10" :style="{ backgroundColor: color.hex }">
                  <img
                    v-if="color.swatchImage"
                    :src="color.swatchImage"
                    alt=""
                    class="size-full object-cover"
                    loading="lazy"
                  />
                </span>
                {{ color.name }}
              </button>
            </div>
            <p v-if="errors.colors" class="error-text">{{ errors.colors }}</p>
          </div>

          <div class="sm:col-span-2">
            <label class="label">Ukuran</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="size in SIZE_OPTIONS"
                :key="size"
                type="button"
                class="min-w-11 rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors"
                :class="form.sizes.includes(size) ? 'border-ink bg-ink text-white' : 'border-line text-muted hover:border-ink/30'"
                @click="toggleSize(size)"
              >
                {{ size }}
              </button>
            </div>
            <p v-if="errors.sizes" class="error-text">{{ errors.sizes }}</p>
          </div>

          <div class="sm:col-span-2">
            <label class="label" for="p-desc">Deskripsi</label>
            <textarea
              id="p-desc"
              v-model="form.description"
              rows="3"
              class="field resize-none"
              :class="errors.description ? 'field-error' : ''"
            />
            <p v-if="errors.description" class="error-text">{{ errors.description }}</p>
          </div>

          <div class="sm:col-span-2">
            <label class="label" for="p-care">Perawatan</label>
            <textarea id="p-care" v-model="form.care" rows="2" class="field resize-none" />
          </div>

          <p
            v-if="formError"
            class="sm:col-span-2 rounded-2xl border border-danger/20 bg-red-50 px-3.5 py-2.5 text-[11.5px] font-medium text-danger"
          >
            {{ formError }}
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full items-center justify-end gap-2">
          <button class="btn btn-outline btn-sm" @click="formOpen = false">Batal</button>
          <button class="btn btn-primary btn-sm" :disabled="saving" @click="save">
            <Loader2 v-if="saving" class="size-3.5 animate-spin" />
            {{ form.id ? 'Simpan perubahan' : 'Tambah produk' }}
          </button>
        </div>
      </template>
    </FwbModal>

    <!-- Delete confirm -->
    <FwbModal v-if="confirmOpen && target" size="md" @close="confirmOpen = false">
      <template #header>
        <p class="text-sm font-semibold">Hapus produk</p>
      </template>
      <template #body>
        <p class="text-[13px] leading-relaxed text-gray-600">
          Produk <span class="font-semibold text-gray-900">{{ target.name }}</span> akan dihapus dari
          katalog. Tindakan ini tidak bisa dibatalkan.
        </p>
      </template>
      <template #footer>
        <div class="flex w-full items-center justify-end gap-2">
          <button class="btn btn-outline btn-sm" @click="confirmOpen = false">Batal</button>
          <button class="btn btn-sm bg-danger text-white hover:bg-danger/90" :disabled="deleting" @click="confirmDelete">
            <Loader2 v-if="deleting" class="size-3.5 animate-spin" />
            Hapus produk
          </button>
        </div>
      </template>
    </FwbModal>
  </div>
</template>
