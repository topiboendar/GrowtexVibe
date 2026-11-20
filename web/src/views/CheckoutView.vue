<script setup lang="ts">
import { ArrowLeft, ArrowRight, Loader2, Lock, ShieldCheck, Truck } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import GarmentVisual from '@/components/GarmentVisual.vue'
import {
  dtfDescription,
  formatIDR,
  ordersApi,
  paymentMeta,
  type PaymentMethod,
} from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()

const submitting = ref(false)
const submitError = ref('')

const form = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  note: '',
})

const payment = ref<PaymentMethod>('transfer')
const errors = reactive<Record<string, string>>({})

const payments = Object.entries(paymentMeta) as Array<
  [PaymentMethod, { label: string; hint: string }]
>

const summary = computed(() => ({
  subtotal: cart.subtotal,
  shipping: cart.shipping,
  total: cart.total,
  dtf: cart.dtfTotal,
}))

onMounted(() => {
  if (auth.user) {
    form.name = form.name || auth.user.name
    form.email = form.email || auth.user.email
    form.phone = form.phone || auth.user.phone || ''
  }
})

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (!form.name.trim()) errors.name = 'Nama penerima wajib diisi.'
  if (!/^[0-9+\s-]{9,16}$/.test(form.phone.trim())) errors.phone = 'Nomor WhatsApp tidak valid.'
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Format email tidak valid.'
  if (form.address.trim().length < 10) errors.address = 'Alamat terlalu singkat, mohon lengkapi.'
  if (!form.city.trim()) errors.city = 'Kota/kabupaten wajib diisi.'

  return Object.keys(errors).length === 0
}

