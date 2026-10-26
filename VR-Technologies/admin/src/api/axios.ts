import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

const STORAGE_KEY = 'vr-admin-auth'
const MOCK_TOKEN = 'mock-jwt-token'

// Boot-time cleanup: if the persisted auth was created by the OLD mock login
// (token === 'mock-jwt-token'), wipe it so ProtectedRoute sends the user back
// to /login instead of leaving them stuck on dashboard with no real token.
;(() => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return
  try {
    const parsed = JSON.parse(stored)
    const token = parsed?.state?.token
    if (!token || token === MOCK_TOKEN) {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
})()

const readToken = (): string | null => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null
  try {
    const token = JSON.parse(stored)?.state?.token
    return token && token !== MOCK_TOKEN ? token : null
  } catch {
    return null
  }
}

const clearAuthAndRedirect = () => {
  localStorage.removeItem(STORAGE_KEY)
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

api.interceptors.request.use((config) => {
  const token = readToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    const url: string = err?.config?.url ?? ''
    // Only auto-logout on 401 (auth truly failed / token expired).
    // 403 means authenticated but lacking permission for that one endpoint —
    // don't kick the user out, the page just renders empty for that call.
    if (status === 401 && !url.includes('/auth/login')) {
      clearAuthAndRedirect()
    }
    return Promise.reject(err)
  }
)

export default api
