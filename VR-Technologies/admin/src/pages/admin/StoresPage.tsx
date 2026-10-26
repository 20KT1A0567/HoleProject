import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, MapPin, Phone, Star, Store, BadgeIndianRupee, ShoppingBag } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Dialog } from '@/components/ui/Dialog'
import { adminStoreService } from '../../api/adminServices'
import { MOCK_STORES } from '../../data/mockData'
import toast from 'react-hot-toast'

const fmt = (n: number) => '₹' + Number(n ?? 0).toLocaleString('en-IN')

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editStore, setEditStore] = useState<any | null>(null)
  const [form, setForm] = useState({ name: '', city: '', phone: '', manager: '' })

  useEffect(() => {
    adminStoreService.getAll().then(d => setStores(d?.length ? d : MOCK_STORES)).finally(() => setLoading(false))
  }, [])

  const openAdd = () => { setEditStore(null); setForm({ name: '', city: '', phone: '', manager: '' }); setShowModal(true) }
  const openEdit = (s: any) => { setEditStore(s); setForm({ name: s.name, city: s.city, phone: s.phone, manager: s.manager }); setShowModal(true) }

  const handleSave = () => {
    if (!form.name) { toast.error('Store name required'); return }
    if (editStore) {
      adminStoreService.update(editStore.id, form).catch(() => {})
      setStores(prev => prev.map(s => s.id === editStore.id ? { ...s, ...form } : s))
      toast.success('Store updated')
    } else {
      const fallback = { id: Date.now(), ...form, status: 'Active', orders: 0, sales: 0, rating: 4.5, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400' }
      adminStoreService.create(form).then(newStore => setStores(prev => [...prev, newStore ?? fallback])).catch(() => setStores(prev => [...prev, fallback]))
      toast.success('Store added')
    }
    setShowModal(false)
  }

  const deleteStore = (id: number) => {
    adminStoreService.delete(id).catch(() => {})
    setStores(prev => prev.filter(s => s.id !== id))
    toast.success('Store removed')
  }

  const stats = [
    { label: 'Active Stores', value: stores.length, icon: Store, color: 'text-emerald-400' },
    { label: 'Total Orders', value: stores.reduce((a, s) => a + Number(s.orders ?? 0), 0), icon: ShoppingBag, color: 'text-blue-400' },
    { label: 'Total Sales', value: fmt(stores.reduce((a, s) => a + Number(s.sales ?? 0), 0)), icon: BadgeIndianRupee, color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Stores</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Manage your physical store locations</p>
            </div>
            <Button onClick={openAdd}>
              <Plus size={16} /> Add Store
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {stats.map(s => (
              <div key={s.label} className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-slate-400">{s.label}</p>
                  <s.icon className={s.color} size={20} />
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 bg-slate-800/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="py-16 text-center border border-white/10 rounded-xl bg-slate-900/30">
              <p className="text-slate-400 text-lg font-medium mb-2">No stores yet</p>
              <Button onClick={openAdd}><Plus size={16} /> Add your first store</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {stores.map(s => (
                <div key={s.id} className="group relative bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all">
                  <div className="relative">
                    <img src={s.image} alt={s.name} className="h-44 w-full object-cover" />
                    <Badge variant="success" className="absolute right-3 top-3">{s.status ?? 'Active'}</Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-sm truncate">{s.name}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin size={12} />{s.city}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      <Phone size={12} />{s.phone}
                    </div>
                    <div className="my-4 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-900/50 rounded-lg border border-white/5 p-2">
                        <p className="font-bold text-white">{s.orders ?? 0}</p>
                        <p className="text-[10px] text-slate-500">Orders</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg border border-white/5 p-2">
                        <p className="font-bold text-emerald-400">{fmt(s.sales ?? 0)}</p>
                        <p className="text-[10px] text-slate-500">Sales</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg border border-white/5 p-2">
                        <p className="flex items-center justify-center gap-1 font-bold text-white">
                          <Star size={10} className="fill-yellow-500 text-yellow-500" />{s.rating ?? 4.5}
                        </p>
                        <p className="text-[10px] text-slate-500">Rating</p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(s)}>
                        <Edit size={12} /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteStore(s.id)} className="text-red-400">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editStore ? 'Edit Store' : 'Add Store'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300">Store Name</label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="VR Technologies - Ameerpet" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300">City / Location</label>
            <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Ameerpet, Hyderabad" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300">Phone</label>
            <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="040-23456789" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300">Manager Name</label>
            <Input value={form.manager} onChange={e => setForm(p => ({ ...p, manager: e.target.value }))} placeholder="Suresh Kumar" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>{editStore ? 'Update Store' : 'Add Store'}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
