import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { formatPrice } from '../utils/format'

interface Product {
  id: number
  name: string
  brand: string
  category: string
  processor: string
  ram: string
  storage: string
  price: number
  mrp: number
  rating: number
  reviews: number
  condition: string
  warranty: number
  image: string
  discount: number
}

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const { toggle, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 })
    toast.success(`${product.name} added to cart!`)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(product.id)
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!')
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group vr-panel flex flex-col overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#7ed321]/70 hover:shadow-[0_22px_55px_rgba(49,88,22,0.16)]"
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-b from-[#f8fbf5] to-[#eef6e8]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[#68b927] px-2.5 py-1 text-xs font-black text-white shadow-lg">
          {product.discount}% OFF
        </span>
        <button
          onClick={handleWishlist}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow transition-transform hover:scale-110"
          aria-label="Toggle wishlist"
        >
          <Heart size={16} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-black uppercase tracking-wide text-[#5b8f23]">{product.brand}</p>
        <h3 className="mt-1 min-h-10 text-sm font-black leading-snug text-[#111811] transition-colors group-hover:text-[#4f9f13]">
          {product.name}
        </h3>
        {product.processor !== '-' && (
          <p className="mt-1 line-clamp-1 text-xs text-gray-500">
            {product.processor} / {product.ram} / {product.storage}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1">
          <div className="flex items-center gap-0.5 text-[#69b820]">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={12} className={s <= Math.round(product.rating) ? 'fill-current' : ''} />
            ))}
          </div>
          <span className="text-xs text-gray-500">{product.rating} ({product.reviews})</span>
        </div>

        <div className="mt-auto flex items-end gap-2 pt-4">
          <span className="text-xl font-black text-[#165d16]">{formatPrice(product.price)}</span>
          <span className="text-sm text-gray-400 line-through">{formatPrice(product.mrp)}</span>
        </div>

        <button
          onClick={handleAddToCart}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#dff2cf] py-2.5 text-sm font-black text-[#2f7411] transition-all duration-200 hover:bg-[#66b820] hover:text-white"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </Link>
  )
}
