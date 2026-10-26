import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Circle, Package, Truck, Home, MapPin, Phone, ArrowLeft } from 'lucide-react'
import { formatPrice } from '../utils/format'

const TRACKING_STEPS = [
  { id: 'PLACED', label: 'Order Placed', desc: 'Your order has been received', icon: Package },
  { id: 'CONFIRMED', label: 'Order Confirmed', desc: 'Seller has confirmed your order', icon: CheckCircle },
  { id: 'PROCESSING', label: 'Processing', desc: 'Item is being prepared for dispatch', icon: Package },
  { id: 'SHIPPED', label: 'Out for Delivery', desc: 'Your order is on the way', icon: Truck },
  { id: 'DELIVERED', label: 'Delivered', desc: 'Order delivered successfully', icon: Home },
]

const DEMO_ORDER = {
  id: 'VRT-2024-0001',
  status: 'SHIPPED',
  date: '2024-12-20',
  expectedDelivery: '2024-12-23',
  delivery: 'home',
  address: '4-5-577, Ameerpet, Hyderabad, Telangana - 500016',
  items: [
    {
      name: 'Lenovo ThinkPad T480',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=80',
      quantity: 1,
      price: 32999,
      specs: 'Intel i7 · 8GB · 256GB SSD',
    },
  ],
  total: 32999,
  delivery_charge: 0,
  tracking: [
    { status: 'PLACED', label: 'Order Placed', timestamp: '20 Dec, 10:30 AM', done: true },
    { status: 'CONFIRMED', label: 'Order Confirmed', timestamp: '20 Dec, 11:00 AM', done: true },
    { status: 'PROCESSING', label: 'Processing Started', timestamp: '21 Dec, 9:00 AM', done: true },
    { status: 'SHIPPED', label: 'Out for Delivery', timestamp: '23 Dec, 8:30 AM', done: true },
    { status: 'DELIVERED', label: 'Delivered', timestamp: 'Expected by 9 PM today', done: false },
  ],
}

export default function OrderTrackingPage() {
  const { id } = useParams()
  const order = DEMO_ORDER

  const currentStepIndex = TRACKING_STEPS.findIndex((s) => s.id === order.status)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/orders" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
          <p className="text-gray-500 text-sm mt-1">Order ID: <span className="font-semibold text-gray-800">{id || order.id}</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Ordered on</p>
          <p className="font-semibold text-gray-900">
            {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking steps */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-6">Order Status</h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />

              <div className="space-y-6">
                {order.tracking.map((step, index) => (
                  <div key={index} className="relative flex items-start gap-4">
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                      step.done
                        ? 'bg-green-500 border-green-500 text-white'
                        : index === currentStepIndex + 1
                        ? 'bg-white border-green-300 text-green-400'
                        : 'bg-gray-50 border-gray-200 text-gray-300'
                    }`}>
                      {step.done ? (
                        <CheckCircle size={18} className="fill-white" />
                      ) : (
                        <Circle size={18} />
                      )}
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold text-sm ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        <p className={`text-xs ${step.done ? 'text-gray-500' : 'text-gray-300'}`}>
                          {step.timestamp}
                        </p>
                      </div>
                      {step.done && index === currentStepIndex && (
                        <p className="text-xs text-green-600 font-medium mt-0.5">Current Status</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected delivery */}
            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3">
              <Truck size={20} className="text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Expected Delivery</p>
                <p className="text-sm text-green-700">
                  {new Date(order.expectedDelivery).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Delivery Information</h2>
            {order.delivery === 'home' ? (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Home Delivery</p>
                  <p className="text-sm text-gray-500 mt-1">{order.address}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <Home size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Store Pickup</p>
                  <p className="text-sm text-gray-500 mt-1">VR Technologies – Ameerpet</p>
                </div>
              </div>
            )}
          </div>

          {/* Support */}
          <div className="bg-[#07111F] rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white font-semibold text-sm">Need help with this order?</p>
              <p className="text-gray-400 text-xs mt-0.5">Our support team is available 10AM - 9PM</p>
            </div>
            <div className="flex gap-2">
              <a
                href="tel:+919100012345"
                className="flex items-center gap-1.5 bg-green-500 text-black font-bold text-sm px-4 py-2 rounded-xl"
              >
                <Phone size={14} /> Call Us
              </a>
              <Link to="/contact" className="flex items-center gap-1.5 border border-gray-700 text-gray-300 text-sm px-4 py-2 rounded-xl hover:border-green-500 transition-colors">
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3 mb-4">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm line-clamp-2">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.specs}</p>
                  <p className="text-sm font-bold text-green-600 mt-1">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2">
                <span>Total</span>
                <span className="text-green-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Actions</h3>
            <button className="w-full text-left text-sm text-gray-700 hover:text-green-600 py-2 border-b border-gray-50 transition-colors">
              Download Invoice
            </button>
            <button className="w-full text-left text-sm text-gray-700 hover:text-orange-600 py-2 border-b border-gray-50 transition-colors">
              Request Return
            </button>
            <button className="w-full text-left text-sm text-gray-700 hover:text-red-600 py-2 transition-colors">
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
