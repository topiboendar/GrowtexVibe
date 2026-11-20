<script setup lang="ts">
import { Plus, Star } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import GarmentVisual from '@/components/GarmentVisual.vue'
import { CATEGORIES, formatIDR, type Product } from '@/api'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{ product: Product }>()

const cart = useCartStore()
const activeColor = ref(props.product.colors[0]?.hex ?? '#e6dcc8')

const categoryLabel = computed(
  () => CATEGORIES.find((category) => category.id === props.product.category)?.label ?? 'Koleksi',
)

const discount = computed(() => {
  if (!props.product.compareAtPrice) return 0
  return Math.round((1 - props.product.price / props.product.compareAtPrice) * 100)
})

function quickAdd() {
  const color = props.product.colors.find((item) => item.hex === activeColor.value)
  cart.addItem(props.product, {
    color: color?.name ?? props.product.colors[0]?.name ?? 'Putih',
    size: props.product.sizes[0] ?? 'M',
    qty: 1,
    dtf: null,
  })
}
</script>

<template>
  <article
    class="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-soft"
  >
    <RouterLink
      :to="{ name: 'product-detail', params: { id: product.id } }"
      class="absolute inset-0 z-10"
      :aria-label="`Lihat ${product.name}`"
    />

    <div class="relative overflow-hidden bg-gradient-to-br from-cream to-sand/60">
      <div class="aspect-[4/5] w-full p-4 transition-transform duration-500 group-hover:scale-[1.04]">
        <GarmentVisual :color="activeColor" :type="product.category" />
      </div>

      <div class="absolute top-3 left-3 z-20">
        <span v-if="discount > 0" class="badge-warn">-{{ discount }}%</span>
        <span v-else-if="product.isNew" class="badge-ink">Baru</span>
      </div>

      <button
        type="button"
        class="absolute right-3 bottom-3 z-20 flex size-11 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-soft backdrop-blur transition-all hover:bg-accent hover:text-white active:scale-95"
        aria-label="Tambah cepat ke keranjang"
        @click.prevent="quickAdd"
      >
        <Plus class="size-4" />
      </button>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <p class="text-[10.5px] font-semibold tracking-[0.14em] text-muted uppercase">
        {{ categoryLabel }}
      </p>
      <h3 class="mt-1 text-[15px] leading-snug font-semibold tracking-[-0.01em]">
        {{ product.name }}
      </h3>

      <div class="mt-1.5 flex items-center gap-1 text-[11px] text-muted">
        <Star class="size-3 fill-amber-400 text-amber-400" />
        <span class="font-semibold text-ink">{{ product.rating.toFixed(1) }}</span>
        <span class="text-muted/70">({{ product.reviews }})</span>
        <span class="mx-1 size-1 rounded-full bg-line" />
        <span>{{ product.weight }}</span>
      </div>

      <div class="mt-auto pt-3">
        <div class="relative z-20 flex flex-wrap items-center gap-1.5">
          <button
            v-for="color in product.colors.slice(0, 4)"
            :key="color.name"
            type="button"
            class="size-3.5 rounded-full border transition-transform hover:scale-110"
            :class="
              activeColor === color.hex
                ? 'border-ink ring-1 ring-ink/20 ring-offset-1 ring-offset-surface'
                : 'border-ink/15'
            "
            :style="{ backgroundColor: color.hex }"
            :title="color.name"
            :aria-label="`Warna ${color.name}`"
            @click.prevent="activeColor = color.hex"
          />
          <span v-if="product.colors.length > 4" class="text-[10px] font-medium text-muted">
            +{{ product.colors.length - 4 }}
          </span>
        </div>

        <div class="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p class="text-[15px] font-semibold tracking-tight">{{ formatIDR(product.price) }}</p>
          <p v-if="product.compareAtPrice" class="text-[11px] text-muted line-through">
            {{ formatIDR(product.compareAtPrice) }}
          </p>
        </div>
      </div>
    </div>
  </article>
</template>
