import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Phone, Clock, MessageCircle, Star, ArrowLeft, CheckCircle, AlertCircle, Navigation, Loader2 } from 'lucide-react'
import { storeService, productService } from '../api/services'
import { formatPrice } from '../utils/format'

export default function StoreDetailPage() {
  const { id } = useParams()
  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([storeService.getById(Number(id)), productService.getAll({ size: 20 })])
      .then(([s, p]) => { setStore(s); setProducts(p ?? []) })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-green-500" />
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">🏪</p>
        <h2 className="text-2xl font-bold text-gray-900">Store not found</h2>
        <Link to="/stores" className="bg-green-500 text-black font-bold px-6 py-3 rounded-xl text-sm">
          View All Stores
        </Link>
      </div>
    )
  }

  const isOpen = store.active ?? false

  return (
    <div className="bg-[#F8FAFC]">
      {/* Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 max-w-7xl mx-auto">
          <Link to="/stores" className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={14} /> All Stores
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">{store.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${isOpen ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                  {isOpen ? 'Open Now' : 'Closed'}
                </span>
                <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <Star size={13} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold text-white">{store.rating}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`https://wa.me/91${store.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-green-500 text-black font-bold text-sm px-4 py-2.5 rounded-xl"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
              <a
                href={`tel:+91${store.phone?.replace(/\s/g, '')}`}
                className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white font-semibold text-sm px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Phone size={15} /> Call
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Store info */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Store Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Address</p>
                    <p className="text-sm text-gray-700">{store.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Working Hours</p>
                    <p className="text-sm text-gray-700">{store.timings}</p>
                    <p className="text-xs text-gray-400">Monday – Sunday</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                    <a href={`tel:+91${store.phone?.replace(/\s/g, '')}`} className="text-sm text-green-600 font-medium hover:underline">
                      +91 {store.phone}
                    </a>
                  </div>
                </div>
                {store.distance && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <Navigation size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Distance</p>
                      <p className="text-sm text-gray-700">{store.distance}</p>
                    </div>
                  </div>
                )}
              </div>
              {store.lat && store.lng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-[#07111F] hover:bg-green-500 text-white hover:text-black font-bold text-sm py-3 rounded-xl transition-colors"
                >
                  <MapPin size={15} /> Get Directions
                </a>
              )}
            </div>

            {store.lat && store.lng && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <iframe
                  title={`${store.name} Map`}
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806!2d${store.lng}!3d${store.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${store.lat}!5e0!3m2!1sen!2sin!4v1700000000000`}
                  width="100%"
                  height="220"
                  className="border-0"
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Products available */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Available Products</h2>
                <span className="text-xs text-gray-400">{products.length} products</span>
              </div>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No products available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-5 py-3">Product</th>
                        <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Price</th>
                        <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Availability</th>
                        <th className="px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-10 object-cover rounded-lg border border-gray-100 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</p>
                                {product.processor && product.processor !== '-' && (
                                  <p className="text-xs text-gray-400 line-clamp-1">{product.processor} · {product.ram}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-bold text-green-600 text-sm">{formatPrice(product.price)}</p>
                            <p className="text-xs text-gray-400 line-through">{formatPrice(product.mrp)}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                              <CheckCircle size={13} />
                              In Stock
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <Link
                              to={`/products/${product.id}`}
                              className="text-xs text-green-600 hover:text-green-700 font-semibold hover:underline whitespace-nowrap"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
