import { reactive } from 'vue'
import productCatalog from '@/data/products.json'

/* ----------------------------------------------------------------------------
 * API client untuk backend ElysiaJS.
 *
 * Semua pemanggilan mencoba backend lebih dulu (`VITE_API_BASE_URL`). Bila backend
 * belum menyediakan endpoint terkait, client otomatis masuk "mode demo" memakai
 * data lokal (localStorage) agar UI tetap bisa dipakai & direview.
 * -------------------------------------------------------------------------- */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

export const apiStatus = reactive({
  demo: false,
  checked: false,
  lastError: '',
})

export class ApiError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function endpoint(path: string) {
  return BASE_URL ? `${BASE_URL}${path}` : `/api${path}`
}

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function currentAuthToken() {
  return authToken
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set('Content-Type', 'application/json')
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)

  try {
    const response = await fetch(endpoint(path), {
      ...init,
      headers,
      signal: controller.signal,
    })

    if (!response.ok) {
      let message = `Permintaan gagal (${response.status})`
      try {
        const payload = (await response.json()) as { message?: string }
        if (payload?.message) message = payload.message
      } catch {
        /* biarkan pesan default */
      }
      throw new ApiError(message, response.status)
    }

    if (response.status === 204) return undefined as T
    return (await response.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}

function shouldFallback(error: unknown) {
  // Error validasi / autentikasi dari backend asli tidak boleh jatuh ke data lokal.
  if (!(error instanceof ApiError)) return true
  return error.status === 0 || error.status === 404 || error.status >= 500
}

async function withFallback<T>(call: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  if (apiStatus.demo) return fallback()

  try {
    const result = await call()
    apiStatus.checked = true
    return result
  } catch (error) {
    if (!shouldFallback(error)) throw error
    apiStatus.demo = true
    apiStatus.lastError = error instanceof Error ? error.message : 'Backend tidak tersedia'
    return fallback()
  }
}

/* ----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

export type Role = 'customer' | 'admin'
export type CategoryId = 'kaos' | 'polo' | 'hoodie' | 'sport' | 'headwear'
export type ProductView = 'front' | 'halfBody' | 'fullBody' | 'back'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: Role
}

export interface AuthSession {
  token: string
  user: User
}

export interface ProductColorImages {
  /** Foto produk tampak depan (flat product). */
  front: string
  /** Foto model setengah badan. */
  halfBody?: string
  /** Foto model seluruh badan beserta outfit. */
  fullBody?: string
  /** Foto model tampak belakang. */
  back?: string
  /** Foto swatch tekstur kain. */
  swatch?: string
}

export interface ProductColor {
  name: string
  hex: string
  /** Gambar swatch tekstur kain asli dari Cititex. */
  swatchImage?: string
  images?: ProductColorImages
}

export interface Product {
  id: string
  name: string
  category: CategoryId
  price: number
  compareAtPrice?: number
  description: string
  material: string
  weight: string
  care: string
  colors: ProductColor[]
  sizes: string[]
  stock: number
  rating: number
  reviews: number
  popular: boolean
  isNew: boolean
  /** Gambar tabel panduan ukuran produk. */
  sizeGuideUrl?: string
}

export type ProductInput = Omit<Product, 'id' | 'rating' | 'reviews' | 'popular' | 'isNew'> &
  Partial<Pick<Product, 'rating' | 'reviews' | 'popular' | 'isNew'>>

export interface Category {
  id: CategoryId
  label: string
  caption: string
}

export type DtfPosition = 'depan' | 'belakang' | 'dada-kiri' | 'lengan'
export type DtfSize = 'logo' | 'a4' | 'a3'

export interface DtfOption {
  enabled: boolean
  position: DtfPosition
  size: DtfSize
  fileName?: string
  previewUrl?: string
}

export interface CartItem {
  key: string
  productId: string
  name: string
  category: CategoryId
  basePrice: number
  price: number
  color: string
  colorHex: string
  colorSwatch?: string
  image?: string
  size: string
  qty: number
  dtf: DtfOption | null
}

export type OrderStatus = 'pending' | 'processing' | 'printing' | 'shipped' | 'completed' | 'cancelled'
export type PaymentMethod = 'transfer' | 'qris' | 'cod'