async function submitOrder() {
  if (submitting.value) return
  submitError.value = ''

  if (!validate()) {
    document.querySelector<HTMLElement>('.field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  submitting.value = true
  try {
    const order = await ordersApi.create({
      items: cart.items.map((item) => ({ ...item })),
      customer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim() || undefined,
        note: form.note.trim() || undefined,
      },
      payment: payment.value,
    })

    cart.clearCart()
    router.push({ name: 'invoice', params: { id: order.id } })
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'Gagal membuat pesanan.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container-page pt-6 pb-16 sm:pt-8">
    <div class="flex items-center gap-2">
      <RouterLink :to="{ name: 'home', hash: '#koleksi' }" class="icon-btn -ml-2 size-9">
        <ArrowLeft class="size-4" />
      </RouterLink>
      <div>
        <p class="eyebrow">Checkout</p>
        <h1 class="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Selesaikan pesanan</h1>
      </div>
    </div>

    <!-- Empty -->
    <div
      v-if="cart.isEmpty"
      class="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center"
    >
      <span class="flex size-14 items-center justify-center rounded-full bg-cream text-muted">
        <Truck class="size-6" />
      </span>
      <h2 class="mt-4 text-base font-semibold">Keranjangmu masih kosong</h2>
      <p class="mt-1 max-w-xs text-sm text-muted">
        Tambahkan produk terlebih dahulu, lalu kembali ke halaman checkout.
      </p>
      <RouterLink :to="{ name: 'home', hash: '#koleksi' }" class="btn btn-primary mt-5">
        Jelajahi koleksi
      </RouterLink>
    </div>

    <div v-else class="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
      <!-- Form -->
      <form class="min-w-0 space-y-4" novalidate @submit.prevent="submitOrder">
        <!-- Contact -->
        <section class="card p-4 sm:p-5">
          <div class="flex items-center gap-2">
            <span class="flex size-6 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">1</span>
            <h2 class="text-sm font-semibold tracking-tight">Informasi kontak</h2>
          </div>

          <div class="mt-4 grid gap-3.5 sm:grid-cols-2">
            <div>
              <label class="label" for="name">Nama penerima</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                placeholder="Nama lengkap"
                class="field"
                :class="errors.name ? 'field-error' : ''"
              />
              <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
            </div>

            <div>
              <label class="label" for="phone">Nomor WhatsApp</label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                placeholder="08xxxxxxxxxx"
                class="field"
                :class="errors.phone ? 'field-error' : ''"
              />
              <p v-if="errors.phone" class="error-text">{{ errors.phone }}</p>
            </div>

            <div class="sm:col-span-2">
              <label class="label" for="email">Email <span class="font-normal normal-case">(opsional)</span></label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="email@kamu.com"
                class="field"
                :class="errors.email ? 'field-error' : ''"
              />
              <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
            </div>
          </div>
        </section>

        <!-- Shipping -->
        <section class="card p-4 sm:p-5">
          <div class="flex items-center gap-2">
            <span class="flex size-6 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">2</span>
            <h2 class="text-sm font-semibold tracking-tight">Alamat pengiriman</h2>
          </div>

          <div class="mt-4 grid gap-3.5 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="label" for="address">Alamat lengkap</label>
              <textarea
                id="address"
                v-model="form.address"
                rows="3"
                autocomplete="street-address"
                placeholder="Jalan, nomor rumah, kelurahan, kecamatan"
                class="field resize-none"
                :class="errors.address ? 'field-error' : ''"
              />
              <p v-if="errors.address" class="error-text">{{ errors.address }}</p>
            </div>

            <div>
              <label class="label" for="city">Kota / kabupaten</label>
              <input
                id="city"
                v-model="form.city"
                type="text"
                autocomplete="address-level2"
                placeholder="Contoh: Jakarta Selatan"
                class="field"
                :class="errors.city ? 'field-error' : ''"
              />
              <p v-if="errors.city" class="error-text">{{ errors.city }}</p>
            </div>

            <div>
              <label class="label" for="postal">Kode pos</label>
              <input
                id="postal"
                v-model="form.postalCode"
                type="text"
                inputmode="numeric"
                autocomplete="postal-code"
                placeholder="12345"
                class="field"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="label" for="note">Catatan untuk penjual <span class="font-normal normal-case">(opsional)</span></label>
              <textarea
                id="note"
                v-model="form.note"
                rows="2"
                placeholder="Contoh: mohon packing rapi, titip di pos keamanan."
                class="field resize-none"
              />
            </div>
          </div>
        </section>

        <!-- Payment -->
        <section class="card p-4 sm:p-5">
          <div class="flex items-center gap-2">
            <span class="flex size-6 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">3</span>
            <h2 class="text-sm font-semibold tracking-tight">Metode pembayaran</h2>
          </div>

          <div class="mt-4 space-y-2">
            <label
              v-for="[key, meta] in payments"
              :key="key"
              class="flex cursor-pointer items-start gap-3 rounded-2xl border px-3.5 py-3 transition-colors"
              :class="
                payment === key ? 'border-accent bg-accent-soft/40' : 'border-line hover:border-ink/20'
              "
            >
              <input v-model="payment" type="radio" :value="key" class="mt-1 size-4 accent-[#1c3f35]" />
              <span class="min-w-0">
                <span class="block text-[13px] font-semibold">{{ meta.label }}</span>
                <span class="mt-0.5 block text-[11px] leading-relaxed text-muted">{{ meta.hint }}</span>
              </span>
            </label>
          </div>
        </section>

        <p v-if="submitError" class="rounded-2xl border border-danger/20 bg-red-50 px-4 py-3 text-xs font-medium text-danger">
          {{ submitError }}
        </p>

        <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="submitting">
          <Loader2 v-if="submitting" class="size-4 animate-spin" />
          <Lock v-else class="size-4" />
          {{ submitting ? 'Memproses pesanan…' : `Buat pesanan · ${formatIDR(summary.total)}` }}
        </button>

        <p class="text-center text-[10.5px] leading-relaxed text-muted">
          Dengan melanjutkan, kamu menyetujui syarat &amp; ketentuan GrowtexStore.
        </p>
      </form>

      <!-- Summary -->
      <aside class="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div class="card p-4 sm:p-5">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold tracking-tight">Ringkasan pesanan</h2>
            <span class="badge">{{ cart.totalItems }} item</span>
          </div>

          <ul class="mt-4 space-y-3">
            <li v-for="item in cart.items" :key="item.key" class="flex gap-3">
              <div class="size-16 shrink-0 overflow-hidden rounded-xl bg-cream">
                <GarmentVisual :color="item.colorHex" :type="item.category" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-[12.5px] font-semibold">{{ item.name }}</p>
                <p class="mt-0.5 text-[10.5px] text-muted">
                  {{ item.color }} · {{ item.size }} · {{ item.qty }}x
                </p>
                <p v-if="item.dtf?.enabled" class="mt-0.5 text-[10.5px] font-medium text-accent">
                  {{ dtfDescription(item.dtf) }}
                </p>
              </div>
              <p class="shrink-0 text-[12.5px] font-semibold">{{ formatIDR(item.price * item.qty) }}</p>
            </li>
          </ul>

          <div class="hairline my-4" />

          <dl class="space-y-1.5 text-[12.5px]">
            <div class="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd class="text-ink">{{ formatIDR(summary.subtotal) }}</dd>
            </div>
            <div v-if="summary.dtf > 0" class="flex justify-between text-muted">
              <dt>Termasuk sablon DTF</dt>
              <dd>{{ formatIDR(summary.dtf) }}</dd>
            </div>
            <div class="flex justify-between text-muted">
              <dt>Ongkos kirim</dt>
              <dd :class="summary.shipping === 0 ? 'font-semibold text-accent' : 'text-ink'">
                {{ summary.shipping === 0 ? 'Gratis' : formatIDR(summary.shipping) }}
              </dd>
            </div>
            <div class="flex justify-between border-t border-line pt-2 text-[15px] font-semibold">
              <dt>Total</dt>
              <dd>{{ formatIDR(summary.total) }}</dd>
            </div>
          </dl>

          <ul class="mt-4 space-y-2 rounded-2xl bg-cream/60 p-3">
            <li class="flex items-center gap-2 text-[11px] text-muted">
              <ShieldCheck class="size-3.5 text-accent" /> Pembayaran diverifikasi manual
            </li>
            <li class="flex items-center gap-2 text-[11px] text-muted">
              <Truck class="size-3.5 text-accent" /> Dikirim dari Jakarta dalam 1–2 hari
            </li>
          </ul>
        </div>

        <div class="mt-3 flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3">
          <span class="text-[11px] text-muted">Butuh bantuan?</span>
          <a
            href="https://wa.me/6281234567890"
            class="flex items-center gap-1 text-[11.5px] font-semibold text-accent"
          >
            Chat admin <ArrowRight class="size-3.5" />
          </a>
        </div>
      </aside>
    </div>
  </div>
</template>
