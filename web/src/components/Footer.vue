<script setup lang="ts">
import {
  ArrowRight,
  Instagram,
  Mail,
  MessageCircle,
  Youtube,
} from 'lucide-vue-next'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { CATEGORIES } from '@/api'

const email = ref('')
const subscribed = ref(false)

function subscribe() {
  if (!email.value.includes('@')) return
  subscribed.value = true
  email.value = ''
}

const columns = [
  {
    title: 'Perusahaan',
    links: [
      { label: 'Tentang kami', href: '#tentang' },
      { label: 'Karier', href: '#' },
      { label: 'Hubungi kami', href: 'https://wa.me/6281234567890' },
      { label: 'Testimoni', href: '#testimoni' },
    ],
  },
  {
    title: 'Bantuan',
    links: [
      { label: 'Panduan ukuran', href: '#' },
      { label: 'Kebijakan privasi', href: '#' },
      { label: 'Syarat & ketentuan', href: '#' },
      { label: 'Pengiriman', href: '#' },
    ],
  },
]
</script>

<template>
  <footer id="tentang" class="mt-auto bg-ink text-cream">
    <!-- CTA cards -->
    <div class="container-page grid gap-3 pt-12 pb-10 sm:grid-cols-2 sm:gap-4 lg:pt-16">
      <RouterLink
        :to="{ name: 'home', hash: '#custom-dtf' }"
        class="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.07] sm:p-7"
      >
        <p class="eyebrow text-cream/50">Custom studio</p>
        <h3 class="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">Buat kaosmu sendiri</h3>
        <p class="mt-1.5 max-w-xs text-sm leading-relaxed text-cream/60">
          Upload desain, pilih area sablon, dan pesan satuan. Proses cepat tanpa minimum order.
        </p>
        <span class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cream">
          Mulai desain
          <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
        </span>
        <span
          class="pointer-events-none absolute -right-10 -bottom-14 size-40 rounded-full bg-accent/40 blur-2xl"
        />
      </RouterLink>

      <div class="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
        <p class="eyebrow text-cream/50">Layanan pelanggan</p>
        <h3 class="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">Kami siap membantu</h3>
        <p class="mt-1.5 text-sm leading-relaxed text-cream/60">Senin–Sabtu, 08.00–20.00 WIB.</p>
        <div class="mt-5 flex flex-col gap-2 text-sm">
          <a
            href="https://wa.me/6281234567890"
            class="inline-flex items-center gap-2 text-cream/85 transition-colors hover:text-white"
          >
            <MessageCircle class="size-4 text-cream/50" /> +62 812 3456 7890 (WhatsApp)
          </a>
          <a
            href="mailto:halo@growtexstore.id"
            class="inline-flex items-center gap-2 text-cream/85 transition-colors hover:text-white"
          >
            <Mail class="size-4 text-cream/50" /> halo@growtexstore.id
          </a>
        </div>
      </div>
    </div>

    <div class="container-page">
      <div class="hairline bg-white/10" />
    </div>

    <!-- Main -->
    <div class="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-8">
      <div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-lg font-extrabold tracking-[-0.04em] uppercase">Growtex</span>
          <span class="text-lg font-light text-cream/60">store</span>
          <span class="mb-px size-1.5 rounded-full bg-accent-soft" />
        </div>
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-cream/60">
          Kaos polos premium dan custom sablon DTF untuk kreator, komunitas, dan bisnis. Dikurasi
          dari bahan combed pilihan, dikerjakan dengan standar produksi yang konsisten.
        </p>

        <form class="mt-6 max-w-sm" @submit.prevent="subscribe">
          <label for="newsletter" class="eyebrow text-cream/50">Kabar koleksi baru</label>
          <div class="mt-2 flex gap-2">
            <input
              id="newsletter"
              v-model="email"
              type="email"
              required
              placeholder="email@kamu.com"
              class="w-full rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm text-cream placeholder:text-cream/35 focus:border-white/30 focus:outline-none"
            />
            <button type="submit" class="btn btn-light shrink-0 px-4 py-2.5 text-xs">
              Kirim
            </button>
          </div>
          <p v-if="subscribed" class="mt-2 text-[11px] text-accent-soft">
            Terima kasih! Kami akan kabari koleksi terbaru.
          </p>
        </form>
      </div>

      <div>
        <p class="eyebrow text-cream/50">Koleksi</p>
        <ul class="mt-4 space-y-2.5 text-sm">
          <li v-for="category in CATEGORIES" :key="category.id">
            <RouterLink
              :to="{ name: 'home', query: { kategori: category.id }, hash: '#koleksi' }"
              class="text-cream/70 transition-colors hover:text-white"
            >
              {{ category.label }}
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{ name: 'home', hash: '#custom-dtf' }"
              class="text-cream/70 transition-colors hover:text-white"
            >
              Custom DTF
            </RouterLink>
          </li>
        </ul>
      </div>

      <div v-for="column in columns" :key="column.title">
        <p class="eyebrow text-cream/50">{{ column.title }}</p>
        <ul class="mt-4 space-y-2.5 text-sm">
          <li v-for="link in column.links" :key="link.label">
            <a :href="link.href" class="text-cream/70 transition-colors hover:text-white">
              {{ link.label }}
            </a>
          </li>
        </ul>
      </div>

      <div>
        <p class="eyebrow text-cream/50">Akun</p>
        <ul class="mt-4 space-y-2.5 text-sm">
          <li>
            <RouterLink :to="{ name: 'login' }" class="text-cream/70 transition-colors hover:text-white">
              Masuk
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'register' }" class="text-cream/70 transition-colors hover:text-white">
              Daftar
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'checkout' }" class="text-cream/70 transition-colors hover:text-white">
              Keranjang
            </RouterLink>
          </li>
        </ul>

        <div class="mt-6 flex gap-2">
          <a
            href="#"
            aria-label="Instagram"
            class="flex size-9 items-center justify-center rounded-full border border-white/15 text-cream/70 transition-colors hover:border-white/30 hover:text-white"
          >
            <Instagram class="size-4" />
          </a>
          <a
            href="#"
            aria-label="YouTube"
            class="flex size-9 items-center justify-center rounded-full border border-white/15 text-cream/70 transition-colors hover:border-white/30 hover:text-white"
          >
            <Youtube class="size-4" />
          </a>
          <a
            href="https://wa.me/6281234567890"
            aria-label="WhatsApp"
            class="flex size-9 items-center justify-center rounded-full border border-white/15 text-cream/70 transition-colors hover:border-white/30 hover:text-white"
          >
            <MessageCircle class="size-4" />
          </a>
        </div>
      </div>
    </div>

    <div class="border-t border-white/10">
      <div
        class="container-page flex flex-col items-center justify-between gap-2 py-5 text-[11px] text-cream/45 sm:flex-row"
      >
        <p>© 2026 GrowtexStore. Seluruh hak cipta dilindungi.</p>
        <p class="flex items-center gap-3">
          <span>Transfer Bank</span>
          <span class="size-1 rounded-full bg-white/20" />
          <span>QRIS</span>
          <span class="size-1 rounded-full bg-white/20" />
          <span>COD Jabodetabek</span>
        </p>
      </div>
    </div>
  </footer>
</template>
