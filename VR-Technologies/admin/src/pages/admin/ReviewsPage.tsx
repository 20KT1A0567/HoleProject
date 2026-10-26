import { useState, useEffect } from 'react'
import { Check, X, Search } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import { adminReviewService } from '../../api/adminServices'
import toast from 'react-hot-toast'

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={`text-sm ${i <= rating ? 'text-yellow-400' : 'text-[#1E3A5F]'}`}>★</span>
    ))}
  </div>
)

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    adminReviewService.getAll()
      .then(d => setReviews(d ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = reviews.filter(r =>
    (!search || r.product?.toLowerCase().includes(search.toLowerCase()) || r.customer?.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || r.status === statusFilter)
  )

  const approve = (id: number) => { setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r)); toast.success('Review approved') }
  const reject = (id: number) => {
    adminReviewService.delete(id).catch(() => {})
    setReviews(prev => prev.filter(r => r.id !== id))
    toast.success('Review rejected')
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Reviews" subtitle="Loading..." />
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4 text-center animate-pulse">
              <div className="h-8 bg-[#1E3A5F] rounded w-16 mx-auto mb-2" />
              <div className="h-3 bg-[#1E3A5F] rounded w-20 mx-auto" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5 animate-pulse">
              <div className="h-16 bg-[#1E3A5F] rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Reviews" subtitle={`${reviews.length} reviews`} />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total', value: reviews.length, color: 'text-white' },
          { label: 'Approved', value: reviews.filter(r => r.status === 'Approved').length, color: 'text-green-400' },
          { label: 'Pending', value: reviews.filter(r => r.status === 'Pending').length, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[#64748B] text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4 mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product or customer..."
            className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#22C55E]" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#22C55E]">
          <option value="">All Status</option>
          <option>Approved</option>
          <option>Pending</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#64748B]">No reviews found</div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#22C55E] font-bold text-sm">{r.customer?.[0] ?? '?'}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{r.customer}</p>
                      <p className="text-[#64748B] text-xs">{r.product}</p>
                    </div>
                    <Stars rating={r.rating} />
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-[#94A3B8] text-sm italic">"{r.review}"</p>
                  <p className="text-[#475569] text-xs mt-2">{r.date}</p>
                </div>
                {r.status === 'Pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => approve(r.id)}
                      className="flex items-center gap-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded-lg text-xs font-medium">
                      <Check size={12} /> Approve
                    </button>
                    <button onClick={() => reject(r.id)}
                      className="flex items-center gap-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-lg text-xs font-medium">
                      <X size={12} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
