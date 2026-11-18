import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi, setAuthToken, type AuthSession, type Role, type User } from '@/api'

const STORAGE_KEY = 'gv:session'

interface RegisterInput {
  name: string
  email: string
  phone?: string
  password: string
}

function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed?.token || !parsed?.user) return null
    return parsed
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(user.value && token.value))
  const isAdmin = computed(() => user.value?.role === 'admin')
  const role = computed<Role | null>(() => user.value?.role ?? null)
  const displayName = computed(() => user.value?.name ?? 'Tamu')
  const initials = computed(() =>
    displayName.value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join(''),
  )

  function persist(session: AuthSession | null) {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function apply(session: AuthSession) {
    user.value = session.user
    token.value = session.token
    setAuthToken(session.token)
    persist(session)
  }

  function restore() {
    const session = readSession()
    if (!session) return
    user.value = session.user
    token.value = session.token
    setAuthToken(session.token)
  }

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const session = await authApi.login(email, password)
      apply(session)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Gagal masuk. Coba lagi.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(input: RegisterInput): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const session = await authApi.register(input)
      apply(session)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Gagal mendaftar. Coba lagi.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function refresh(): Promise<void> {
    if (!token.value) return
    try {
      const fresh = await authApi.me()
      user.value = fresh
      persist({ token: token.value, user: fresh })
    } catch {
      /* biarkan sesi lokal apa adanya */
    }
  }

  function logout() {
    user.value = null
    token.value = null
    error.value = null
    setAuthToken(null)
    persist(null)
  }

  restore()

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    role,
    displayName,
    initials,
    login,
    register,
    refresh,
    logout,
  }
})
