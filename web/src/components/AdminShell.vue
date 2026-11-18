<script setup lang="ts">
import {
  ArrowLeft,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  X,
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { apiStatus } from '@/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const open = ref(false)

const navItems = [
  { name: 'admin-orders', label: 'Pesanan', icon: ClipboardList, hint: 'Kelola & update status' },
  { name: 'admin-products', label: 'Produk', icon: Package, hint: 'Katalog & stok' },
]

const pageTitle = computed(() => {
  const item = navItems.find((entry) => entry.name === route.name)
  return item?.label ?? 'Dashboard'
})

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}

watch(
  () => route.fullPath,
  () => (open.value = false),
)
</script>

<template>
  <div class="min-h-screen bg-canvas lg:flex">
    <!-- Mobile top bar -->
    <header
      class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur-xl lg:hidden"
    >
      <div class="flex items-center gap-2">
        <button class="icon-btn -ml-2" aria-label="Buka menu admin" @click="open = true">
          <Menu class="size-5" />
        </button>
        <div>
          <p class="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">Admin</p>
          <p class="text-sm font-semibold leading-tight">{{ pageTitle }}</p>
        </div>
      </div>
      <RouterLink :to="{ name: 'home' }" class="btn btn-outline btn-sm">
        <ArrowLeft class="size-3.5" /> Toko
      </RouterLink>
    </header>

    <!-- Desktop sidebar -->
    <aside class="hidden w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div class="flex h-[68px] items-center gap-2 border-b border-line px-5">
        <span class="flex size-8 items-center justify-center rounded-xl bg-accent text-white">
          <LayoutDashboard class="size-4" />
        </span>
        <div class="leading-tight">
          <p class="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">Growtexstore</p>
          <p class="text-sm font-semibold">Dashboard</p>
        </div>
      </div>

      <nav class="flex-1 space-y-1 p-3">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors"
          :class="
            route.name === item.name
              ? 'bg-ink text-white'
              : 'text-muted hover:bg-cream hover:text-ink'
          "
        >
          <component :is="item.icon" class="size-4" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="border-t border-line p-3">
        <div class="mb-2 flex items-center gap-2.5 rounded-2xl bg-cream/60 px-3 py-2.5">
          <span class="flex size-8 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
            {{ auth.initials }}
          </span>
          <div class="min-w-0">
            <p class="truncate text-[12.5px] font-semibold">{{ auth.displayName }}</p>
            <p class="truncate text-[10.5px] text-muted">{{ auth.user?.email }}</p>
          </div>
        </div>
        <RouterLink :to="{ name: 'home' }" class="btn btn-ghost btn-block btn-sm justify-start">
          <ArrowLeft class="size-4" /> Kembali ke toko
        </RouterLink>
        <button class="btn btn-ghost btn-block btn-sm justify-start text-danger" @click="logout">
          <LogOut class="size-4" /> Keluar
        </button>
        <p v-if="apiStatus.demo" class="mt-2 px-1 text-[10px] leading-snug text-muted">
          Mode demo — perubahan tersimpan di browser.
        </p>
      </div>
    </aside>

    <!-- Content -->
    <main class="min-w-0 flex-1">
      <slot />
    </main>

    <!-- Mobile drawer -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition duration-200 ease-in"
        leave-to-class="opacity-0"
      >
        <div v-if="open" class="fixed inset-0 z-50 lg:hidden">
          <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="open = false" />
          <aside class="absolute inset-y-0 left-0 flex w-[80%] max-w-xs flex-col bg-surface safe-bottom">
            <div class="flex h-14 items-center justify-between border-b border-line px-4">
              <p class="text-sm font-semibold">Dashboard</p>
              <button class="icon-btn -mr-1.5" aria-label="Tutup menu" @click="open = false">
                <X class="size-5" />
              </button>
            </div>

            <nav class="flex-1 space-y-1 p-3">
              <RouterLink
                v-for="item in navItems"
                :key="item.name"
                :to="{ name: item.name }"
                class="flex items-center justify-between rounded-2xl px-3 py-3"
                :class="route.name === item.name ? 'bg-ink text-white' : 'hover:bg-cream'"
              >
                <span class="flex items-center gap-3 text-sm font-medium">
                  <component :is="item.icon" class="size-4" />
                  {{ item.label }}
                </span>
                <span
                  class="text-[10px]"
                  :class="route.name === item.name ? 'text-white/60' : 'text-muted'"
                >
                  {{ item.hint }}
                </span>
              </RouterLink>
            </nav>

            <div class="border-t border-line p-3">
              <div class="mb-2 flex items-center gap-2.5 px-1">
                <span class="flex size-8 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                  {{ auth.initials }}
                </span>
                <div class="min-w-0">
                  <p class="truncate text-[12.5px] font-semibold">{{ auth.displayName }}</p>
                  <p class="truncate text-[10.5px] text-muted">{{ auth.user?.email }}</p>
                </div>
              </div>
              <RouterLink :to="{ name: 'home' }" class="btn btn-outline btn-block btn-sm">
                <ArrowLeft class="size-4" /> Kembali ke toko
              </RouterLink>
              <button class="btn btn-ghost btn-block btn-sm mt-1 text-danger" @click="logout">
                <LogOut class="size-4" /> Keluar
              </button>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
