<script setup lang="ts">
import { FwbModal } from 'flowbite-vue'
import {
  ArrowUpRight,
  ClipboardList,
  Loader2,
  RefreshCw,
  Search,
  Wallet,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ProductVisual from '@/components/ProductVisual.vue'
import {
  dtfDescription,
  formatDate,
  formatIDR,
  ORDER_STATUSES,
  orderStatusMeta,
  ordersApi,
  paymentMeta,
  type Order,
  type OrderStatus,
} from '@/api'

const orders = ref<Order[]>([])
const loading = ref(true)
const refreshing = ref(false)
const filter = ref<OrderStatus | 'all'>('all')
const search = ref('')
const selected = ref<Order | null>(null)
const updating = ref(false)
const errorMessage = ref('')

const stats = computed(() => {
  const list = orders.value
  const active = list.filter((order) =>
    ['pending', 'processing', 'printing'].includes(order.status),
  )
  const revenue = list
    .filter((order) => ['completed', 'shipped'].includes(order.status))
    .reduce((sum, order) => sum + order.total, 0)
  const items = list.reduce((sum, order) => sum + order.items.reduce((s, i) => s + i.qty, 0), 0)

  return [
    { label: 'Total pesanan', value: String(list.length), hint: 'semua waktu' },
    { label: 'Perlu diproses', value: String(active.length), hint: 'belum selesai' },
    { label: 'Omzet tercatat', value: formatIDR(revenue), hint: 'dikirim + selesai' },
    { label: 'Item terjual', value: String(items), hint: 'akumulasi pcs' },
  ]
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return orders.value.filter((order) => {
    const matchStatus = filter.value === 'all' || order.status === filter.value
    const matchTerm =
      !term ||
      order.invoiceNumber.toLowerCase().includes(term) ||
      order.customer.name.toLowerCase().includes(term) ||
      order.customer.city.toLowerCase().includes(term)
    return matchStatus && matchTerm
  })
})

const statusCounts = computed(() => {
  const counts: Record<string, number> = { all: orders.value.length }
  ORDER_STATUSES.forEach((status) => {
    counts[status] = orders.value.filter((order) => order.status === status).length
  })
  return counts
})

async function load(silent = false) {
  if (silent) refreshing.value = true
  else loading.value = true

  try {
    orders.value = await ordersApi.list()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Gagal memuat pesanan.'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function changeStatus(order: Order, status: OrderStatus) {
  if (order.status === status || updating.value) return
  updating.value = true
  errorMessage.value = ''

  try {
    const updated = await ordersApi.updateStatus(order.id, status)
    const index = orders.value.findIndex((item) => item.id === order.id)
    if (index >= 0) orders.value[index] = updated
    selected.value = updated
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Gagal memperbarui status.'
  } finally {
    updating.value = false
  }
}

onMounted(() => load())
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="eyebrow">Operasional</p>
        <h1 class="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Pesanan</h1>
        <p class="mt-1 text-[12.5px] text-muted">
          Pantau antrean produksi dan perbarui status pengiriman.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <RouterLink :to="{ name: 'admin-products' }" class="btn btn-outline btn-sm">
          Kelola produk
          <ArrowUpRight class="size-3.5" />
        </RouterLink>
        <button class="btn btn-ink btn-sm" :disabled="refreshing" @click="load(true)">
          <RefreshCw class="size-3.5" :class="refreshing ? 'animate-spin' : ''" />
          Muat ulang
        </button>
      </div>
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
        <button
          class="chip shrink-0"
          :class="filter === 'all' ? 'chip-active' : ''"
          @click="filter = 'all'"
        >
          Semua
          <span class="text-[10px] opacity-70">{{ statusCounts.all ?? 0 }}</span>
        </button>
        <button
          v-for="status in ORDER_STATUSES"
          :key="status"
          class="chip shrink-0"
          :class="filter === status ? 'chip-active' : ''"
          @click="filter = status"
        >
          {{ orderStatusMeta[status].label }}
          <span class="text-[10px] opacity-70">{{ statusCounts[status] ?? 0 }}</span>
        </button>
      </div>

      <div class="relative w-full sm:max-w-xs">
        <Search class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
        <input v-model="search" type="search" placeholder="Cari invoice / nama / kota…" class="field pl-10" />
      </div>
    </div>

    <p
      v-if="errorMessage"
      class="mt-3 rounded-2xl border border-danger/20 bg-red-50 px-3.5 py-2.5 text-[11.5px] font-medium text-danger"
    >
      {{ errorMessage }}
    </p>

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
        <ClipboardList class="size-5" />
      </span>
      <h2 class="mt-3 text-sm font-semibold">Belum ada pesanan</h2>
      <p class="mt-1 max-w-xs text-[12px] text-muted">
        Pesanan baru akan muncul di sini secara otomatis.
      </p>
    </div>

    <template v-else>
      <!-- Mobile cards -->
      <div class="mt-4 space-y-2.5 md:hidden">
        <button
          v-for="order in filtered"
          :key="order.id"
          class="w-full rounded-2xl border border-line bg-surface p-3.5 text-left transition-colors active:bg-cream/50"
          @click="selected = order"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-mono text-[11.5px] font-semibold">{{ order.invoiceNumber }}</p>
              <p class="mt-0.5 truncate text-[13px] font-semibold">{{ order.customer.name }}</p>
              <p class="truncate text-[11px] text-muted">
                {{ order.customer.city }} · {{ order.items.length }} produk
              </p>
            </div>
            <span :class="orderStatusMeta[order.status].className">
              {{ orderStatusMeta[order.status].label }}
            </span>
          </div>
          <div class="mt-2.5 flex items-end justify-between border-t border-line pt-2.5">
            <p class="text-[10.5px] text-muted">{{ formatDate(order.createdAt) }}</p>
            <p class="text-[13px] font-semibold">{{ formatIDR(order.total) }}</p>
          </div>
        </button>
      </div>

      <!-- Desktop table -->
      <div class="mt-4 hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
        <table class="w-full text-left text-[12.5px]">
          <thead class="border-b border-line bg-canvas/60 text-[10px] tracking-[0.1em] text-muted uppercase">
            <tr>
              <th class="px-4 py-3 font-semibold">Invoice</th>
              <th class="px-4 py-3 font-semibold">Pelanggan</th>
              <th class="hidden px-4 py-3 font-semibold lg:table-cell">Tanggal</th>
              <th class="px-4 py-3 font-semibold">Item</th>
              <th class="px-4 py-3 font-semibold">Total</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr
              v-for="order in filtered"
              :key="order.id"
              class="cursor-pointer transition-colors hover:bg-canvas/70"
              @click="selected = order"
            >
              <td class="px-4 py-3 font-mono text-[11.5px] font-semibold">{{ order.invoiceNumber }}</td>
              <td class="px-4 py-3">
                <p class="font-medium">{{ order.customer.name }}</p>
                <p class="text-[11px] text-muted">{{ order.customer.city }}</p>
              </td>
              <td class="hidden px-4 py-3 text-muted lg:table-cell">{{ formatDate(order.createdAt) }}</td>
              <td class="px-4 py-3 text-muted">{{ order.items.length }}</td>
              <td class="px-4 py-3 font-semibold">{{ formatIDR(order.total) }}</td>
              <td class="px-4 py-3">
                <span :class="orderStatusMeta[order.status].className">
                  {{ orderStatusMeta[order.status].label }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <span class="text-[11px] font-medium text-muted">Detail</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Detail modal -->
    <FwbModal v-if="selected" size="lg" @close="selected = null">
      <template #header>
        <div>
          <p class="text-[10px] font-semibold tracking-[0.14em] text-gray-500 uppercase">Detail pesanan</p>
          <p class="mt-0.5 font-mono text-sm font-semibold">{{ selected.invoiceNumber }}</p>
        </div>
      </template>

      <template #body>
        <div class="space-y-4">
          <div class="grid gap-2.5 sm:grid-cols-2">
            <div class="rounded-2xl border border-line p-3">
              <p class="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">Pelanggan</p>
              <p class="mt-1 text-[13px] font-semibold">{{ selected.customer.name }}</p>
              <p class="text-[11.5px] text-muted">{{ selected.customer.phone }}</p>
              <p v-if="selected.customer.email" class="text-[11.5px] text-muted">
                {{ selected.customer.email }}
              </p>
            </div>
            <div class="rounded-2xl border border-line p-3">
              <p class="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">Pengiriman</p>
              <p class="mt-1 text-[11.5px] leading-relaxed text-muted">
                {{ selected.customer.address }}, {{ selected.customer.city }}
                <span v-if="selected.customer.postalCode"> {{ selected.customer.postalCode }}</span>
              </p>
              <p class="mt-1 text-[11px] text-muted">
                {{ paymentMeta[selected.payment].label }} · {{ formatDate(selected.createdAt) }}
              </p>
            </div>
          </div>

          <div v-if="selected.customer.note" class="rounded-2xl bg-cream/60 px-3 py-2.5 text-[11.5px] text-muted">
            <span class="font-semibold text-ink">Catatan: </span>{{ selected.customer.note }}
          </div>

          <ul class="divide-y divide-line rounded-2xl border border-line">
            <li v-for="item in selected.items" :key="item.key" class="flex gap-3 p-3">
              <div class="size-14 shrink-0 overflow-hidden rounded-xl bg-[#e0e0e0]">
                <ProductVisual :src="item.image" :alt="item.name" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-[12.5px] font-semibold">{{ item.name }}</p>
                <p class="text-[11px] text-muted">{{ item.color }} · {{ item.size }} · {{ item.qty }}x</p>
                <p v-if="item.dtf?.enabled" class="mt-0.5 text-[10.5px] font-medium text-accent">
                  {{ dtfDescription(item.dtf) }}
                  <span v-if="item.dtf.fileName" class="text-muted"> · {{ item.dtf.fileName }}</span>
                </p>
              </div>
              <p class="shrink-0 text-[12px] font-semibold">{{ formatIDR(item.price * item.qty) }}</p>
            </li>
          </ul>

          <div class="flex items-center justify-between rounded-2xl bg-ink px-3.5 py-3 text-white">
            <span class="flex items-center gap-2 text-[12px] font-medium">
              <Wallet class="size-4 opacity-70" /> Total
            </span>
            <span class="text-sm font-semibold">{{ formatIDR(selected.total) }}</span>
          </div>

          <div>
            <p class="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">Perbarui status</p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <button
                v-for="status in ORDER_STATUSES"
                :key="status"
                class="chip"
                :class="selected.status === status ? 'chip-active' : ''"
                :disabled="updating"
                @click="changeStatus(selected, status)"
              >
                <Loader2
                  v-if="updating && selected.status !== status"
                  class="hidden size-3"
                />
                {{ orderStatusMeta[status].label }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <a
              :href="`https://wa.me/${selected.customer.phone.replace(/[^0-9]/g, '')}`"
              target="_blank"
              rel="noopener"
              class="text-[11.5px] font-medium text-muted underline underline-offset-4 hover:text-ink"
            >
              Hubungi pelanggan
            </a>
            <RouterLink
              :to="{ name: 'invoice', params: { id: selected.id } }"
              target="_blank"
              class="text-[11.5px] font-medium text-muted underline underline-offset-4 hover:text-ink"
            >
              Lihat invoice
            </RouterLink>
          </div>
          <button class="btn btn-outline btn-sm" @click="selected = null">Tutup</button>
        </div>
      </template>
    </FwbModal>
  </div>
</template>
