<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    src?: string
    alt?: string
    fit?: 'contain' | 'cover'
    eager?: boolean
  }>(),
  {
    src: undefined,
    alt: '',
    fit: 'contain',
    eager: false,
  },
)

const failed = ref(false)

watch(
  () => props.src,
  () => {
    failed.value = false
  },
)
</script>

<template>
  <div class="relative h-full w-full overflow-hidden bg-[#e0e0e0]">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      decoding="async"
      class="h-full w-full"
      :class="fit === 'cover' ? 'object-cover' : 'object-contain'"
      @error="failed = true"
    />
    <div
      v-else
      class="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-cream to-sand/70"
    >
      <span class="text-[10px] font-semibold tracking-[0.18em] text-muted/70 uppercase">
        Growtex
      </span>
      <span class="text-[9px] text-muted/50">Foto belum tersedia</span>
    </div>
  </div>
</template>
