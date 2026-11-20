<script setup lang="ts">
import { FwbToggle } from 'flowbite-vue'
import { ImagePlus, Sparkles, Trash2 } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ProductVisual from '@/components/ProductVisual.vue'
import {
  DTF_POSITIONS,
  DTF_SIZES,
  dtfUnitPrice,
  formatIDR,
  type DtfOption,
  type DtfPosition,
  type DtfSize,
} from '@/api'

const props = defineProps<{
  modelValue: DtfOption
  productCategory: 'kaos' | 'polo' | 'hoodie' | 'sport' | 'headwear'
  garmentImage?: string
  garmentBackImage?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: DtfOption] }>()

const fileError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const enabled = computed({
  get: () => props.modelValue.enabled,
  set: (value: boolean) => emit('update:modelValue', { ...props.modelValue, enabled: value }),
})

const position = computed(() => props.modelValue.position)
const size = computed(() => props.modelValue.size)

const previewUrl = computed(() => props.modelValue.previewUrl)
const fileName = computed(() => props.modelValue.fileName)

const price = computed(() => dtfUnitPrice(props.modelValue))

const overlayStyle = computed(() => {
  switch (props.modelValue.position) {
    case 'dada-kiri':
      return { top: '29%', left: '37%', width: '15%' }
    case 'lengan':
      return { top: '26%', right: '17%', width: '12%' }
    case 'belakang':
      return { top: '32%', left: '50%', width: '38%' }
    default:
      return { top: '32%', left: '50%', width: '38%' }
  }
})

const previewImage = computed(() =>
  props.modelValue.position === 'belakang'
    ? (props.garmentBackImage ?? props.garmentImage)
    : props.garmentImage,
)

function setPosition(value: DtfPosition) {
  emit('update:modelValue', { ...props.modelValue, position: value })
}

function setSize(value: DtfSize) {
  emit('update:modelValue', { ...props.modelValue, size: value })
}

function pickFile() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  fileError.value = ''

  if (!file.type.startsWith('image/')) {
    fileError.value = 'Format harus PNG, JPG, atau SVG.'
    input.value = ''
    return
  }

  if (file.size > 8 * 1024 * 1024) {
    fileError.value = 'Ukuran maksimal 8 MB.'
    input.value = ''
    return
  }

  revokePreview()
  const url = URL.createObjectURL(file)
  emit('update:modelValue', {
    ...props.modelValue,
    enabled: true,
    fileName: file.name,
    previewUrl: url,
  })
}

function revokePreview() {
  if (props.modelValue.previewUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(props.modelValue.previewUrl)
  }
}

function removeFile() {
  revokePreview()
  emit('update:modelValue', { ...props.modelValue, fileName: undefined, previewUrl: undefined })
  if (fileInput.value) fileInput.value.value = ''
}

watch(
  () => props.modelValue.enabled,
  (value) => {
    if (!value) fileError.value = ''
  },
)

onBeforeUnmount(revokePreview)
</script>

<template>
  <section class="rounded-3xl border border-line bg-surface">
    <header class="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
      <div class="flex items-center gap-2">
        <Sparkles class="size-4 text-accent" />
        <div>
          <h3 class="text-sm font-semibold tracking-tight">Custom sablon DTF</h3>
          <p class="text-[11px] text-muted">Opsional · tanpa minimum order</p>
        </div>
      </div>
      <FwbToggle v-model="enabled" label="" color="green" />
    </header>

    <div v-if="!enabled" class="px-4 py-4 sm:px-5">
      <p class="text-[13px] leading-relaxed text-muted">
        Ingin menambahkan desain? Aktifkan sablon DTF untuk mengunggah artwork dan memilih area
        cetak. Harga sablon dihitung per pcs.
      </p>
    </div>

    <div v-else class="space-y-5 px-4 py-4 sm:px-5">
      <!-- Preview -->
      <div class="relative overflow-hidden rounded-2xl bg-[#e0e0e0]">
        <div class="relative mx-auto aspect-[4/5] w-full max-w-[260px]">
          <ProductVisual
            :src="previewImage"
            :alt="`Pratinjau sablon ${productCategory}`"
          />

          <div
            v-if="previewUrl"
            class="pointer-events-none absolute -translate-x-1/2"
            :style="overlayStyle"
          >
            <img
              :src="previewUrl"
              alt="Pratinjau desain"
              class="w-full rounded-md opacity-90 mix-blend-multiply drop-shadow-sm"
            />
          </div>

          <div class="absolute top-2.5 left-2.5">
            <span class="badge">
              {{ DTF_POSITIONS.find((item) => item.value === position)?.label }}
            </span>
          </div>

          <p
            v-if="position === 'belakang'"
            class="absolute right-2.5 bottom-2.5 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-medium text-white"
          >
            Pratinjau area belakang
          </p>
        </div>
      </div>

      <!-- Position -->
      <div>
        <p class="label">Area cetak</p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="option in DTF_POSITIONS"
            :key="option.value"
            type="button"
            class="chip justify-center"
            :class="position === option.value ? 'chip-active' : ''"
            @click="setPosition(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Size -->
      <div>
        <p class="label">Ukuran cetak</p>
        <div class="grid gap-2">
          <button
            v-for="option in DTF_SIZES"
            :key="option.value"
            type="button"
            class="flex items-center justify-between rounded-2xl border px-3.5 py-3 text-left transition-colors"
            :class="
              size === option.value
                ? 'border-accent bg-accent-soft/60'
                : 'border-line hover:border-ink/20'
            "
            @click="setSize(option.value)"
          >
            <span>
              <span class="block text-[13px] font-semibold">{{ option.label }}</span>
              <span class="block text-[11px] text-muted">{{ option.hint }}</span>
            </span>
            <span class="text-[12.5px] font-semibold text-accent">
              +{{ formatIDR(option.price) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Upload -->
      <div>
        <p class="label">File desain</p>
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          class="hidden"
          @change="onFileChange"
        />

        <div
          v-if="!fileName"
          class="flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-line bg-canvas px-4 py-6 text-center transition-colors hover:border-accent/40 hover:bg-accent-soft/30"
          @click="pickFile"
        >
          <ImagePlus class="size-6 text-muted" />
          <p class="mt-2 text-[13px] font-semibold">Unggah artwork</p>
          <p class="mt-0.5 text-[11px] text-muted">PNG, JPG, atau SVG · maks. 8 MB</p>
        </div>

        <div
          v-else
          class="flex items-center gap-3 rounded-2xl border border-line bg-canvas px-3 py-2.5"
        >
          <div class="size-11 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
            <img v-if="previewUrl" :src="previewUrl" alt="" class="size-full object-contain p-1" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[12.5px] font-semibold">{{ fileName }}</p>
            <button class="text-[11px] font-medium text-accent hover:underline" @click="pickFile">
              Ganti file
            </button>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-danger"
            aria-label="Hapus file"
            @click="removeFile"
          >
            <Trash2 class="size-4" />
          </button>
        </div>

        <p v-if="fileError" class="error-text">{{ fileError }}</p>
        <p v-else class="help">
          Gunakan latar transparan dan resolusi minimal 1500 px untuk hasil terbaik.
        </p>
      </div>

      <div class="flex items-center justify-between rounded-2xl bg-accent-soft/60 px-3.5 py-3">
        <span class="text-[12px] font-medium text-accent">Tambahan per pcs</span>
        <span class="text-sm font-bold text-accent">{{ formatIDR(price) }}</span>
      </div>
    </div>
  </section>
</template>
