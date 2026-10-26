import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import StatusBadge from '@/components/ui/StatusBadge'
import MediaUpload from '@/components/ui/MediaUpload'
import { adminBannerService } from '../../api/adminServices'
import toast from 'react-hot-toast'

const emptyForm = { title: '', image: '', video: '', position: 'Hero', startDate: '', endDate: '', status: 'Active' }

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editBanner, setEditBanner] = useState<any | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    adminBannerService.getAll()
      .then(d => setBanners(d ?? []))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false))
  }, [])

  const openAdd = () => { setEditBanner(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (b: any) => {
    setEditBanner(b)
    setForm({
      title: b.title ?? '',
      image: b.image ?? '',
      video: b.video ?? '',
      position: b.position ?? 'Hero',
      startDate: b.startDate ?? '',
      endDate: b.endDate ?? '',
      status: b.status ?? 'Active',
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.title) { toast.error('Title required'); return }
    if (editBanner) {
      setBanners(prev => prev.map(b => b.id === editBanner.id ? { ...b, ...form } : b))
      adminBannerService.update(editBanner.id, form).catch(() => {})
      toast.success('Banner updated')
    } else {
      const newBanner = { id: Date.now(), ...form }
      setBanners(prev => [...prev, newBanner])
      adminBannerService.create(newBanner).catch(() => {})
      toast.success('Banner added')
    }
    setShowModal(false)
  }

  const toggleStatus = (id: number) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, status: b.status === 'Active' ? 'Inactive' : 'Active' } : b))
    toast.success('Banner status updated')
  }

  const deleteBanner = (id: number) => {
    adminBannerService.delete(id).catch(() => {})
    setBanners(prev => prev.filter(b => b.id !== id))
    toast.success('Banner deleted')
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Banners" subtitle="Loading..." />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4 flex gap-4 items-center animate-pulse">
              <div className="w-32 h-20 rounded-xl bg-[#1E3A5F] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#1E3A5F] rounded w-48" />
                <div className="h-3 bg-[#1E3A5F] rounded w-64" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Banners" subtitle={`${banners.length} banners`}
        action={{ label: 'Add New Banner', onClick: openAdd, icon: <Plus size={16} /> }} />

      {banners.length === 0 ? (
        <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-12 text-center text-[#64748B]">
          No banners found. Add your first banner.
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map(b => (
            <div key={b.id} className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4 flex gap-4 items-center">
              <img src={b.image} alt={b.title} className="w-32 h-20 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm truncate">{b.title}</h3>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-[#64748B]">
                  <span>Position: <span className="text-[#94A3B8]">{b.position}</span></span>
                  <span>Start: <span className="text-[#94A3B8]">{b.startDate}</span></span>
                  <span>End: <span className="text-[#94A3B8]">{b.endDate}</span></span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(b)} className="p-2 rounded-lg text-[#94A3B8] hover:text-[#22C55E] hover:bg-[#22C55E]/10"><Edit size={14} /></button>
                <button onClick={() => toggleStatus(b.id)} className="p-2 rounded-lg text-[#94A3B8] hover:text-cyan-400 hover:bg-cyan-500/10">
                  {b.status === 'Active' ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => deleteBanner(b.id)} className="p-2 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editBanner ? 'Edit Banner' : 'Add New Banner'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Banner Title</label>
              <input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Summer Sale – Up to 40% Off"
                className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#22C55E]" />
            </div>
            <MediaUpload
              label="Banner Image"
              type="image"
              folder="banners"
              value={form.image}
              onChange={url => setForm(prev => ({ ...prev, image: url }))}
            />
            <MediaUpload
              label="Banner Video (optional)"
              type="video"
              folder="banners"
              value={form.video}
              onChange={url => setForm(prev => ({ ...prev, video: url }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Position</label>
                <select value={form.position} onChange={e => setForm(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E]">
                  {['Hero', 'Featured', 'Sidebar', 'Footer'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E]">
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
              <div>
                <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E]" />
              </div>
              <div>
                <label className="text-[#94A3B8] text-xs font-medium block mb-1.5">End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#22C55E]" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-[#1E3A5F] text-[#94A3B8] rounded-lg text-sm hover:text-white">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold py-2.5 rounded-lg text-sm">Save Banner</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
