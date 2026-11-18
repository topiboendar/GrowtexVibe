<script setup lang="ts">
import {
  CheckCircle2,
  ChevronLeft,
  Copy,
  CircleDot,
  MapPin,
  Printer,
  Truck,
  Wallet,
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import GarmentVisual from '@/components/GarmentVisual.vue'
import {
  dtfDescription,
  formatDate,
  formatIDR,
  orderStatusMeta,
  ordersApi,
  paymentMeta,
  type Order,
  type OrderStatus,
} from '@/api'

const route = useRoute()

const order = ref<Order | null>(null)
const loading = ref(true)
const notFound = ref(false)
const copied = ref(false)

const timeline: OrderStatus[] = ['pending', 'processing', 'printing', 'shipped', 'completed']

const activeStep = computed(() => {
  if (!order.value) return -1
  return timeline.indexOf(order.value.status)
})

const isCancelled = computed(() => order.value?.status === 'cancelled')

const bankAccount = {
  bank: 'BCA',
  number: '1234567890',
  holder: 'PT Growtex Nusantara',
}

async function load(id: string) {
  loading.value = true
  notFound.value = false
  try {
    order.value = await ordersApi.get(id)
  } catch {
    notFound.value = true
    order.value = null
  } finally {
    loading.value = false
  }
}

function copyAccount() {
  if (!navigator.clipboard) return
  navigator.clipboard.writeText(bankAccount.number).then(() => {
    copied.value = true
    window.setTimeout(() => (copied.value = false), 2000)
  })
}

function printInvoice() {
  window.print()
}

onMounted(() => load(String(route.params.id)))

watch(
  () => route.params.id,
  (id) => {
    if (id) load(String(id))
  },
)
</script>

<template>
  <div class="container-page pt-6 pb-16 print:max-w-none print:pt-0">
    <div class="no-print flex items-center justify-between gap-3">
      <RouterLink :to="{ name: 'home' }" class="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted hover:text-ink">
        <ChevronLeft class="size-4" /> Kembali ke toko
      </RouterLink>
      <button v-if="order" class="btn btn-outline btn-sm" @click="printInvoice">
        <Printer class="size-3.5" /> Cetak invoice
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mt-6 space-y-3">
      <div class="skeleton h-28" />
      <div class="skeleton h-64" />
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="mt-10 flex flex-col items-center py-16 text-center">
      <span class="badge">404</span>
      <h1 class="mt-3 text-xl font-semibold">Invoice tidak ditemukan</h1>
      <p class="mt-1 max-w-sm text-sm text-muted">
        Periksa kembali tautan invoice kamu, atau hubungi admin melalui WhatsApp.
      </p>
      <RouterLink :to="{ name: 'home' }" class="btn btn-primary mt-5">Kembali ke beranda</RouterLink>
    </div>

    <template v-else-if="order">
      <!-- Header -->
      <section class="mt-5 overflow-hidden rounded-3xl border border-line bg-surface print-plain">
        <div class="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div class="flex items-start gap-3">
            <span
              class="flex size-11 shrink-0 items-center justify-center rounded-full"
              :class="isCancelled ? 'bg-red-50 text-danger' : 'bg-accent-soft text-accent'"
            >
              <CheckCircle2 class="size-5" />
            </span>
            <div>
              <p class="eyebrow">Invoice</p>
              <h1 class="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
                {{ isCancelled ? 'Pesanan dibatalkan' : 'Terima kasih, pesanan diterima!' }}
              </h1>
              <p class="mt-1 text-[12px] text-muted">
                {{ order.customer.name }} · {{ formatDate(order.createdAt) }}
              </p>
            </div>
          </div>

          <div class="sm:text-right">
            <p class="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">Nomor invoice</p>
            <p class="mt-1 font-mono text-sm font-semibold">{{ order.invoiceNumber }}</p>
            <span class="mt-2 inline-flex" :class="orderStatusMeta[order.status].className">
              {{ orderStatusMeta[order.status].label }}
            </span>
          </div>
        </div>

        <!-- Timeline -->
        <div v-if="!isCancelled" class="border-t border-line bg-canvas/60 px-5 py-4 sm:px-6">
          <ol class="flex items-center gap-1">
            <li v-for="(step, index) in timeline" :key="step" class="flex flex-1 items-center gap-1 last:flex-none">
              <div class="flex flex-col items-center gap-1.5">
                <span
                  class="flex size-7 items-center justify-center rounded-full border transition-colors"
                  :class="
                    index <= activeStep
                      ? 'border-accent bg-accent text-white'
                      : 'border-line bg-surface text-muted'
                  "
                >
                  <CheckCircle2 v-if="index < activeStep" class="size-3.5" />
                  <CircleDot v-else class="size-3.5" />
                </span>
                <span
                  class="hidden text-[9.5px] font-medium whitespace-nowrap sm:block"
                  :class="index <= activeStep ? 'text-ink' : 'text-muted'"
                >
                  {{ orderStatusMeta[step].label }}
                </span>
              </div>
              <span
                v-if="index < timeline.length - 1"
                class="mb-4 h-px flex-1 rounded-full sm:mb-5"
                :class="index < activeStep ? 'bg-accent' : 'bg-line'"
              />
            </li>
          </ol>
          <p class="mt-2 text-[11px] text-muted">{{ orderStatusMeta[order.status].hint }}</p>
        </div>
      </section>

      <div class="mt-4 grid items-start gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <!-- Items -->
        <section class="min-w-0 rounded-3xl border border-line bg-surface print-plain">
          <header class="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
            <h2 class="text-[13px] font-semibold">Detail item</h2>
            <span class="text-[11px] text-muted">{{ order.items.length }} produk</span>
          </header>

          <ul class="divide-y divide-line">
            <li v-for="item in order.items" :key="item.key" class="flex gap-3 px-4 py-3.5 sm:px-5">
              <div class="size-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                <GarmentVisual :color="item.colorHex" :type="item.category" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="truncate text-[13px] font-semibold">{{ item.name }}</p>
                    <p class="mt-0.5 text-[11px] text-muted">{{ item.color }} · {{ item.size }}</p>
                    <p v-if="item.dtf?.enabled" class="mt-1 text-[10.5px] font-medium text-accent">
                      {{ dtfDescription(item.dtf) }}
                      <span v-if="item.dtf.fileName" class="text-muted"> · {{ item.dtf.fileName }}</span>
                    </p>
                  </div>
                  <div class="shrink-0 text-right">
                    <p class="text-[13px] font-semibold">{{ formatIDR(item.price * item.qty) }}</p>
                    <p class="text-[10.5px] text-muted">{{ item.qty }} × {{ formatIDR(item.price) }}</p>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <div class="border-t border-line px-4 py-4 sm:px-5">
            <dl class="space-y-1.5 text-[12.5px]">
              <div class="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd class="text-ink">{{ formatIDR(order.subtotal) }}</dd>
              </div>
              <div v-if="order.dtfTotal > 0" class="flex justify-between text-muted">
                <dt>Termasuk sablon DTF</dt>
                <dd>{{ formatIDR(order.dtfTotal) }}</dd>
              </div>
              <div class="flex justify-between text-muted">
                <dt>Ongkos kirim</dt>
                <dd class="text-ink">{{ order.shipping === 0 ? 'Gratis' : formatIDR(order.shipping) }}</dd>
              </div>
              <div class="flex justify-between border-t border-line pt-2 text-[15px] font-semibold">
                <dt>Total bayar</dt>
                <dd>{{ formatIDR(order.total) }}</dd>
              </div>
            </dl>
          </div>
        </section>

        <!-- Side -->
        <div class="min-w-0 space-y-4">
          <!-- Payment -->
          <section class="rounded-3xl border border-line bg-surface p-4 print-plain sm:p-5">
            <div class="flex items-center gap-2">
              <Wallet class="size-4 text-accent" />
              <h2 class="text-[13px] font-semibold">{{ paymentMeta[order.payment].label }}</h2>
            </div>

            <div v-if="order.payment === 'transfer'" class="mt-3 rounded-2xl bg-cream/70 p-3.5">
              <p class="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
                {{ bankAccount.bank }}
              </p>
              <div class="mt-1 flex items-center justify-between gap-2">
                <p class="font-mono text-[15px] font-semibold tracking-wide">{{ bankAccount.number }}</p>
                <button class="no-print rounded-lg p-1.5 text-muted hover:bg-surface hover:text-ink" aria-label="Salin nomor rekening" @click="copyAccount">
                  <Copy class="size-3.5" />
                </button>
              </div>
              <p class="mt-1 text-[11px] text-muted">a/n {{ bankAccount.holder }}</p>
              <p v-if="copied" class="mt-1 text-[10.5px] font-medium text-accent">Nomor rekening disalin.</p>
              <p class="mt-2.5 text-[10.5px] leading-relaxed text-muted">
                Cantumkan nomor invoice&nbsp;<span class="font-semibold text-ink">{{ order.invoiceNumber }}</span>&nbsp;pada
                berita transfer.
              </p>
            </div>

            <div v-else-if="order.payment === 'qris'" class="mt-3 flex flex-col items-center rounded-2xl bg-cream/70 p-4">
              <div class="grid size-28 place-items-center rounded-xl border border-line bg-surface">
                <span class="text-[10px] font-semibold tracking-widest text-muted">QRIS</span>
              </div>
              <p class="mt-2 text-center text-[10.5px] text-muted">
                Placeholder QR. Di produksi, kode dibuat oleh payment gateway.
              </p>
            </div>

            <p v-else class="mt-3 rounded-2xl bg-cream/70 p-3.5 text-[11px] leading-relaxed text-muted">
              Siapkan pembayaran tunai saat kurir tiba. Pastikan nomor WhatsApp aktif untuk konfirmasi
              jadwal pengiriman.
            </p>
          </section>

          <!-- Shipping detail -->
          <section class="rounded-3xl border border-line bg-surface p-4 print-plain sm:p-5">
            <div class="flex items-center gap-2">
              <MapPin class="size-4 text-accent" />
              <h2 class="text-[13px] font-semibold">Alamat pengiriman</h2>
            </div>
            <div class="mt-3 space-y-0.5 text-[12px] leading-relaxed">
              <p class="font-semibold">{{ order.customer.name }}</p>
              <p class="text-muted">{{ order.customer.phone }}</p>
              <p v-if="order.customer.email" class="text-muted">{{ order.customer.email }}</p>
              <p class="mt-1.5 text-muted">
                {{ order.customer.address }}, {{ order.customer.city }}
                <span v-if="order.customer.postalCode"> {{ order.customer.postalCode }}</span>
              </p>
              <p v-if="order.customer.note" class="mt-2 rounded-xl bg-cream/70 px-2.5 py-2 text-[11px] text-muted">
                “{{ order.customer.note }}”
              </p>
            </div>
          </section>

          <!-- Help -->
          <section class="no-print rounded-3xl border border-line bg-surface p-4 sm:p-5">
            <div class="flex items-center gap-2">
              <Truck class="size-4 text-accent" />
              <h2 class="text-[13px] font-semibold">Butuh bantuan pesanan?</h2>
            </div>
            <p class="mt-2 text-[11.5px] leading-relaxed text-muted">
              Hubungi admin dengan menyertakan nomor invoice agar penanganan lebih cepat.
            </p>
            <a
              :href="`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo, saya ingin menanyakan invoice ${order.invoiceNumber}`)}`"
              target="_blank"
              rel="noopener"
              class="btn btn-outline btn-block btn-sm mt-3"
            >
              Chat admin
            </a>
          </section>
        </div>
      </div>

      <div class="no-print mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <RouterLink :to="{ name: 'home', hash: '#koleksi' }" class="btn btn-primary">
          Lanjut belanja
        </RouterLink>
        <RouterLink v-if="!order.customer.email" :to="{ name: 'register' }" class="btn btn-outline">
          Buat akun untuk riwayat pesanan
        </RouterLink>
      </div>
    </template>
  </div>
</template>
