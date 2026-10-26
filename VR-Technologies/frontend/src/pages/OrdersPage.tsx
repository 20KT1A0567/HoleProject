import { Link } from 'react-router-dom'
import { Package, ChevronRight, ShoppingBag } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { formatPrice } from '../utils/format'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PLACED: { label: 'Order Placed', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  CONFIRMED: { label: 'Confirmed', color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
  PROCESSING: { label: 'Processing', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  SHIPPED: { label: 'Shipped', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  DELIVERED: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
}

const DEMO_ORDERS = [
  {
    id: 'VRT-2024-0001',
    date: '2024-12-20',
    items: [{ name: 'Lenovo ThinkPad T480', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=80', quantity: 1, price: 32999 }],
    total: 32999,
    status: 'DELIVERED',
    delivery: 'home',
  },
  {
    id: 'VRT-2024-0002',
    date: '2025-01-05',
    items: [
      { name: 'HP EliteBook 840 G5', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80', quantity: 1, price: 28999 },
      { name: 'Logitech MX Keys', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80', quantity: 1, price: 4999 },
    ],
    total: 33998,
    status: 'SHIPPED',
    delivery: 'home',
  },
  {
    id: 'VRT-2024-0003',
    date: '2025-01-18',
    items: [{ name: 'Dell Latitude 5490', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=80', quantity: 1, price: 39999 }],
    total: 39999,
    status: 'PROCESSING',
    delivery: 'pickup',
  },
]

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <Package size={36} className="text-gray-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please sign in to view orders</h2>
          <p className="text-gray-500 mb-6">Sign in to track your orders and purchase history</p>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3 rounded-xl text-sm">
            Sign In
          </Link>
          <Link to="/register" className="border border-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-xl text-sm hover:border-green-400">
            Create Account
          </Link>
        </div>
      </div>
    )
  }

  if (DEMO_ORDERS.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingBag size={36} className="text-gray-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start shopping!</p>
        </div>
        <Link to="/products" className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3 rounded-xl text-sm">
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-4">Order</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-4">Date</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-4">Items</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-4">Amount</th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-4">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {DEMO_ORDERS.map((order) => {
              const status = STATUS_CONFIG[order.status]
              return (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 text-sm">{order.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.delivery === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-700">
                      {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <img
                          key={i}
                          src={item.image}
                          alt={item.name}
                          className="w-9 h-9 rounded-lg border-2 border-white object-cover"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-gray-900 text-sm">{formatPrice(order.total)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/orders/${order.id}`}
                      className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-semibold"
                    >
                      Track <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {DEMO_ORDERS.map((order) => {
          const status = STATUS_CONFIG[order.status]
          return (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{order.id}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {order.items.slice(0, 3).map((item, i) => (
                  <img key={i} src={item.image} alt={item.name} className="w-10 h-10 rounded-lg border border-gray-200 object-cover" />
                ))}
                <div className="ml-1">
                  <p className="text-sm text-gray-700 font-medium line-clamp-1">{order.items[0].name}</p>
                  {order.items.length > 1 && <p className="text-xs text-gray-400">+{order.items.length - 1} more</p>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                <Link
                  to={`/orders/${order.id}`}
                  className="flex items-center gap-1 bg-green-500 text-black text-xs font-bold px-4 py-2 rounded-lg"
                >
                  Track Order <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