export interface OrderCustomer {
  name: string
  phone: string
  email?: string
  address: string
  city: string
  postalCode?: string
  note?: string
}

export interface Order {
  id: string
  invoiceNumber: string
  createdAt: string
  status: OrderStatus
  customer: OrderCustomer
  items: CartItem[]
  subtotal: number
  dtfTotal: number
  shipping: number
  total: number
  payment: PaymentMethod
}

export interface NewOrderInput {
  items: CartItem[]
  customer: OrderCustomer
  payment: PaymentMethod
}

/* ----------------------------------------------------------------------------
 * Konstanta domain
 * -------------------------------------------------------------------------- */

export const CATEGORIES: Category[] = [
  { id: 'kaos', label: 'Kaos', caption: 'Premium cotton 145–210 gsm' },
  { id: 'polo', label: 'Polo Shirt', caption: 'Pique & easy care' },
  { id: 'hoodie', label: 'Hoodie & Jacket', caption: 'Fleece 260–280 gsm' },
  { id: 'sport', label: 'Sport Dri-Fit', caption: 'Cepat kering & ringan' },
  { id: 'headwear', label: 'Headwear', caption: 'Snapback, trucker & dad hat' },
]

export const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL']

export const DTF_POSITIONS: { value: DtfPosition; label: string }[] = [
  { value: 'depan', label: 'Depan' },
  { value: 'belakang', label: 'Belakang' },
  { value: 'dada-kiri', label: 'Dada kiri' },
  { value: 'lengan', label: 'Lengan' },
]

export const DTF_SIZES: { value: DtfSize; label: string; price: number; hint: string }[] = [
  { value: 'logo', label: 'Logo', price: 15_000, hint: '± 8 × 8 cm' },
  { value: 'a4', label: 'A4', price: 25_000, hint: '21 × 29,7 cm' },
  { value: 'a3', label: 'A3', price: 40_000, hint: '29,7 × 42 cm' },
]

export const FREE_SHIPPING_MIN = 500_000
export const SHIPPING_FEE = 22_000

export function dtfUnitPrice(dtf?: DtfOption | null) {
  if (!dtf?.enabled) return 0
  return DTF_SIZES.find((size) => size.value === dtf.size)?.price ?? 0
}

export function dtfDescription(dtf?: DtfOption | null) {
  if (!dtf?.enabled) return 'Tanpa sablon'
  const position = DTF_POSITIONS.find((item) => item.value === dtf.position)?.label ?? 'Depan'
  const size = DTF_SIZES.find((item) => item.value === dtf.size)?.label ?? 'A4'
  return `DTF ${size} · ${position}`
}

export function shippingFor(subtotal: number) {
  if (subtotal <= 0) return 0
  return subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'printing',
  'shipped',
  'completed',
  'cancelled',
]

export const orderStatusMeta: Record<OrderStatus, { label: string; className: string; hint: string }> = {
  pending: {
    label: 'Menunggu bayar',
    className: 'badge-warn',
    hint: 'Pesanan dibuat, menunggu konfirmasi pembayaran.',
  },
  processing: {
    label: 'Diproses',
    className: 'badge',
    hint: 'Pembayaran diterima, pesanan masuk antrean produksi.',
  },
  printing: {
    label: 'Produksi',
    className: 'badge',
    hint: 'Sablon DTF sedang dicetak dan di-press.',
  },
  shipped: {
    label: 'Dikirim',
    className: 'badge-ink',
    hint: 'Paket diserahkan ke kurir.',
  },
  completed: {
    label: 'Selesai',
    className: 'badge',
    hint: 'Pesanan sudah diterima pelanggan.',
  },
  cancelled: {
    label: 'Dibatalkan',
    className: 'badge-danger',
    hint: 'Pesanan dibatalkan.',
  },
}

export const paymentMeta: Record<PaymentMethod, { label: string; hint: string }> = {
  transfer: { label: 'Transfer Bank', hint: 'BCA / Mandiri — verifikasi manual maks. 1 jam kerja.' },
  qris: { label: 'QRIS', hint: 'Scan sekali, semua e-wallet & mobile banking.' },
  cod: { label: 'Bayar di Tempat (COD)', hint: 'Tersedia untuk area Jabodetabek.' },
}

export function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

