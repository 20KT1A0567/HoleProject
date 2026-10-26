import api from './axios'

// ─── Dashboard ──────────────────────────────────────────────────────────────

export const dashboardService = {
  getStats: async () => {
    try {
      const res = await api.get('/admin/dashboard/stats')
      return res.data
    } catch { return null }
  },
  getSalesChart: async () => {
    try {
      const res = await api.get('/admin/dashboard/sales-chart')
      return res.data ?? []
    } catch { return [] }
  },
  getOrderOverview: async () => {
    try {
      const res = await api.get('/admin/dashboard/order-overview')
      return res.data ?? []
    } catch { return [] }
  },
  getSalesByStore: async () => {
    try {
      const res = await api.get('/admin/dashboard/sales-by-store')
      return res.data ?? []
    } catch { return [] }
  },
  getLowStock: async () => {
    try {
      const res = await api.get('/admin/dashboard/low-stock')
      return res.data ?? []
    } catch { return [] }
  },
  getStoreSummary: async () => {
    try {
      const res = await api.get('/admin/dashboard/store-summary')
      return res.data ?? []
    } catch { return [] }
  },
  getTopProducts: async () => {
    try {
      const res = await api.get('/admin/dashboard/top-products')
      return res.data ?? []
    } catch { return [] }
  },
  getActivities: async () => {
    try {
      const res = await api.get('/admin/dashboard/activities')
      return res.data ?? []
    } catch { return [] }
  },
}

// ─── Products ───────────────────────────────────────────────────────────────

