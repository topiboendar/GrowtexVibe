<script setup lang="ts">
import {
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X,
} from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { apiStatus, CATEGORIES } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const scrolled = ref(false)
const menuOpen = ref(false)
const accountOpen = ref(false)
const searchOpen = ref(false)
const searchTerm = ref('')

const cartLabel = computed(() => (cart.totalItems > 9 ? '9+' : String(cart.totalItems)))

function handleScroll() {
  scrolled.value = window.scrollY > 8
}

function closeAll() {
  menuOpen.value = false
  accountOpen.value = false
  searchOpen.value = false
}

function submitSearch() {
  const term = searchTerm.value.trim()
  closeAll()
  router.push({ name: 'home', query: term ? { q: term } : {}, hash: '#koleksi' })
}

function logout() {
  auth.logout()
  accountOpen.value = false
  router.push({ name: 'home' })
}

watch(
  () => route.fullPath,
  () => closeAll(),
)

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<template>
  <div>
    <!-- Announcement -->
    <div class="bg-accent text-white">
      <div class="container-page flex h-9 items-center justify-between gap-3 text-[11px] font-medium">
        <p class="flex items-center gap-1.5 truncate">
          <Truck class="size-3.5 shrink-0 opacity-80" />
          <span class="truncate">Gratis ongkir di atas Rp500.000</span>
        </p>
        <p class="hidden shrink-0 items-center gap-1.5 sm:flex">
          <Sparkles class="size-3.5 opacity-80" />
          Produksi 1–2 hari kerja
        </p>
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener"
          class="shrink-0 text-white/80 transition-colors hover:text-white"
        >
          Butuh bantuan?
        </a>
      </div>
    </div>

    <!-- Header -->
    <header
      class="sticky top-0 z-40 border-b bg-canvas/85 backdrop-blur-xl transition-colors"
      :class="scrolled ? 'border-line shadow-[0_1px_0_0_rgba(22,22,26,0.04)]' : 'border-transparent'"
    >
      <div class="container-page flex h-16 items-center justify-between gap-2 sm:h-[68px]">
        <!-- Left -->
        <div class="flex items-center gap-1">
          <button class="icon-btn -ml-2 lg:hidden" aria-label="Buka menu" @click="menuOpen = true">
            <Menu class="size-5" />
          </button>

          <RouterLink to="/" class="group flex items-baseline gap-1.5" aria-label="GrowtexStore beranda">
            <span class="text-[17px] font-extrabold tracking-[-0.04em] uppercase sm:text-lg">
              Growtex
            </span>
            <span
              class="text-[17px] font-light tracking-[-0.01em] text-muted transition-colors group-hover:text-accent sm:text-lg"
            >
              store
            </span>
            <span class="mb-px hidden size-1.5 rounded-full bg-accent sm:block" />
          </RouterLink>
        </div>

        <!-- Desktop nav -->
        <nav class="hidden items-center gap-1 lg:flex">
          <RouterLink
            v-for="category in CATEGORIES.slice(0, 4)"
            :key="category.id"
            :to="{ name: 'home', query: { kategori: category.id }, hash: '#koleksi' }"
            class="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-cream hover:text-ink"
          >
            {{ category.label }}
          </RouterLink>
          <RouterLink
            :to="{ name: 'home', hash: '#custom-dtf' }"
            class="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-cream hover:text-ink"
          >
            Custom DTF
          </RouterLink>
        </nav>

        <!-- Right -->
        <div class="flex items-center gap-0.5">
          <button class="icon-btn hidden sm:inline-flex" aria-label="Cari produk" @click="searchOpen = !searchOpen">
            <Search class="size-[19px]" />
          </button>

          <div class="relative">
            <button
              class="icon-btn"
              :aria-label="auth.isAuthenticated ? 'Menu akun' : 'Masuk'"
              @click="
                auth.isAuthenticated
                  ? (accountOpen = !accountOpen)
                  : router.push({ name: 'login' })
              "
            >
              <User class="size-[19px]" />
            </button>

            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="translate-y-1 opacity-0"
              leave-active-class="transition duration-100 ease-in"
              leave-to-class="translate-y-1 opacity-0"
            >
              <div
                v-if="accountOpen && auth.isAuthenticated"
                class="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-lift"
              >
                <div class="px-3 py-2.5">
                  <p class="truncate text-sm font-semibold">{{ auth.displayName }}</p>
                  <p class="truncate text-xs text-muted">{{ auth.user?.email }}</p>
                </div>
                <div class="hairline my-1" />
                <RouterLink
                  v-if="auth.isAdmin"
                  :to="{ name: 'admin-orders' }"
                  class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-cream"
                >
                  <Package class="size-4 text-muted" /> Dashboard admin
                </RouterLink>
                <RouterLink
                  to="/"
                  class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-cream"
                >
                  <ShoppingBag class="size-4 text-muted" /> Lanjut belanja
                </RouterLink>
                <button
                  class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-red-50"
                  @click="logout"
                >
                  <LogOut class="size-4" /> Keluar
                </button>
              </div>
            </Transition>
          </div>

          <button class="icon-btn relative" aria-label="Buka keranjang" @click="cart.toggleDrawer()">
            <ShoppingBag class="size-[19px]" />
            <span
              v-if="cart.totalItems > 0"
              class="absolute top-1 right-1 flex size-[18px] items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-2 ring-canvas"
            >
              {{ cartLabel }}
            </span>
          </button>
        </div>
      </div>

      <!-- Search panel -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="-translate-y-2 opacity-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="-translate-y-2 opacity-0"
      >
        <div v-if="searchOpen" class="border-t border-line bg-surface">
          <form class="container-page flex items-center gap-2 py-3" @submit.prevent="submitSearch">
            <Search class="size-4 shrink-0 text-muted" />
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Cari kaos, hoodie, totebag…"
              class="w-full bg-transparent text-sm outline-none placeholder:text-muted/70"
              autofocus
            />
            <button type="submit" class="btn btn-primary btn-sm">Cari</button>
            <button type="button" class="icon-btn size-9" aria-label="Tutup pencarian" @click="searchOpen = false">
              <X class="size-4" />
            </button>
          </form>
        </div>
      </Transition>
    </header>

    <!-- Demo badge -->
    <div v-if="apiStatus.demo" class="border-b border-line bg-cream/70">
      <div class="container-page flex items-center justify-center gap-1.5 py-1.5 text-[10.5px] font-medium tracking-wide text-muted">
        <span class="size-1.5 rounded-full bg-warn" />
        Mode demo — data tersimpan lokal di browser Anda
      </div>
    </div>

    <!-- Mobile menu -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition duration-200 ease-in"
        leave-to-class="opacity-0"
      >
        <div v-if="menuOpen" class="fixed inset-0 z-50 lg:hidden">
          <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="menuOpen = false" />

          <aside
            class="absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col bg-canvas shadow-lift safe-bottom"
          >
            <div class="flex h-16 items-center justify-between border-b border-line px-4">
              <span class="text-base font-extrabold tracking-[-0.04em] uppercase">Growtexstore</span>
              <button class="icon-btn -mr-1.5" aria-label="Tutup menu" @click="menuOpen = false">
                <X class="size-5" />
              </button>
            </div>

            <nav class="flex-1 overflow-y-auto px-3 py-4">
              <p class="eyebrow px-2 pb-2">Koleksi</p>
              <RouterLink
                v-for="category in CATEGORIES"
                :key="category.id"
                :to="{ name: 'home', query: { kategori: category.id }, hash: '#koleksi' }"
                class="flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium hover:bg-cream"
              >
                {{ category.label }}
                <span class="text-[11px] text-muted">{{ category.caption }}</span>
              </RouterLink>

              <div class="hairline my-3" />

              <RouterLink
                :to="{ name: 'home', hash: '#custom-dtf' }"
                class="flex items-center gap-2.5 rounded-xl px-3 py-3 text-[15px] font-medium hover:bg-cream"
              >
                <Sparkles class="size-4 text-accent" /> Custom Sablon DTF
              </RouterLink>
              <RouterLink
                :to="{ name: 'home', hash: '#testimoni' }"
                class="flex items-center gap-2.5 rounded-xl px-3 py-3 text-[15px] font-medium hover:bg-cream"
              >
                Testimoni pelanggan
              </RouterLink>
            </nav>

            <div class="border-t border-line p-4">
              <div v-if="auth.isAuthenticated" class="space-y-2">
                <div class="flex items-center gap-3 rounded-2xl bg-cream/70 px-3 py-2.5">
                  <span
                    class="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-bold text-white"
                  >
                    {{ auth.initials }}
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold">{{ auth.displayName }}</p>
                    <p class="truncate text-[11px] text-muted">{{ auth.user?.email }}</p>
                  </div>
                </div>
                <RouterLink
                  v-if="auth.isAdmin"
                  :to="{ name: 'admin-orders' }"
                  class="btn btn-outline btn-block"
                >
                  <Package class="size-4" /> Dashboard admin
                </RouterLink>
                <button class="btn btn-ghost btn-block text-danger" @click="logout">
                  <LogOut class="size-4" /> Keluar
                </button>
              </div>
              <div v-else class="grid grid-cols-2 gap-2">
                <RouterLink :to="{ name: 'login' }" class="btn btn-outline">Masuk</RouterLink>
                <RouterLink :to="{ name: 'register' }" class="btn btn-primary">Daftar</RouterLink>
              </div>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