/* ----------------------------------------------------------------------------
 * Data katalog (seed)
 * -------------------------------------------------------------------------- */

export const SEED_PRODUCTS = productCatalog as unknown as Product[]

/**
 * Swatch warna global untuk filter beranda & form admin.
 * Diambil dari varian warna asli katalog Cititex, diurutkan dari terang ke gelap.
 */
export const COLOR_SWATCHES: ProductColor[] = (() => {
  const map = new Map<string, ProductColor>()
  for (const product of SEED_PRODUCTS) {
    for (const color of product.colors) {
      const key = color.name.toLowerCase()
      const existing = map.get(key)
      if (!existing || (!existing.swatchImage && color.swatchImage)) {
        map.set(key, {
          name: color.name,
          hex: color.hex,
          swatchImage: color.swatchImage,
        })
      }
    }
  }
  return [...map.values()].sort((a, b) => luminance(a.hex) - luminance(b.hex))
})()

/**
 * Warna yang paling banyak tersedia di katalog (top 18).
 * Dipakai untuk strip filter beranda agar tidak menampilkan puluhan swatch sekaligus.
 */
export const POPULAR_SWATCHES: ProductColor[] = (() => {
  const usage = new Map<string, number>()
  for (const product of SEED_PRODUCTS) {
    for (const color of product.colors) {
      const key = color.name.toLowerCase()
      usage.set(key, (usage.get(key) ?? 0) + 1)
    }
  }
  return [...COLOR_SWATCHES]
    .sort(
      (a, b) =>
        (usage.get(b.name.toLowerCase()) ?? 0) - (usage.get(a.name.toLowerCase()) ?? 0) ||
        luminance(a.hex) - luminance(b.hex),
    )
    .slice(0, 18)
})()

