<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AdminShell from '@/components/AdminShell.vue'
import CartDrawer from '@/components/CartDrawer.vue'
import Footer from '@/components/Footer.vue'
import Navbar from '@/components/Navbar.vue'

const route = useRoute()
const isAdminLayout = computed(() => route.meta.layout === 'admin')
</script>

<template>
  <AdminShell v-if="isAdminLayout">
    <RouterView />
  </AdminShell>

  <div v-else class="flex min-h-screen flex-col">
    <Navbar />
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer />
    <CartDrawer />
  </div>
</template>
