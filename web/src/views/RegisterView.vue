<script setup lang="ts">
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import GarmentVisual from '@/components/GarmentVisual.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
})

const showPassword = ref(false)
const agreed = ref(false)
const formError = ref('')
const errors = reactive<Record<string, string>>({})

const canSubmit = computed(
  () =>
    form.name.trim().length >= 3 &&
    form.email.includes('@') &&
    form.password.length >= 6 &&
    agreed.value,
)

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (form.name.trim().length < 3) errors.name = 'Nama minimal 3 karakter.'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Format email tidak valid.'
  if (form.phone && !/^[0-9+\s-]{9,16}$/.test(form.phone)) errors.phone = 'Nomor WhatsApp tidak valid.'
  if (form.password.length < 6) errors.password = 'Password minimal 6 karakter.'
  if (form.password !== form.confirm) errors.confirm = 'Konfirmasi password tidak sama.'
  if (!agreed.value) formError.value = 'Setujui syarat & ketentuan untuk melanjutkan.'

  return Object.keys(errors).length === 0 && agreed.value
}

async function submit() {
  formError.value = ''
  if (!validate()) return

  const ok = await auth.register({
    name: form.name,
    email: form.email,
    phone: form.phone || undefined,
    password: form.password,
  })

  if (!ok) {
    formError.value = auth.error ?? 'Gagal mendaftar.'
    return
  }

  router.replace({ name: 'home' })
}
</script>

<template>
  <div class="grid min-h-[calc(100vh-9rem)] lg:grid-cols-2">
    <!-- Aside -->
    <div class="relative hidden overflow-hidden bg-ink lg:block">
      <div class="absolute inset-0 bg-gradient-to-bl from-accent/40 via-ink to-ink" />
      <div class="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <div class="flex items-baseline gap-1.5 text-cream">
          <span class="text-lg font-extrabold tracking-[-0.04em] uppercase">Growtex</span>
          <span class="text-lg font-light text-cream/60">store</span>
          <span class="mb-px size-1.5 rounded-full bg-accent-soft" />
        </div>

        <div class="mx-auto w-full max-w-[240px] opacity-90">
          <GarmentVisual color="#9caf9a" type="hoodie" />
        </div>

        <ul class="space-y-3">
          <li v-for="benefit in [
            'Riwayat pesanan & invoice tersimpan',
            'Simpan alamat pengiriman favorit',
            'Akses lebih cepat ke status produksi',
          ]" :key="benefit" class="flex items-center gap-2.5 text-[12.5px] text-cream/70">
            <span class="size-1.5 rounded-full bg-accent-soft" />
            {{ benefit }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Form -->
    <div class="flex items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
      <div class="w-full max-w-sm">
        <p class="eyebrow">Buat akun baru</p>
        <h1 class="mt-2 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">Daftar gratis</h1>
        <p class="mt-2 text-[13px] leading-relaxed text-muted">
          Cukup satu menit. Kamu bisa langsung memesan tanpa minimum order.
        </p>

        <form class="mt-7 space-y-3.5" novalidate @submit.prevent="submit">
          <div>
            <label class="label" for="name">Nama lengkap</label>
            <div class="relative">
              <User class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
              <input
                id="name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                placeholder="Nama kamu"
                class="field pl-10"
                :class="errors.name ? 'field-error' : ''"
              />
            </div>
            <p v-if="errors.name" class="error-text">{{ errors.name }}</p>
          </div>

          <div>
            <label class="label" for="email">Email</label>
            <div class="relative">
              <Mail class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="email@kamu.com"
                class="field pl-10"
                :class="errors.email ? 'field-error' : ''"
              />
            </div>
            <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
          </div>

          <div>
            <label class="label" for="phone">Nomor WhatsApp <span class="font-normal normal-case">(opsional)</span></label>
            <div class="relative">
              <Phone class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                placeholder="08xxxxxxxxxx"
                class="field pl-10"
                :class="errors.phone ? 'field-error' : ''"
              />
            </div>
            <p v-if="errors.phone" class="error-text">{{ errors.phone }}</p>
          </div>

          <div class="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label class="label" for="password">Password</label>
              <div class="relative">
                <Lock class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Min. 6 karakter"
                  class="field pr-9 pl-10"
                  :class="errors.password ? 'field-error' : ''"
                />
                <button
                  type="button"
                  class="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:text-ink"
                  :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="size-3.5" />
                  <Eye v-else class="size-3.5" />
                </button>
              </div>
              <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
            </div>

            <div>
              <label class="label" for="confirm">Ulangi password</label>
              <div class="relative">
                <Lock class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
                <input
                  id="confirm"
                  v-model="form.confirm"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Ulangi"
                  class="field pl-10"
                  :class="errors.confirm ? 'field-error' : ''"
                />
              </div>
              <p v-if="errors.confirm" class="error-text">{{ errors.confirm }}</p>
            </div>
          </div>

          <label class="flex cursor-pointer items-start gap-2.5 pt-1">
            <input v-model="agreed" type="checkbox" class="mt-0.5 size-4 rounded accent-[#1c3f35]" />
            <span class="text-[11px] leading-relaxed text-muted">
              Saya menyetujui
              <a href="#" class="font-medium text-ink underline underline-offset-4">syarat &amp; ketentuan</a>
              serta kebijakan privasi GrowtexStore.
            </span>
          </label>

          <p
            v-if="formError"
            class="rounded-2xl border border-danger/20 bg-red-50 px-3.5 py-2.5 text-[11.5px] font-medium text-danger"
          >
            {{ formError }}
          </p>

          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="!canSubmit || auth.loading">
            <Loader2 v-if="auth.loading" class="size-4 animate-spin" />
            <template v-else>
              Daftar sekarang
              <ArrowRight class="size-4" />
            </template>
          </button>
        </form>

        <p class="mt-4 text-center text-[12px] text-muted">
          Sudah punya akun?
          <RouterLink :to="{ name: 'login' }" class="font-semibold text-ink underline underline-offset-4">
            Masuk
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