export const adminProductService = {
  getAll: async (params?: Record<string, string>) => {
    try {
      const q = params ? '?' + new URLSearchParams(params).toString() : ''
      const res = await api.get(`/admin/products${q}`)
      return res.data.content ?? res.data ?? []
    } catch { return [] }
  },
  getById: async (id: number) => {
    try {
      const res = await api.get(`/admin/products/${id}`)
      return res.data
    } catch { return null }
  },
  create: async (data: unknown) => {
    const res = await api.post('/admin/products', data)
    return res.data
  },
  update: async (id: number, data: unknown) => {
    const res = await api.put(`/admin/products/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    await api.delete(`/admin/products/${id}`)
  },
  toggleStatus: async (id: number) => {
    const res = await api.patch(`/admin/products/${id}/toggle-status`)
    return res.data
  },
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export const adminOrderService = {
  getAll: async () => {
    try {
      const res = await api.get('/admin/orders')
      return res.data.content ?? res.data ?? []
    } catch { return [] }
  },
  getById: async (id: string) => {
    try {
      const res = await api.get(`/admin/orders/${id}`)
      return res.data
    } catch { return null }
  },
  updateStatus: async (id: string, status: string) => {
    const res = await api.patch(`/admin/orders/${id}/status`, { status })
    return res.data
  },
}

// ─── Customers ──────────────────────────────────────────────────────────────

export const adminCustomerService = {
  getAll: async () => {
    try {
      const res = await api.get('/admin/customers')
      return res.data.content ?? res.data ?? []
    } catch { return [] }
  },
}

// ─── Stores ─────────────────────────────────────────────────────────────────

export const adminStoreService = {
  getAll: async () => {
    try {
      const res = await api.get('/admin/stores')
      return res.data ?? []
    } catch { return [] }
  },
  create: async (data: unknown) => {
    const res = await api.post('/admin/stores', data)
    return res.data
  },
  update: async (id: number, data: unknown) => {
    const res = await api.put(`/admin/stores/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    await api.delete(`/admin/stores/${id}`)
  },
}

// ─── Inventory ──────────────────────────────────────────────────────────────

export const adminInventoryService = {
  getAll: async () => {
    try {
      const res = await api.get('/admin/inventory')
      return res.data ?? []
    } catch { return [] }
  },
  updateStock: async (productId: number, storeIdOrRow: number | Record<string, unknown>, quantity?: number) => {
    const payload = typeof storeIdOrRow === 'number'
      ? { productId, storeId: storeIdOrRow, quantity }
      : { productId, ...storeIdOrRow }
    const res = await api.put('/admin/inventory', payload)
    return res.data
  },
}

// ─── Categories ─────────────────────────────────────────────────────────────

export const adminCategoryService = {
  getAll: async () => {
    try {
      const res = await api.get('/admin/categories')
      return res.data ?? []
    } catch { return [] }
  },
  create: async (data: unknown) => {
    const res = await api.post('/admin/categories', data)
    return res.data
  },
  update: async (id: number, data: unknown) => {
    const res = await api.put(`/admin/categories/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    await api.delete(`/admin/categories/${id}`)
  },
}

// ─── Brands ─────────────────────────────────────────────────────────────────

export const adminBrandService = {
  getAll: async () => {
    try {
      const res = await api.get('/admin/brands')
      return res.data ?? []
    } catch { return [] }
  },
  create: async (data: unknown) => {
    const res = await api.post('/admin/brands', data)
    return res.data
  },
  update: async (id: number, data: unknown) => {
    const res = await api.put(`/admin/brands/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    await api.delete(`/admin/brands/${id}`)
  },
}

// ─── Banners ─────────────────────────────────────────────────────────────────

export const adminBannerService = {
  getAll: async () => {
    try {
      const res = await api.get('/admin/banners')
      return res.data ?? []
    } catch { return [] }
  },
  create: async (data: unknown) => {
    const res = await api.post('/admin/banners', data)
    return res.data
  },
  update: async (id: number, data: unknown) => {
    const res = await api.put(`/admin/banners/${id}`, data)
    return res.data
  },
  delete: async (id: number) => {
    await api.delete(`/admin/banners/${id}`)
  },
}

// ─── Coupons ─────────────────────────────────────────────────────────────────

export const adminCouponService = {
  getAll: async () => {
    try {
      const res = await api.get('/admin/coupons')
      return res.data ?? []
    } catch { return [] }
  },
  create: async (data: unknown) => {
    const res = await api.post('/admin/coupons', data)
    return res.data
  },
  delete: async (id: number) => {
    await api.delete(`/admin/coupons/${id}`)
  },
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const adminReviewService = {
  getAll: async () => {
    try {
      const res = await api.get('/admin/reviews')
      return res.data ?? []
    } catch { return [] }
  },
  delete: async (id: number) => {
    await api.delete(`/admin/reviews/${id}`)
  },
}

// ─── Admin Users ─────────────────────────────────────────────────────────────

export const adminUserService = {
  getAll: async () => {
    try {
      const res = await api.get('/admin/users')
      return res.data ?? []
    } catch { return [] }
  },
  create: async (data: unknown) => {
    const res = await api.post('/admin/users', data)
    return res.data
  },
  delete: async (id: number) => {
    await api.delete(`/admin/users/${id}`)
  },
}

// ─── Media Upload (S3) ──────────────────────────────────────────────────────

export const uploadService = {
  uploadImage: async (file: File, folder = 'images'): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await api.post('/admin/upload/image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.url
  },
  uploadVideo: async (file: File, folder = 'videos'): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await api.post('/admin/upload/video', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.url
  },
  deleteByUrl: async (url: string): Promise<void> => {
    await api.delete('/admin/upload', { params: { url } })
  },
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export type WhatsAppCampaignStartResponse = {
  campaignId: string
  status: string
  totalRows: number
  message: string
}

export type WhatsAppCampaignStatus = {
  campaignId: string
  templateName: string
  sourceFileName: string
  activeOnly: boolean
  headerMediaUrl: string
  status: string
  errorMessage?: string
  totalRows: number
  processed: number
  sent: number
  failed: number
  skipped: number
  results: Array<{
    rowNumber: number
    name: string
    phoneNumber: string
    status: string
    message: string
  }>
}

export const whatsAppCampaignService = {
  startAppVideoCampaign: async (data: {
    file: File
    headerMediaUrl: string
    activeOnly: boolean
  }): Promise<WhatsAppCampaignStartResponse> => {
    const fd = new FormData()
    fd.append('file', data.file)
    fd.append('headerMediaUrl', data.headerMediaUrl)
    fd.append('activeOnly', String(data.activeOnly))
    const res = await api.post('/admin/notifications/whatsapp-campaigns/app-video-v1', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
  getStatus: async (campaignId: string): Promise<WhatsAppCampaignStatus> => {
    const res = await api.get(`/admin/notifications/whatsapp-campaigns/${campaignId}`)
    return res.data
  },
}

export const adminReportService = {
  getRevenueTrend: async () => {
    try {
      const res = await api.get('/admin/reports/revenue-trend')
      return res.data ?? []
    } catch { return [] }
  },
  getSalesByStore: async () => {
    try {
      const res = await api.get('/admin/reports/sales-by-store')
      return res.data ?? []
    } catch { return [] }
  },
  getSalesByCategory: async () => {
    try {
      const res = await api.get('/admin/reports/sales-by-category')
      return res.data ?? []
    } catch { return [] }
  },
}
