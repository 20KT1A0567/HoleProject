import api from './axios'
import { SAMPLE_PRODUCTS, STORES } from '../data/products'

// ─── Products ───────────────────────────────────────────────────────────────

export interface ProductFilter {
  page?: number
  size?: number
  search?: string
  brand?: string
  category?: string
  sortBy?: string
}

export const productService = {
  getAll: async (filters: ProductFilter = {}) => {
    const params = new URLSearchParams()
    if (filters.page !== undefined) params.set('page', String(filters.page))
    if (filters.size !== undefined) params.set('size', String(filters.size))
    if (filters.search) params.set('search', filters.search)
    if (filters.brand) params.set('brand', filters.brand)
    if (filters.category) params.set('category', filters.category)
    if (filters.sortBy) params.set('sortBy', filters.sortBy)
    try {
      const res = await api.get(`/products?${params}`)
      return res.data.content ?? res.data ?? []
    } catch {
      let products = [...SAMPLE_PRODUCTS]
      if (filters.category) products = products.filter((p) => p.category === filters.category)
      if (filters.search) {
        const q = filters.search.toLowerCase()
        products = products.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
      }
      return products
    }
  },

  getById: async (id: number) => {
    try {
      const res = await api.get(`/products/${id}`)
      return res.data
    } catch {
      return SAMPLE_PRODUCTS.find((p) => p.id === id) ?? null
    }
  },

  getFeatured: async () => {
    try {
      const res = await api.get('/products/featured')
      return res.data ?? []
    } catch {
      return SAMPLE_PRODUCTS.slice(0, 5)
    }
  },
}

// ─── Stores ─────────────────────────────────────────────────────────────────

export const storeService = {
  getAll: async () => {
    try {
      const res = await api.get('/stores')
      return res.data ?? []
    } catch {
      return STORES
    }
  },

  getById: async (id: number) => {
    try {
      const res = await api.get(`/stores/${id}`)
      return res.data
    } catch {
      return STORES.find((s) => s.id === id) ?? null
    }
  },
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  },

  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.post('/auth/register', data)
    return res.data
  },

  me: async () => {
    const res = await api.get('/auth/me')
    return res.data
  },
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export const orderService = {
  myOrders: async () => {
    try {
      const res = await api.get('/orders/my')
      return res.data
    } catch {
      return []
    }
  },

  getById: async (id: string) => {
    try {
      const res = await api.get(`/orders/${id}`)
      return res.data
    } catch {
      return null
    }
  },

  place: async (order: unknown) => {
    const res = await api.post('/orders', order)
    return res.data
  },
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export const cartService = {
  get: async () => {
    try {
      const res = await api.get('/cart')
      return res.data
    } catch {
      return []
    }
  },

  add: async (productId: number, quantity: number, storeId?: number) => {
    const res = await api.post('/cart/add', { productId, quantity, storeId })
    return res.data
  },

  update: async (itemId: number, quantity: number) => {
    const res = await api.put('/cart/update', { itemId, quantity })
    return res.data
  },

  remove: async (itemId: number) => {
    const res = await api.delete(`/cart/remove/${itemId}`)
    return res.data
  },
}

// ─── Coupons ─────────────────────────────────────────────────────────────────

export const couponService = {
  validate: async (code: string, amount: number) => {
    try {
      const res = await api.post('/coupons/validate', { code, amount })
      return res.data
    } catch {
      // Mock coupons for dev
      if (code === 'VRT10') return { valid: true, discount: Math.round(amount * 0.1), message: '10% off applied!' }
      if (code === 'SAVE500') return { valid: true, discount: 500, message: '₹500 off applied!' }
      return { valid: false, discount: 0, message: 'Invalid coupon code' }
    }
  },
}
