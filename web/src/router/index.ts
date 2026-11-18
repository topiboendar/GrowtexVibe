import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'store' | 'admin'
    requiresAuth?: boolean
    requiresAdmin?: boolean
    guestOnly?: boolean
    title?: string
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { layout: 'store', title: 'Beranda' },
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: () => import('@/views/ProductDetailView.vue'),
    meta: { layout: 'store', title: 'Detail Produk' },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/CheckoutView.vue'),
    meta: { layout: 'store', title: 'Checkout' },
  },
  {
    path: '/invoice/:id',
    name: 'invoice',
    component: () => import('@/views/InvoiceView.vue'),
    meta: { layout: 'store', title: 'Invoice' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { layout: 'store', guestOnly: true, title: 'Masuk' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { layout: 'store', guestOnly: true, title: 'Daftar' },
  },

  /* ---------------------------------------------------------------- admin */
  {
    path: '/admin',
    redirect: { name: 'admin-orders' },
    meta: { layout: 'admin', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('@/views/admin/AdminOrdersView.vue'),
    meta: { layout: 'admin', requiresAuth: true, requiresAdmin: true, title: 'Pesanan' },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('@/views/admin/AdminProductsView.vue'),
    meta: { layout: 'admin', requiresAuth: true, requiresAdmin: true, title: 'Produk' },
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'home' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 96 }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return auth.isAdmin ? { name: 'admin-orders' } : { name: 'home' }
  }

  return true
})

router.afterEach((to) => {
  const suffix = 'GrowtexStore'
  document.title = to.meta.title ? `${to.meta.title} · ${suffix}` : suffix
})

export default router
