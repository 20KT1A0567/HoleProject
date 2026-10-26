import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistStore {
  items: number[]
  toggle: (productId: number) => void
  isWishlisted: (productId: number) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (productId) => {
        const items = get().items
        if (items.includes(productId)) {
          set({ items: items.filter((id) => id !== productId) })
        } else {
          set({ items: [...items, productId] })
        }
      },

      isWishlisted: (productId) => get().items.includes(productId),
    }),
    { name: 'vr-wishlist' }
  )
)
