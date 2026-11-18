<script setup lang="ts">
import { computed, useId } from 'vue'
import type { CategoryId } from '@/api'

const props = withDefaults(
  defineProps<{
    color?: string
    type?: CategoryId
  }>(),
  {
    color: '#e6dcc8',
    type: 'kaos',
  },
)

const uid = useId()
const shadeId = computed(() => `garment-shade-${uid}`)

const isDark = computed(() => {
  const hex = props.color.replace('#', '')
  if (hex.length !== 6) return false
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45
})

const stroke = computed(() => (isDark.value ? 'rgba(255,255,255,0.22)' : 'rgba(22,22,26,0.16)'))
const detail = computed(() => (isDark.value ? 'rgba(255,255,255,0.3)' : 'rgba(22,22,26,0.18)'))
</script>

<template>
  <svg viewBox="0 0 320 400" class="h-full w-full" role="img" aria-hidden="true">
    <defs>
      <linearGradient :id="shadeId" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16" />
        <stop offset="46%" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.14" />
      </linearGradient>
    </defs>

    <ellipse cx="160" cy="374" rx="104" ry="9" fill="rgba(22,22,26,0.07)" />

    <!-- Totebag -->
    <g v-if="type === 'totebag'">
      <path
        d="M96 120 H224 L238 356 C238 362 232 366 224 366 H96 C88 366 82 362 82 356 Z"
        :fill="color"
        :stroke="stroke"
        stroke-width="1.5"
      />
      <path
        d="M96 120 H224 L238 356 C238 362 232 366 224 366 H96 C88 366 82 362 82 356 Z"
        :fill="`url(#${shadeId})`"
      />
      <path
        d="M124 122 C124 76 196 76 196 122"
        fill="none"
        :stroke="stroke"
        stroke-width="10"
        stroke-linecap="round"
      />
      <path d="M82 140 H238" :stroke="detail" stroke-width="1.2" />
    </g>

    <!-- Hoodie / Crewneck -->
    <g v-else-if="type === 'hoodie'">
      <path
        d="M126 46 C126 22 194 22 194 46 C194 66 126 66 126 46 Z"
        :fill="color"
        :stroke="stroke"
        stroke-width="1.5"
      />
      <path
        d="M128 42 C136 60 184 60 192 42 L236 56 L284 116 L250 154 L222 130 L222 348 C222 362 198 370 160 370 C122 370 98 362 98 348 L98 130 L70 154 L36 116 L84 56 Z"
        :fill="color"
        :stroke="stroke"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path
        d="M128 42 C136 60 184 60 192 42 L236 56 L284 116 L250 154 L222 130 L222 348 C222 362 198 370 160 370 C122 370 98 362 98 348 L98 130 L70 154 L36 116 L84 56 Z"
        :fill="`url(#${shadeId})`"
      />
      <path
        d="M128 44 C138 72 182 72 192 44"
        fill="none"
        :stroke="detail"
        stroke-width="1.6"
      />
      <path d="M148 66 V112" :stroke="detail" stroke-width="2.4" stroke-linecap="round" />
      <path d="M172 66 V112" :stroke="detail" stroke-width="2.4" stroke-linecap="round" />
      <path
        d="M120 286 H200 V330 C200 334 196 336 192 336 H128 C124 336 120 334 120 330 Z"
        fill="none"
        :stroke="detail"
        stroke-width="1.4"
      />
      <path d="M98 348 C122 360 198 360 222 348" fill="none" :stroke="detail" stroke-width="1.6" />
    </g>

    <!-- Polo -->
    <g v-else-if="type === 'polo'">
      <path
        d="M128 40 C138 58 182 58 192 40 L236 54 L278 108 L246 144 L222 120 L222 352 C222 362 198 368 160 368 C122 368 98 362 98 352 L98 120 L74 144 L42 108 L84 54 Z"
        :fill="color"
        :stroke="stroke"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path
        d="M128 40 C138 58 182 58 192 40 L236 54 L278 108 L246 144 L222 120 L222 352 C222 362 198 368 160 368 C122 362 98 362 98 352 L98 120 L74 144 L42 108 L84 54 Z"
        :fill="`url(#${shadeId})`"
      />
      <path d="M136 44 L160 92 L120 62 Z" :fill="color" :stroke="detail" stroke-width="1.3" />
      <path d="M184 44 L160 92 L200 62 Z" :fill="color" :stroke="detail" stroke-width="1.3" />
      <path d="M160 92 V144" :stroke="detail" stroke-width="1.4" />
      <circle cx="160" cy="106" r="2.6" :fill="detail" />
      <circle cx="160" cy="126" r="2.6" :fill="detail" />
      <path d="M98 348 C124 358 196 358 222 348" fill="none" :stroke="detail" stroke-width="1.4" />
    </g>

    <!-- Oversized -->
    <g v-else-if="type === 'oversized'">
      <path
        d="M124 48 C136 66 184 66 196 48 L248 62 L296 132 L258 168 L226 140 L226 358 C226 368 198 374 160 374 C122 374 94 368 94 358 L94 140 L62 168 L24 132 L72 62 Z"
        :fill="color"
        :stroke="stroke"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path
        d="M124 48 C136 66 184 66 196 48 L248 62 L296 132 L258 168 L226 140 L226 358 C226 368 198 374 160 374 C122 374 94 368 94 358 L94 140 L62 168 L24 132 L72 62 Z"
        :fill="`url(#${shadeId})`"
      />
      <path
        d="M124 48 C138 78 182 78 196 48"
        fill="none"
        :stroke="detail"
        stroke-width="1.8"
      />
      <path d="M94 352 C126 364 194 364 226 352" fill="none" :stroke="detail" stroke-width="1.5" />
      <path d="M64 158 C76 148 84 142 92 138" fill="none" :stroke="detail" stroke-width="1.2" />
      <path d="M256 158 C244 148 236 142 228 138" fill="none" :stroke="detail" stroke-width="1.2" />
    </g>

    <!-- Kaos (default) -->
    <g v-else>
      <path
        d="M128 40 C138 58 182 58 192 40 L236 54 L278 108 L246 144 L222 120 L222 352 C222 362 198 368 160 368 C122 368 98 362 98 352 L98 120 L74 144 L42 108 L84 54 Z"
        :fill="color"
        :stroke="stroke"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path
        d="M128 40 C138 58 182 58 192 40 L236 54 L278 108 L246 144 L222 120 L222 352 C222 362 198 368 160 368 C122 368 98 362 98 352 L98 120 L74 144 L42 108 L84 54 Z"
        :fill="`url(#${shadeId})`"
      />
      <path d="M128 44 C140 70 180 70 192 44" fill="none" :stroke="detail" stroke-width="1.8" />
      <path d="M98 348 C124 358 196 358 222 348" fill="none" :stroke="detail" stroke-width="1.4" />
      <path d="M74 138 C84 132 92 128 100 126" fill="none" :stroke="detail" stroke-width="1.1" />
      <path d="M246 138 C236 132 228 128 220 126" fill="none" :stroke="detail" stroke-width="1.1" />
    </g>
  </svg>
</template>
