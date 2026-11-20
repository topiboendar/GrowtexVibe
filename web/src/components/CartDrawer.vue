<script setup lang="ts">
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-vue-next'
import { computed, onBeforeUnmount, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import ProductVisual from '@/components/ProductVisual.vue'
import { dtfDescription, formatIDR } from '@/api'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
const router = useRouter()

const itemCount = computed(() =>
  cart.totalItems === 1 ? '1 item' : `${cart.totalItems} item`,
)

function close() {
  cart.closeDrawer()
}

function goCheckout() {
  cart.closeDrawer()
  router.push({ name: 'checkout' })
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(
  () => cart.isDrawerOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      window.addEventListener('keydown', onKeydown)
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="cart.isDrawerOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="close" />

        <aside
          class="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-canvas shadow-lift"
          role="dialog"
          aria-modal="true"
          aria-label="Keranjang belanja"
        >
          <!-- Header -->
          <header class="flex items-center justify-between border-b border-line px-4 py-4 sm:px-5">
            <div>
              <h2 class="text-base font-semibold tracking-tight">Keranjang</h2>
              <p class="text-[11px] text-muted">{{ itemCount }}</p>
            </div>
            <button class="icon-btn -mr-1" aria-label="Tutup keranjang" @click="close">
              <X class="size-5" />
            </button>
          </header>

          <!-- Free shipping -->
          <div v-if="!cart.isEmpty" class="border-b border-line bg-surface px-4 py-3 sm:px-5">
            <p class="text-[11px] font-medium text-muted">
              <template v-if="cart.freeShippingRemaining > 0">
                Tambah <span class="font-semibold text-ink">{{ formatIDR(cart.freeShippingRemaining) }}</span>
                lagi untuk gratis ongkir
              </template>
              <template v-else>
                <span class="font-semibold text-accent">Gratis ongkir</span> sudah aktif untuk pesanan ini.
              </template>
            </p>
            <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cream">
              <div
                class="h-full rounded-full bg-accent transition-all duration-500"
                :style="{ width: `${cart.freeShippingProgress}%` }"
              />
            </div>
          </div>

          <!-- Empty -->
          <div v-if="cart.isEmpty" class="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span class="flex size-16 items-center justify-center rounded-full bg-cream text-muted">
              <ShoppingBag class="size-7" />
            </span>
            <h3 class="mt-4 text-base font-semibold">Keranjang masih kosong</h3>
            <p class="mt-1 text-sm leading-relaxed text-muted">
              Mulai dari kaos polos favorit, atau buat desain sablon DTF sendiri.
            </p>
            <button class="btn btn-primary mt-5" @click="close">Jelajahi koleksi</button>
          </div>

          <!-- Items -->
          <div v-else class="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <ul class="space-y-3">
              <li
                v-for="item in cart.items"
                :key="item.key"
                class="flex gap-3 rounded-2xl border border-line bg-surface p-3"
              >
                <div class="size-20 shrink-0 overflow-hidden rounded-xl bg-[#e0e0e0]">
                  <ProductVisual :src="item.image" :alt="item.name" />
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="truncate text-[13.5px] font-semibold">{{ item.name }}</p>
                      <p class="mt-0.5 text-[11px] text-muted">
                        {{ item.color }} · {{ item.size }}
                      </p>
                      <p v-if="item.dtf?.enabled" class="mt-1 text-[10.5px] font-medium text-accent">
                        {{ dtfDescription(item.dtf) }}
                      </p>
                    </div>
                    <button
                      class="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-red-50 hover:text-danger"
                      aria-label="Hapus item"
                      @click="cart.removeItem(item.key)"
                    >
                      <Trash2 class="size-3.5" />
                    </button>
                  </div>

                  <div class="mt-2.5 flex items-center justify-between gap-2">
                    <div class="flex items-center rounded-full border border-line">
                      <button
                        class="flex size-10 items-center justify-center text-muted transition-colors hover:text-ink disabled:opacity-40"
                        aria-label="Kurangi jumlah"
                        @click="cart.decrement(item.key)"
                      >
                        <Minus class="size-3.5" />
                      </button>
                      <span class="w-7 text-center text-xs font-semibold">{{ item.qty }}</span>
                      <button
                        class="flex size-10 items-center justify-center text-muted transition-colors hover:text-ink"
                        aria-label="Tambah jumlah"
                        @click="cart.increment(item.key)"
                      >
                        <Plus class="size-3.5" />
                      </button>
                    </div>
                    <p class="text-[13px] font-semibold">{{ formatIDR(item.price * item.qty) }}</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- Footer -->
          <footer v-if="!cart.isEmpty" class="border-t border-line bg-surface px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
            <dl class="space-y-1.5 text-[13px]">
              <div class="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd class="text-ink">{{ formatIDR(cart.subtotal) }}</dd>
              </div>
              <div v-if="cart.dtfTotal > 0" class="flex justify-between text-muted">
                <dt>Termasuk sablon DTF</dt>
                <dd>{{ formatIDR(cart.dtfTotal) }}</dd>
              </div>
              <div class="flex justify-between text-muted">
                <dt>Ongkir</dt>
                <dd>{{ cart.shipping === 0 ? 'Gratis' : formatIDR(cart.shipping) }}</dd>
              </div>
              <div class="flex justify-between border-t border-line pt-2 text-[15px] font-semibold">
                <dt>Total</dt>
                <dd>{{ formatIDR(cart.total) }}</dd>
              </div>
            </dl>

            <button class="btn btn-primary btn-block mt-4" @click="goCheckout">
              Lanjut ke checkout
              <ArrowRight class="size-4" />
            </button>
            <RouterLink
              :to="{ name: 'home', hash: '#koleksi' }"
              class="mt-2 block text-center text-xs font-medium text-muted underline-offset-4 hover:underline"
              @click="close"
            >
              Lanjut belanja
            </RouterLink>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
