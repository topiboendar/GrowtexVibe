<script setup lang="ts">
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import GarmentVisual from '@/components/GarmentVisual.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const formError = ref('')

const canSubmit = computed(() => email.value.trim().length > 3 && password.value.length >= 6)

async function submit() {
  formError.value = ''
  if (!canSubmit.value) {
    formError.value = 'Lengkapi email dan password minimal 6 karakter.'
    return
  }

  const ok = await auth.login(email.value, password.value)
  if (!ok) {
    formError.value = auth.error ?? 'Gagal masuk.'
    return
  }

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (redirect) {
    router.replace(redirect)
    return
  }
  router.replace(auth.isAdmin ? { name: 'admin-orders' } : { name: 'home' })
}

function fillDemo(role: 'admin' | 'customer') {
  email.value = role === 'admin' ? 'admin@growtexstore.id' : 'budi@example.com'
  password.value = role === 'admin' ? 'admin123' : 'customer123'
  formError.value = ''
}
</script>

<template>
  <div class="grid min-h-[calc(100vh-9rem)] lg:grid-cols-2">
    <!-- Form -->
    <div class="flex items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
      <div class="w-full max-w-sm">
        <p class="eyebrow">Selamat datang kembali</p>
        <h1 class="mt-2 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">Masuk ke akunmu</h1>
        <p class="mt-2 text-[13px] leading-relaxed text-muted">
          Kelola pesanan, simpan alamat, dan pantau status produksi sablon.
        </p>

        <form class="mt-7 space-y-4" novalidate @submit.prevent="submit">
          <div>
            <label class="label" for="email">Email</label>
            <div class="relative">
              <Mail class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="email@kamu.com"
                class="field pl-10"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label class="label" for="password">Password</label>
              <button type="button" class="mb-1.5 text-[11px] font-medium text-muted hover:text-ink">
                Lupa password?
              </button>
            </div>
            <div class="relative">
              <Lock class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                class="field pr-10 pl-10"
              />
              <button
                type="button"
                class="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:text-ink"
                :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
          </div>

          <p
            v-if="formError"
            class="rounded-2xl border border-danger/20 bg-red-50 px-3.5 py-2.5 text-[11.5px] font-medium text-danger"
          >
            {{ formError }}
          </p>

          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="auth.loading">
            <Loader2 v-if="auth.loading" class="size-4 animate-spin" />
            <template v-else>
              Masuk
              <ArrowRight class="size-4" />
            </template>
          </button>
        </form>

        <p class="mt-4 text-center text-[12px] text-muted">
          Belum punya akun?
          <RouterLink :to="{ name: 'register' }" class="font-semibold text-ink underline underline-offset-4">
            Daftar gratis
          </RouterLink>
        </p>

        <!-- Demo credentials -->
        <div class="mt-7 rounded-2xl border border-line bg-cream/50 p-3.5">
          <p class="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">Akun demo</p>
          <div class="mt-2 grid gap-1.5">
            <button
              type="button"
              class="flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-left text-[11px] transition-colors hover:bg-accent-soft/60"
              @click="fillDemo('admin')"
            >
              <span class="font-medium">Admin</span>
              <span class="font-mono text-muted">admin@growtexstore.id · admin123</span>
            </button>
            <button
              type="button"
              class="flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-left text-[11px] transition-colors hover:bg-accent-soft/60"
              @click="fillDemo('customer')"
            >
              <span class="font-medium">Customer</span>
              <span class="font-mono text-muted">budi@example.com · customer123</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Aside -->
    <div class="relative hidden overflow-hidden bg-ink lg:block">
      <div class="absolute inset-0 bg-gradient-to-br from-accent/40 via-ink to-ink" />
      <div class="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <div class="flex items-baseline gap-1.5 text-cream">
          <span class="text-lg font-extrabold tracking-[-0.04em] uppercase">Growtex</span>
          <span class="text-lg font-light text-cream/60">store</span>
          <span class="mb-px size-1.5 rounded-full bg-accent-soft" />
        </div>

        <div class="mx-auto w-full max-w-[240px] opacity-90">
          <GarmentVisual color="#e8e2d7" type="kaos" />
        </div>

        <div>
          <p class="max-w-sm text-lg leading-snug font-medium text-cream/90">
            “Produksi rapi, komunikasi cepat. GrowtexStore jadi partner tetap untuk merchandise
            komunitas kami.”
          </p>
          <p class="mt-3 text-[11.5px] font-medium text-cream/50">
            Rangga Pratama · Komunitas Lari
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
