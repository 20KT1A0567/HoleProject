import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star,
  Heart,
  ShoppingCart,
  Shield,
  RotateCcw,
  Truck,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Minus,
  Plus,
  Loader2,
} from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { formatPrice, formatDiscount } from '../utils/format'
import ProductCard from '../components/ProductCard'
import toast from 'react-hot-toast'
import { productService, storeService } from '../api/services'

const TABS = ['Description', 'Specifications', 'Reviews', 'Shipping & Returns']

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<any | null>(null)
  const [stores, setStores] = useState<any[]>([])
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loadingProduct, setLoadingProduct] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoadingProduct(true)
    Promise.all([
      productService.getById(Number(id)),
      storeService.getAll(),
    ]).then(([prod, storesData]) => {
      setProduct(prod ?? null)
      setStores(storesData ?? [])
      if (prod?.category) {
        productService.getAll({ category: prod.category, size: 5 })
          .then(data => setRelatedProducts((data ?? []).filter((p: any) => p.id !== Number(id)).slice(0, 4)))
      }
    }).finally(() => setLoadingProduct(false))
  }, [id])
  const [selectedImg, setSelectedImg] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('Description')
  const addItem = useCartStore((s) => s.addItem)
  const { toggle, isWishlisted } = useWishlistStore()

  if (loadingProduct) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-green-500" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">😕</p>
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <Link to="/products" className="bg-green-500 text-black font-bold px-6 py-3 rounded-xl text-sm">
          Browse Products
        </Link>
      </div>
    )
  }

  const wishlisted = isWishlisted(product.id)

  const images = [
    product.image,
    `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400`,
    `https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400`,
    `https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400`,
  ]

  const handleAddToCart = () => {
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.image, quantity })
    toast.success(`${product.name} added to cart!`, { icon: '🛒' })
  }

  const handleBuyNow = () => {
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.image, quantity })
    navigate('/checkout')
  }

  const conditionColor =
    product.condition === 'Like New' ? 'bg-green-100 text-green-700 border-green-200'
    : product.condition === 'Excellent' ? 'bg-blue-100 text-blue-700 border-blue-200'
    : 'bg-yellow-100 text-yellow-700 border-yellow-200'

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-green-600">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-green-600">Products</Link>
        <ChevronRight size={14} />
        <Link to={`/products?category=${product.category}`} className="hover:text-green-600">{product.category}</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Image Gallery */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImg(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImg === i ? 'border-green-500 shadow-md' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {/* Main image */}
          <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative">
            <img src={images[selectedImg]} alt={product.name} className="w-full h-80 md:h-96 object-cover" />
            <span className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              -{formatDiscount(product.price, product.mrp)} OFF
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-green-600 font-semibold mb-1">{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1 bg-green-500 text-white text-sm px-2 py-1 rounded-lg">
              <Star size={14} className="fill-white" />
              <span className="font-bold">{product.rating}</span>
            </div>
            <span className="text-gray-500 text-sm">{product.reviews} verified reviews</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${conditionColor}`}>
              {product.condition}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-black text-green-600">{formatPrice(product.price)}</span>
            <span className="text-lg text-gray-400 line-through">{formatPrice(product.mrp)}</span>
            <span className="text-sm font-bold text-orange-500">Save {formatPrice(product.mrp - product.price)}</span>
          </div>
          <p className="text-xs text-gray-500 mb-5">Inclusive of all taxes</p>

          {/* Warranty & Return */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
              <Shield size={13} /> {product.warranty}-Month Warranty
            </div>
            <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-orange-100">
              <RotateCcw size={13} /> 7-Day Return
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-100">
              <Truck size={13} /> Free Delivery
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-semibold text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white font-bold py-3 rounded-xl transition-all text-sm"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Buy Now
            </button>
          </div>

          {/* Wishlist */}
          <button
            onClick={() => {
              toggle(product.id)
              toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', { icon: wishlisted ? '💔' : '❤️' })
            }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <Heart size={16} className={wishlisted ? 'fill-red-500 text-red-500' : ''} />
            {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </button>

          {/* Store Stock */}
          <div className="mt-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Store Availability</h3>
            <div className="space-y-2">
              {stores.map((store) => {
                const stock = product.storeStock[store.name.split('–')[1]?.trim() as keyof typeof product.storeStock] ?? 0
                return (
                  <div key={store.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{store.name}</span>
                    {stock > 0 ? (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle size={14} />
                        In Stock ({stock} units)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 font-medium">
                        <AlertCircle size={14} />
                        Out of Stock
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-12">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-green-600 border-green-500'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'Description' && (
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="mb-4">
                The <strong>{product.name}</strong> is a premium refurbished {product.category.toLowerCase().slice(0, -1)} sourced from corporate environments and thoroughly tested to meet our quality standards.
              </p>
              <p className="mb-4">
                This unit has been inspected, cleaned, and certified by our expert technicians. The device comes in <strong>{product.condition}</strong> condition with a <strong>{product.warranty}-month warranty</strong> for complete peace of mind.
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>40-point quality inspection completed</li>
                <li>All keys, ports, and components tested</li>
                <li>Battery health checked and certified</li>
                <li>Original OS installed and activated</li>
                <li>Cosmetically cleaned and polished</li>
              </ul>
            </div>
          )}

          {activeTab === 'Specifications' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Processor', product.processor],
                    ['RAM', product.ram],
                    ['Storage', product.storage],
                    ['Storage Type', product.storage.includes('SSD') ? 'SSD' : 'HDD'],
                    ['Condition', product.condition],
                    ['Warranty', `${product.warranty} months`],
                    ['Brand', product.brand],
                    ['Category', product.category],
                    ...(product.category === 'Laptops' ? [
                      ['Display', '15.6" FHD (1920x1080)'],
                      ['OS', 'Windows 11 Pro'],
                      ['Weight', '1.8 kg'],
                    ] : []),
                    ['SKU', `VRT-${product.id.toString().padStart(4, '0')}`],
                  ].map(([key, val]) => (
                    <tr key={key} className="border-b border-gray-50 even:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-gray-700 w-1/3">{key}</td>
                      <td className="py-3 px-4 text-gray-600">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div>
              <div className="flex items-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-5xl font-black text-gray-900">{product.rating}</p>
                  <div className="flex items-center justify-center gap-0.5 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} className={s <= Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">{product.reviews} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4">{stars}</span>
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${stars === 5 ? 65 : stars === 4 ? 22 : stars === 3 ? 8 : stars === 2 ? 3 : 2}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-8">{stars === 5 ? '65%' : stars === 4 ? '22%' : stars === 3 ? '8%' : '3%'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Rajesh K.', rating: 5, date: '2 weeks ago', text: 'Excellent condition! Exactly as described. The laptop works perfectly. Great value for money.' },
                  { name: 'Priya M.', rating: 4, date: '1 month ago', text: 'Very good product. Minor cosmetic scratches but performance is great. Warranty support is excellent.' },
                  { name: 'Suresh R.', rating: 5, date: '3 weeks ago', text: 'Bought from Ameerpet store. Staff was very helpful. Product is in like-new condition. Highly recommend.' },
                ].map((review) => (
                  <div key={review.name} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {review.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                          <p className="text-xs text-gray-400">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Shipping & Returns' && (
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Truck size={16} className="text-green-500" /> Shipping Policy</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" /> Free delivery within Hyderabad (2-3 business days)</li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" /> PAN India shipping available (₹199 flat)</li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" /> Same-day delivery for orders placed before 12 PM (select areas)</li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" /> Store pickup available from all 4 VR Technologies locations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><RotateCcw size={16} className="text-orange-500" /> Returns Policy</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" /> 7-day no-questions-asked return policy</li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" /> Product must be in original condition with all accessories</li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" /> Refund processed within 5-7 business days</li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" /> Visit any store for instant return/exchange</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
            <Link to={`/products?category=${product.category}`} className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
