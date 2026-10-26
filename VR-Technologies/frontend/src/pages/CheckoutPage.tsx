import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, MapPin, Truck, CreditCard, ClipboardList, ChevronRight, Store, Shield } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { formatPrice } from '../utils/format'
import { storeService } from '../api/services'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 1, label: 'Address', icon: MapPin },
  { id: 2, label: 'Delivery', icon: Truck },
  { id: 3, label: 'Payment', icon: CreditCard },
  { id: 4, label: 'Review', icon: ClipboardList },
]

interface AddressForm {
  name: string
  phone: string
  pincode: string
  address: string
  city: string
  state: string
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [deliveryType, setDeliveryType] = useState<'home' | 'pickup'>('home')
  const [selectedStore, setSelectedStore] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('cod')
  const [addressForm, setAddressForm] = useState<AddressForm>({
    name: '', phone: '', pincode: '', address: '', city: 'Hyderabad', state: 'Telangana'
  })
  const [errors, setErrors] = useState<Partial<AddressForm>>({})
  const [stores, setStores] = useState<any[]>([])
  useEffect(() => { storeService.getAll().then(d => setStores(d ?? [])) }, [])

  const subtotal = total()
  const delivery = deliveryType === 'pickup' ? 0 : (subtotal > 20000 ? 0 : 199)
  const finalTotal = subtotal + delivery

  const validateAddress = () => {
    const newErrors: Partial<AddressForm> = {}
    if (!addressForm.name.trim()) newErrors.name = 'Name is required'
    if (!addressForm.phone.trim() || addressForm.phone.length < 10) newErrors.phone = 'Valid phone required'
    if (!addressForm.pincode.trim() || addressForm.pincode.length < 6) newErrors.pincode = 'Valid pincode required'
    if (!addressForm.address.trim()) newErrors.address = 'Address is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && deliveryType === 'home' && !validateAddress()) return
    if (currentStep === 2 && deliveryType === 'pickup' && !selectedStore) {
      toast.error('Please select a pickup store')
      return
    }
    setCurrentStep((s) => Math.min(4, s + 1))
  }

  const handlePlaceOrder = () => {
    clearCart()
    toast.success('Order placed successfully!', { icon: '🎉', duration: 4000 })
    navigate('/orders')
  }

  const InputField = ({
    label, name, type = 'text', placeholder, half = false
  }: {
    label: string; name: keyof AddressForm; type?: string; placeholder?: string; half?: boolean
  }) => (
    <div className={half ? 'md:col-span-1' : 'md:col-span-2'}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={addressForm[name]}
        onChange={(e) => setAddressForm({ ...addressForm, [name]: e.target.value })}
        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
          errors[name]
            ? 'border-red-400 focus:border-red-500 bg-red-50'
            : 'border-gray-200 focus:border-green-400 bg-white'
        }`}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        {STEPS.map((step) => (
          <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                step.id < currentStep
                  ? 'bg-green-500 text-white'
                  : step.id === currentStep
                  ? 'bg-[#07111F] text-white ring-4 ring-green-200'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step.id < currentStep ? <CheckCircle size={20} /> : <step.icon size={18} />}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${step.id === currentStep ? 'text-green-600' : step.id < currentStep ? 'text-gray-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-green-500" /> Delivery Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Full Name *" name="name" placeholder="Enter your full name" />
                  <InputField label="Mobile Number *" name="phone" type="tel" placeholder="10-digit mobile number" half />
                  <InputField label="Pincode *" name="pincode" placeholder="6-digit pincode" half />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address *</label>
                    <textarea
                      rows={3}
                      placeholder="House/Flat No., Street, Area"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none resize-none transition-colors ${
                        errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-green-400'
                      }`}
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>
                  <InputField label="City" name="city" placeholder="City" half />
                  <InputField label="State" name="state" placeholder="State" half />
                </div>
              </div>
            )}

            {/* Step 2: Delivery */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Truck size={20} className="text-green-500" /> Delivery Method
                </h2>
                <div className="space-y-4">
                  <label className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${deliveryType === 'home' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="delivery"
                      value="home"
                      checked={deliveryType === 'home'}
                      onChange={() => setDeliveryType('home')}
                      className="mt-1 accent-green-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">Home Delivery</p>
                        <span className="text-sm font-bold text-green-600">{subtotal > 20000 ? 'FREE' : '₹199'}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Delivered to your doorstep within 2-3 business days</p>
                    </div>
                  </label>

                  <div>
                    <label className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${deliveryType === 'pickup' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="delivery"
                        value="pickup"
                        checked={deliveryType === 'pickup'}
                        onChange={() => setDeliveryType('pickup')}
                        className="mt-1 accent-green-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900">Store Pickup</p>
                          <span className="text-sm font-bold text-green-600">FREE</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Pick up from any of our 4 stores — ready in 2 hours</p>
                      </div>
                    </label>

                    {deliveryType === 'pickup' && (
                      <div className="mt-3 space-y-2 pl-2">
                        {stores.map((store) => (
                          <label
                            key={store.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedStore === store.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="store"
                              value={store.id}
                              checked={selectedStore === store.id}
                              onChange={() => setSelectedStore(store.id)}
                              className="accent-green-500"
                            />
                            <Store size={16} className="text-green-500 shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{store.name}</p>
                              <p className="text-xs text-gray-500">{store.timings} · {store.distance}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-green-500" /> Payment Method
                </h2>
                <div className="space-y-3">
                  {[
                    { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order', icon: '💵' },
                    { id: 'upi', label: 'UPI / PhonePe / GPay', desc: 'Instant payment via UPI', icon: '📱' },
                    { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay accepted', icon: '💳' },
                    { id: 'netbanking', label: 'Net Banking', desc: 'All major banks supported', icon: '🏦' },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === method.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="accent-green-500"
                      />
                      <span className="text-xl">{method.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{method.label}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 bg-blue-50 rounded-xl p-3">
                  <Shield size={16} className="text-blue-500 shrink-0" />
                  <p className="text-xs text-blue-700">Your payment information is encrypted and secure. We never store card details.</p>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ClipboardList size={20} className="text-green-500" /> Review Your Order
                </h2>

                <div className="space-y-4">
                  {/* Address summary */}
                  {deliveryType === 'home' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm">Delivery Address</h3>
                        <button onClick={() => setCurrentStep(1)} className="text-xs text-green-600 hover:underline">Edit</button>
                      </div>
                      <p className="text-sm text-gray-600">{addressForm.name} · {addressForm.phone}</p>
                      <p className="text-sm text-gray-500">{addressForm.address}, {addressForm.city}, {addressForm.state} - {addressForm.pincode}</p>
                    </div>
                  )}
                  {deliveryType === 'pickup' && selectedStore && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">Store Pickup</h3>
                      <p className="text-sm text-gray-600">{stores.find((s: any) => s.id === selectedStore)?.name}</p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-3">Items ({items.length})</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm">Payment Method</h3>
                      <button onClick={() => setCurrentStep(3)} className="text-xs text-green-600 hover:underline">Change</button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Net Banking'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                className={`px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:border-gray-400 transition-colors ${currentStep === 1 ? 'invisible' : ''}`}
              >
                Back
              </button>
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3 rounded-xl text-sm transition-colors"
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3 rounded-xl text-sm transition-colors"
                >
                  Place Order · {formatPrice(finalTotal)}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-2">
                  <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">x{item.quantity} · {formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className={delivery === 0 ? 'text-green-600 font-semibold' : ''}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-green-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
