import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, Shield, RotateCcw, Truck } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { formatPrice } from '../utils/format'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCartStore()
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const navigate = useNavigate()

  const subtotal = total()
  const discount = couponApplied ? couponDiscount : 0
  const delivery = subtotal > 20000 ? 0 : 199
  const finalTotal = subtotal - discount + delivery

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'VRT10') {
      const d = Math.round(subtotal * 0.1)
      setCouponDiscount(d)
      setCouponApplied(true)
      toast.success(`Coupon applied! You save ${formatPrice(d)}`, { icon: '🎉' })
    } else if (coupon.toUpperCase() === 'SAVE500') {
      setCouponDiscount(500)
      setCouponApplied(true)
      toast.success('Coupon applied! You save ₹500', { icon: '🎉' })
    } else {
      toast.error('Invalid coupon code')
    }
  }

  const handleRemoveCoupon = () => {
    setCoupon('')
    setCouponApplied(false)
    setCouponDiscount(0)
    toast('Coupon removed', { icon: '✂️' })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingBag size={40} className="text-gray-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything yet. Start exploring!</p>
        </div>
        <div className="flex gap-3">
          <Link to="/products" className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3 rounded-xl text-sm transition-colors">
            Shop Now
          </Link>
          <Link to="/stores" className="border border-gray-200 hover:border-green-400 text-gray-700 font-semibold px-8 py-3 rounded-xl text-sm transition-colors">
            Visit Stores
          </Link>
        </div>
        {/* Popular products suggestion */}
        <p className="text-sm text-gray-400 mt-4">
          <Link to="/products?category=Laptops" className="text-green-600 hover:underline">Browse Laptops</Link>
          {' · '}
          <Link to="/products?category=Desktops" className="text-green-600 hover:underline">Desktops</Link>
          {' · '}
          <Link to="/products?category=Accessories" className="text-green-600 hover:underline">Accessories</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart <span className="text-gray-400 font-normal text-lg">({itemCount()} {itemCount() === 1 ? 'item' : 'items'})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4">
              <Link to={`/products/${item.productId}`} className="shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-xl border border-gray-100"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`} className="font-semibold text-gray-900 text-sm hover:text-green-600 transition-colors line-clamp-2 block mb-1">
                  {item.name}
                </Link>
                <p className="text-xs text-green-600 font-medium mb-3">In Stock · 6-month warranty</p>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {/* Price */}
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-base">{formatPrice(item.price * item.quantity)}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                    )}
                  </div>
                  {/* Remove */}
                  <button
                    onClick={() => {
                      removeItem(item.productId)
                      toast('Item removed from cart', { icon: '🗑️' })
                    }}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Coupon */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Tag size={16} className="text-green-500" />
              Apply Coupon Code
            </h3>
            {couponApplied ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-green-700">{coupon.toUpperCase()} applied!</p>
                  <p className="text-xs text-green-600">You save {formatPrice(couponDiscount)}</p>
                </div>
                <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700 font-medium">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code (try VRT10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 outline-none"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Shield, text: '6-Month Warranty', color: 'text-blue-500' },
              { icon: RotateCcw, text: '7-Day Returns', color: 'text-orange-500' },
              { icon: Truck, text: 'Free Delivery', color: 'text-green-500' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col items-center text-center gap-1">
                <Icon size={18} className={color} />
                <span className="text-xs text-gray-600 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total MRP ({itemCount()} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className={delivery === 0 ? 'text-green-600 font-semibold' : ''}>
                  {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-5">
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="text-green-600 text-lg">{formatPrice(finalTotal)}</span>
              </div>
              {couponApplied && (
                <p className="text-xs text-green-600 mt-1">You're saving {formatPrice(discount)} on this order!</p>
              )}
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Secure checkout · All payments protected
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
