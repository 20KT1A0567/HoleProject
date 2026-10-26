import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Download, Check } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { adminOrderService } from '../../api/adminServices'

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

const STATUSES = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

const timelineSteps = [
  { status: 'PLACED',           label: 'Order Placed',       time: '24 May 2025, 10:15 AM' },
  { status: 'CONFIRMED',        label: 'Order Confirmed',    time: '24 May 2025, 10:45 AM' },
  { status: 'PROCESSING',       label: 'Processing',         time: '24 May 2025, 11:30 AM' },
  { status: 'SHIPPED',          label: 'Shipped',            time: '' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery',   time: '' },
  { status: 'DELIVERED',        label: 'Delivered',          time: '' },
]

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!id) return
    adminOrderService.getById(id).then(data => {
      setOrder(data)
      if (data?.status) setStatus(data.status)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!loading && !order) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-white text-xl font-semibold">Order not found</p>
        <button onClick={() => navigate('/orders')} className="flex items-center gap-2 bg-[#0F1F35] border border-[#1E3A5F] text-[#94A3B8] hover:text-white px-4 py-2 rounded-lg text-sm">
          <ArrowLeft size={14} /> Back to Orders
        </button>
      </div>
    )
  }

  const currentStep = STATUSES.indexOf(status)

  const handleUpdateStatus = () => {
    adminOrderService.updateStatus(id!, status)
      .then(() => toast.success('Status updated!'))
      .catch(() => toast.error('Failed to update status'))
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/orders')} className="p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E3A5F]">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Order {order?.id}</h1>
            <p className="text-[#64748B] text-xs mt-0.5">{order?.date} · {order?.store} · {order?.type}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.success('Printing...')} className="flex items-center gap-2 bg-[#0F1F35] border border-[#1E3A5F] text-[#94A3B8] hover:text-white px-3 py-2 rounded-lg text-sm">
            <Printer size={14} /> Print
          </button>
          <button onClick={() => toast.success('Invoice downloaded!')} className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold px-3 py-2 rounded-lg text-sm">
            <Download size={14} /> Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* Timeline */}
          <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5">
            <h3 className="text-white font-semibold mb-5">Order Timeline</h3>
            <div className="space-y-0">
              {timelineSteps.map((step, i) => {
                const done = i <= currentStep
                const active = i === currentStep
                return (
                  <div key={step.status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-[#22C55E]' : 'bg-[#1E3A5F]'}`}>
                        {done ? <Check size={14} className="text-black" /> : <div className="w-2 h-2 rounded-full bg-[#64748B]" />}
                      </div>
                      {i < timelineSteps.length - 1 && <div className={`w-0.5 h-8 ${done ? 'bg-[#22C55E]' : 'bg-[#1E3A5F]'}`} />}
                    </div>
                    <div className="pb-8 flex-1">
                      <p className={`text-sm font-medium ${active ? 'text-[#22C55E]' : done ? 'text-white' : 'text-[#475569]'}`}>{step.label}</p>
                      {step.time && <p className="text-[#64748B] text-xs mt-0.5">{step.time}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5">
            <h3 className="text-white font-semibold mb-4">Order Items</h3>
            {(order?.items ?? []).map((item: any, i: number) => (
              <div key={i} className="flex gap-4 py-3 border-b border-[#1E3A5F] last:border-0">
                <img src={item.image} alt={item.name} className="w-16 h-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{item.name}</p>
                  <p className="text-[#64748B] text-xs mt-0.5">{item.specs}</p>
                  <p className="text-[#94A3B8] text-xs mt-1">Qty: {item.qty}</p>
                </div>
                <p className="text-white font-semibold">{fmt(item.price)}</p>
              </div>
            ))}
          </div>

          {/* Customer & Address */}
          <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5">
            <h3 className="text-white font-semibold mb-4">Customer & Delivery</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[#64748B] text-xs mb-1">Customer</p>
                <p className="text-white font-medium">{order?.customer}</p>
                <p className="text-[#94A3B8] text-xs">{order?.email}</p>
                <p className="text-[#94A3B8] text-xs">{order?.phone}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-xs mb-1">Delivery Address</p>
                <p className="text-white text-sm">{order?.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Update Status */}
          <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5">
            <h3 className="text-white font-semibold mb-4">Update Status</h3>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white mb-3 focus:outline-none focus:border-[#22C55E]">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={handleUpdateStatus} className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold py-2.5 rounded-lg text-sm">
              Update Status
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5">
            <h3 className="text-white font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#94A3B8]"><span>Subtotal</span><span>{fmt(order?.subtotal ?? 0)}</span></div>
              <div className="flex justify-between text-[#94A3B8]"><span>Discount</span><span className="text-green-400">-{fmt(order?.discount ?? 0)}</span></div>
              <div className="flex justify-between text-[#94A3B8]"><span>Delivery</span><span className="text-green-400">FREE</span></div>
              <div className="flex justify-between text-white font-bold border-t border-[#1E3A5F] pt-2 mt-2">
                <span>Total</span><span>{fmt(order?.total ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5">
            <h3 className="text-white font-semibold mb-3">Payment</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#94A3B8]">Method</span>
              <span className="text-white font-medium">{order?.payment}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-[#94A3B8]">Status</span>
              <StatusBadge status="DELIVERED" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