function luminance(hex: string) {
  const value = hex.replace('#', '')
  if (value.length !== 6) return 0
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/** Gambar untuk satu warna & sudut pandang, dengan fallback ke tampak depan. */
export function colorImage(color?: ProductColor | null, view: ProductView = 'front') {
  if (!color?.images) return color?.swatchImage
  return color.images[view] ?? color.images.front
}

/** Cari warna pada produk, fallback ke warna pertama. */
export function productColor(product: Product | null | undefined, name: string) {
  if (!product) return undefined
  return product.colors.find((color) => color.name === name) ?? product.colors[0]
}

/* ----------------------------------------------------------------------------
 * Local storage helpers
 * -------------------------------------------------------------------------- */

const STORAGE = {
  products: 'gv:products:v2',
  orders: 'gv:orders:v2',
  users: 'gv:users',
  session: 'gv:session',
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage penuh / diblokir — abaikan */
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function localProducts(): Product[] {
  const stored = readStorage<Product[] | null>(STORAGE.products, null)
  if (stored && stored.length > 0) return stored
  const seed = clone(SEED_PRODUCTS)
  writeStorage(STORAGE.products, seed)
  return seed
}

function saveProducts(products: Product[]) {
  writeStorage(STORAGE.products, products)
}

function localOrders(): Order[] {
  return readStorage<Order[]>(STORAGE.orders, [])
}

function saveOrders(orders: Order[]) {
  writeStorage(STORAGE.orders, orders)
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

function makeInvoiceNumber() {
  const now = new Date()
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `GV-${stamp}-${suffix}`
}

function summarize(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const dtfTotal = items.reduce((sum, item) => sum + (item.price - item.basePrice) * item.qty, 0)
  return { subtotal, dtfTotal, shipping: shippingFor(subtotal) }
}

function seedOrdersIfEmpty() {
  if (localOrders().length > 0) return

  const products = localProducts()
  const first = products[0]
  const hoodie = products.find((product) => product.category === 'hoodie') ?? products[0]
  if (!first || !hoodie) return

  const sampleItem = (
    product: Product,
    colorIndex: number,
    size: string,
    qty: number,
    dtf: DtfOption | null,
  ): CartItem => {
    const color = product.colors[colorIndex] ?? product.colors[0] ?? {
      name: 'Putih',
      hex: '#d0cfd6',
    }
    const dtfPrice = dtfUnitPrice(dtf)
    return {
      key: makeId('item'),
      productId: product.id,
      name: product.name,
      category: product.category,
      basePrice: product.price,
      price: product.price + dtfPrice,
      color: color.name,
      colorHex: color.hex,
      colorSwatch: color.swatchImage,
      image: colorImage(color),
      size,
      qty,
      dtf,
    }
  }

  const orderSeeds: Array<{
    status: OrderStatus
    payment: PaymentMethod
    customer: OrderCustomer
    items: CartItem[]
    daysAgo: number
  }> = [
    {
      status: 'printing',
      payment: 'transfer',
      customer: {
        name: 'Rangga Pratama',
        phone: '081234567890',
        email: 'rangga@example.com',
        address: 'Jl. Kemang Raya No. 24, Kel. Bangka, Mampang Prapatan',
        city: 'Jakarta Selatan',
        postalCode: '12730',
        note: 'Mohon packing rapi, untuk hadiah komunitas.',
      },
      items: [
        sampleItem(first, 1, 'L', 6, {
          enabled: true,
          position: 'depan',
          size: 'a4',
          fileName: 'logo-komunitas.png',
        }),
      ],
      daysAgo: 1,
    },
    {
      status: 'shipped',
      payment: 'qris',
      customer: {
        name: 'Sinta Dewi',
        phone: '081298765432',
        email: 'sinta@example.com',
        address: 'Jl. Raya Darmo No. 88',
        city: 'Surabaya',
        postalCode: '60241',
      },
      items: [sampleItem(hoodie, 0, 'M', 2, null)],
      daysAgo: 4,
    },
    {
      status: 'completed',
      payment: 'cod',
      customer: {
        name: 'Bagas Wirawan',
        phone: '081377712345',
        email: 'bagas@example.com',
        address: 'Jl. Kaliurang KM 7, Sleman',
        city: 'Yogyakarta',
        postalCode: '55581',
      },
      items: [
        sampleItem(first, 0, 'M', 12, {
          enabled: true,
          position: 'belakang',
          size: 'a3',
          fileName: 'event-tee-2026.svg',
        }),
      ],
      daysAgo: 12,
    },
  ]

  const orders: Order[] = orderSeeds.map((seed) => {
    const createdAt = new Date(Date.now() - seed.daysAgo * 24 * 60 * 60 * 1000).toISOString()
    const summary = summarize(seed.items)
    const invoiceNumber = makeInvoiceNumber()

    return {
      id: invoiceNumber,
      invoiceNumber,
      createdAt,
      status: seed.status,
      customer: seed.customer,
      items: seed.items,
      payment: seed.payment,
      ...summary,
      total: summary.subtotal + summary.shipping,
    }
  })

  saveOrders(orders)
}

seedOrdersIfEmpty()

/* ----------------------------------------------------------------------------
 * Products
 * -------------------------------------------------------------------------- */

export const productsApi = {
  list(): Promise<Product[]> {
    return withFallback(
      () => request<Product[]>('/products'),
      () => localProducts(),
    )
  },

  async get(id: string): Promise<Product> {
    return withFallback(
      () => request<Product>(`/products/${encodeURIComponent(id)}`),
      () => {
        const product = localProducts().find((item) => item.id === id)
        if (!product) throw new ApiError('Produk tidak ditemukan', 404)
        return product
      },
    )
  },

  async create(input: ProductInput): Promise<Product> {
    return withFallback(
      () => request<Product>('/products', { method: 'POST', body: JSON.stringify(input) }),
      () => {
        const products = localProducts()
        const product: Product = {
          ...input,
          id: makeId('produk'),
          rating: input.rating ?? 5,
          reviews: input.reviews ?? 0,
          popular: input.popular ?? false,
          isNew: input.isNew ?? true,
        }
        products.unshift(product)
        saveProducts(products)
        return product
      },
    )
  },

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    return withFallback(
      () =>
        request<Product>(`/products/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: JSON.stringify(input),
        }),
      () => {
        const products = localProducts()
        const index = products.findIndex((item) => item.id === id)
        if (index < 0) throw new ApiError('Produk tidak ditemukan', 404)
        const updated = { ...products[index], ...input } as Product
        products[index] = updated
        saveProducts(products)
        return updated
      },
    )
  },

  async remove(id: string): Promise<void> {
    return withFallback(
      () => request<void>(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),
      () => {
        const products = localProducts().filter((item) => item.id !== id)
        saveProducts(products)
      },
    )
  },
}

/* ----------------------------------------------------------------------------
 * Auth
 * -------------------------------------------------------------------------- */

interface StoredUser extends User {
  password: string
}

const SEED_USERS: StoredUser[] = [
  {
    id: 'user-admin',
    name: 'Admin Growtex',
    email: 'admin@growtexstore.id',
    phone: '081200000001',
    role: 'admin',
    password: 'admin123',
  },
  {
    id: 'user-customer',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '081200000002',
    role: 'customer',
    password: 'customer123',
  },
]

function localUsers(): StoredUser[] {
  const stored = readStorage<StoredUser[] | null>(STORAGE.users, null)
  if (stored && stored.length > 0) return stored
  const seed = clone(SEED_USERS)
  writeStorage(STORAGE.users, seed)
  return seed
}

function publicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  }
}

function createToken(user: User) {
  return `gv-demo.${btoa(`${user.id}:${Date.now()}`)}`
}

export const authApi = {
  login(email: string, password: string): Promise<AuthSession> {
    return withFallback(
      () =>
        request<AuthSession>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }),
      () => {
        const normalized = email.trim().toLowerCase()
        const user = localUsers().find((item) => item.email.toLowerCase() === normalized)
        if (!user || user.password !== password) {
          throw new ApiError('Email atau password salah.', 401)
        }
        return { token: createToken(user), user: publicUser(user) }
      },
    )
  },

  register(input: { name: string; email: string; phone?: string; password: string }): Promise<AuthSession> {
    return withFallback(
      () => request<AuthSession>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
      () => {
        const users = localUsers()
        const normalized = input.email.trim().toLowerCase()
        if (users.some((item) => item.email.toLowerCase() === normalized)) {
          throw new ApiError('Email sudah terdaftar. Silakan masuk.', 409)
        }
        const user: StoredUser = {
          id: makeId('user'),
          name: input.name.trim(),
          email: normalized,
          phone: input.phone?.trim(),
          role: 'customer',
          password: input.password,
        }
        users.push(user)
        writeStorage(STORAGE.users, users)
        return { token: createToken(user), user: publicUser(user) }
      },
    )
  },

  me(): Promise<User> {
    return withFallback(
      () => request<User>('/auth/me'),
      () => {
        const session = readStorage<{ user?: User } | null>(STORAGE.session, null)
        if (!session?.user) throw new ApiError('Sesi tidak ditemukan', 401)
        return session.user
      },
    )
  },
}

/* ----------------------------------------------------------------------------
 * Orders
 * -------------------------------------------------------------------------- */

export const ordersApi = {
  async create(input: NewOrderInput): Promise<Order> {
    return withFallback(
      () => request<Order>('/orders', { method: 'POST', body: JSON.stringify(input) }),
      () => {
        if (input.items.length === 0) throw new ApiError('Keranjang masih kosong.', 400)
        const summary = summarize(input.items)
        const invoiceNumber = makeInvoiceNumber()
        const order: Order = {
          id: invoiceNumber,
          invoiceNumber,
          createdAt: new Date().toISOString(),
          status: 'pending',
          customer: input.customer,
          items: input.items,
          payment: input.payment,
          ...summary,
          total: summary.subtotal + summary.shipping,
        }
        const orders = localOrders()
        orders.unshift(order)
        saveOrders(orders)
        return order
      },
    )
  },

  async list(): Promise<Order[]> {
    return withFallback(
      () => request<Order[]>('/orders'),
      () =>
        localOrders().slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    )
  },

  async get(id: string): Promise<Order> {
    return withFallback(
      () => request<Order>(`/orders/${encodeURIComponent(id)}`),
      () => {
        const order = localOrders().find((item) => item.id === id)
        if (!order) throw new ApiError('Invoice tidak ditemukan.', 404)
        return order
      },
    )
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return withFallback(
      () =>
        request<Order>(`/orders/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }),
      () => {
        const orders = localOrders()
        const index = orders.findIndex((item) => item.id === id)
        if (index < 0) throw new ApiError('Pesanan tidak ditemukan.', 404)
        const updated = { ...orders[index], status } as Order
        orders[index] = updated
        saveOrders(orders)
        return updated
      },
    )
  },
}
