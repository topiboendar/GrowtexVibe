import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import {
  COLOR_SWATCHES,
  dtfUnitPrice,
  FREE_SHIPPING_MIN,
  shippingFor,
  type CartItem,
  type DtfOption,
  type Product,
} from '@/api'

const STORAGE_KEY = 'gv:cart'

interface AddOptions {
  color: string
  size: string
  qty?: number
  dtf?: DtfOption | null
}

function itemKey(productId: string, color: string, size: string, dtf?: DtfOption | null) {
  const dtfKey = dtf?.enabled ? `${dtf.position}:${dtf.size}` : 'plain'
  return `${productId}::${color}::${size}::${dtfKey}`
}

function readItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    if (!Array.isArray(parsed)) return []
    // Object URL hasil upload tidak valid setelah reload.
    return parsed.map((item) => ({
      ...item,
      dtf: item.dtf ? { ...item.dtf, previewUrl: undefined } : null,
    }))
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(readItems())
  const isDrawerOpen = ref(false)
  const lastAddedKey = ref<string | null>(null)

  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.qty, 0))
  const isEmpty = computed(() => items.value.length === 0)
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.price * item.qty, 0))
  const dtfTotal = computed(() =>
    items.value.reduce((sum, item) => sum + (item.price - item.basePrice) * item.qty, 0),
  )
  const shipping = computed(() => shippingFor(subtotal.value))
  const total = computed(() => subtotal.value + shipping.value)
  const freeShippingThreshold = FREE_SHIPPING_MIN
  const freeShippingRemaining = computed(() => Math.max(0, freeShippingThreshold - subtotal.value))
  const freeShippingProgress = computed(() =>
    Math.min(100, Math.round((subtotal.value / freeShippingThreshold) * 100)),
  )

  watch(
    items,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        /* abaikan */
      }
    },
    { deep: true },
  )

  function openDrawer() {
    isDrawerOpen.value = true
  }

  function closeDrawer() {
    isDrawerOpen.value = false
  }

  function toggleDrawer() {
    isDrawerOpen.value = !isDrawerOpen.value
  }

  function addItem(product: Product, options: AddOptions) {
    const color =
      product.colors.find((item) => item.name === options.color) ??
      product.colors[0] ??
      COLOR_SWATCHES[0]!

    const dtf = options.dtf?.enabled ? { ...options.dtf } : null
    const price = product.price + dtfUnitPrice(dtf)
    const qty = Math.max(1, options.qty ?? 1)
    const key = itemKey(product.id, color.name, options.size, dtf)

    const existing = items.value.find((item) => item.key === key)
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, 99)
      existing.price = price
      existing.basePrice = product.price
      existing.colorHex = color.hex
    } else {
      items.value.push({
        key,
        productId: product.id,
        name: product.name,
        category: product.category,
        basePrice: product.price,
        price,
        color: color.name,
        colorHex: color.hex,
        size: options.size,
        qty,
        dtf,
      })
    }

    lastAddedKey.value = key
    openDrawer()
  }

  function updateQty(key: string, qty: number) {
    const item = items.value.find((entry) => entry.key === key)
    if (!item) return
    if (qty <= 0) {
      removeItem(key)
      return
    }
    item.qty = Math.min(qty, 99)
  }

  function increment(key: string) {
    const item = items.value.find((entry) => entry.key === key)
    if (item) updateQty(key, item.qty + 1)
  }

  function decrement(key: string) {
    const item = items.value.find((entry) => entry.key === key)
    if (item) updateQty(key, item.qty - 1)
  }

  function removeItem(key: string) {
    items.value = items.value.filter((item) => item.key !== key)
  }

  function clearCart() {
    items.value = []
    lastAddedKey.value = null
  }

  return {
    items,
    isDrawerOpen,
    lastAddedKey,
    totalItems,
    isEmpty,
    subtotal,
    dtfTotal,
    shipping,
    total,
    freeShippingThreshold,
    freeShippingRemaining,
    freeShippingProgress,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    addItem,
    updateQty,
    increment,
    decrement,
    removeItem,
    clearCart,
  }
})
