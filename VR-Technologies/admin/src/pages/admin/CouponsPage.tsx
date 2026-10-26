import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Copy } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'
import { adminCouponService } from '../../api/adminServices'
import toast from 'react-hot-toast'

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'Percentage', discount: '', minOrder: '', limit: '', expiry: '' })

  useEffect(() => {
    adminCouponService.getAll()
      .then(d => setCoupons(d ?? []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = () => {
    if (!form.code || !form.discount) { toast.error('Code and discount required'); return }
    const newCoupon = {
      id: Date.now(), code: form.code.toUpperCase(), type: form.type,
      discount: Number(form.discount), minOrder: Number(form.minOrder),
      used: 0, limit: Number(form.limit), status: 'Active', expiry: form.expiry
    }
    setCoupons(prev => [...prev, newCoupon])
    adminCouponService.create(newCoupon).catch(() => {})
    toast.success('Coupon created!')
    setShowModal(false)
    setForm({ code: '', type: 'Percentage', discount: '', minOrder: '', limit: '', expiry: '' })
  }

  const deleteCoupon = (id: number) => {
    adminCouponService.delete(id).catch(() => {})
    setCoupons(prev => prev.filter(c => c.id !== id))
    toast.success('Coupon deleted')
  }

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); toast.success(`Copied: ${code}`) }

  if (loading) {
    return (
      <div>
        <PageHeader title="Coupons" subtitle="Loading..." />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4 animate-pulse">
              <div className="h-3 bg-[#1E3A5F] rounded w-24 mb-2" />
              <div className="h-8 bg-[#1E3A5F] rounded w-16" />
            </div>
          ))}
        </div>
        <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-[#1E3A5F] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Coupons" subtitle={`${coupons.length} coupons`}
        action={{ label: 'Create Coupon', onClick: () => setShowModal(true), icon: <Plus size={16} /> }} />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Coupons', value: coupons.length, color: 'text-[#22C55E]' },
          { label: 'Active', value: coupons.filter(c => c.status === 'Active').length, color: 'text-blue-400' },
          { label: 'Expired', value: coupons.filter(c => c.status === 'Expired').length, color: 'text-red-400' },
          { label: 'Total Used', value: coupons.reduce((a, c) => a + (c.used ?? 0), 0), color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4">
            <p className="text-[#64748B] text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0A1628] border-b border-[#1E3A5F]">
              <tr>
                {['Code', 'Type', 'Discount', 'Min Order', 'Usage', 'Status', 'Expiry', 'Actions'].map(h => (
                  <th key={h} className="p-4 text-left text-[#64748B] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-[#64748B]">No coupons found</td>
                </tr>
              ) : (
                coupons.map((c, i) => (
                  <tr key={c.id} className={`border-b border-[#1E3A5F] last:border-0 hover:bg-[#0A1628] ${i % 2 !== 0 ? 'bg-[#0A1628]/30' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#22C55E] font-bold bg-[#22C55E]/10 px-2.5 py-1 rounded-lg">{c.code}</span>
                        <button onClick={() => copyCode(c.code)} className="text-[#64748B] hover:text-white"><Copy size={12} /></button>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${c.type === 'Percentage' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {c.type}
                      </span>
                    </td>
                    <td className="p-4 text-white font-medium">{c.type === 'Percentage' ? `${c.discount}%` : fmt(c.discount)}</td>
                    <td className="p-4 text-[#94A3B8]">{fmt(c.minOrder)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white">{c.used}/{c.limit}</span>
                        <div className="w-16 h-1.5 bg-[#1E3A5F] rounded-full overflow-hidden">
                          <div className="h-full bg-[#22C55E] rounded-full" style={{ width: `${c.limit ? (c.used / c.limit) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><StatusBadge status={c.status} /></td>
                    <td className="p-4 text-[#64748B] text-xs">{c.expiry}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button className="p-2 rounded-lg text-[#94A3B8] hover:text-[#22C55E] hover:bg-[#22C55E]/10"><Edit size={14} /></button>
                        <button onClick={() => deleteCoupon(c.id)} className="p-2 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Create Coupon" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Coupon Code</label>
              <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SUMMER20"
                className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#22C55E] font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E]">
                  <option>Percentage</option><option>Fixed</option>
                </select>
              </div>
              <div>
                <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">
                  Discount ({form.type === 'Percentage' ? '%' : '₹'})
                </label>
                <input type="number" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))}
                  placeholder={form.type === 'Percentage' ? '20' : '2000'}
                  className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E]" />
              </div>
              <div>
                <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Min Order (₹)</label>
                <input type="number" value={form.minOrder} onChange={e => setForm(p => ({ ...p, minOrder: e.target.value }))}
                  placeholder="15000"
                  className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E]" />
              </div>
              <div>
                <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Usage Limit</label>
                <input type="number" value={form.limit} onChange={e => setForm(p => ({ ...p, limit: e.target.value }))}
                  placeholder="100"
                  className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E]" />
              </div>
            </div>
            <div>
              <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Expiry Date</label>
              <input type="date" value={form.expiry} onChange={e => setForm(p => ({ ...p, expiry: e.target.value }))}
                className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E]" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-[#1E3A5F] text-[#94A3B8] rounded-lg text-sm hover:text-white">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold py-2.5 rounded-lg text-sm">Create Coupon</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
