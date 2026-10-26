import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Dialog } from '@/components/ui/Dialog'
import { adminBrandService } from '../../api/adminServices'
import { MOCK_BRANDS } from '../../data/mockData'
import toast from 'react-hot-toast'

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editBrand, setEditBrand] = useState<any | null>(null)
  const [form, setForm] = useState({ name: '', logo: '' })

  useEffect(() => {
    adminBrandService.getAll()
      .then(d => setBrands(d?.length ? d : MOCK_BRANDS))
      .catch(() => setBrands(MOCK_BRANDS))
      .finally(() => setLoading(false))
  }, [])

  const openAdd = () => { setEditBrand(null); setForm({ name: '', logo: '' }); setShowModal(true) }
  const openEdit = (b: any) => { setEditBrand(b); setForm({ name: b.name, logo: b.logo }); setShowModal(true) }

  const handleSave = async () => {
    if (!form.name) { toast.error('Brand name required'); return }
    try {
      if (editBrand) {
        const updated = await adminBrandService.update(editBrand.id, { ...editBrand, ...form, active: true })
        setBrands(prev => prev.map(b => b.id === editBrand.id ? updated : b))
        toast.success('Brand updated')
      } else {
        const created = await adminBrandService.create({ name: form.name, logo: form.logo, active: true })
        setBrands(prev => [...prev, created])
        toast.success('Brand added')
      }
      setShowModal(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to save brand')
    }
  }

  const deleteBrand = (id: number) => {
    adminBrandService.delete(id).catch(() => {})
    setBrands(prev => prev.filter(b => b.id !== id))
    toast.success('Brand deleted')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Brands</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Manage product brands and their logos</p>
            </div>
            <Button onClick={openAdd}>
              <Plus size={16} /> Add Brand
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-40 bg-slate-800/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : brands.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-white/5 rounded-xl">
              No brands yet. Add your first brand.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {brands.map(b => (
                <div key={b.id} className="group relative bg-slate-900/50 rounded-xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    {b.logo ? (
                      <img src={b.logo} alt={b.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 text-lg font-bold">
                        {b.name?.[0] ?? '?'}
                      </div>
                    )}
                    <Badge variant={b.active === false ? 'secondary' : 'success'} size="sm">
                      {b.active === false ? 'Inactive' : 'Active'}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-sm truncate">{b.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{b.products ?? 0} products</p>
                  <div className="mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(b)}><Edit size={12} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteBrand(b.id)} className="text-red-400"><Trash2 size={12} /></Button>
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
        title={editBrand ? 'Edit Brand' : 'Add Brand'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300">Brand Name</label>
            <Input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Lenovo"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300">Brand Logo URL</label>
            <Input
              value={form.logo}
              onChange={e => setForm(p => ({ ...p, logo: e.target.value }))}
              placeholder="https://example.com/logo.png"
            />
          </div>
          {form.logo && (
            <div className="flex justify-center p-4 bg-slate-900/50 rounded-xl">
              <img src={form.logo} alt="Preview" className="h-16 w-16 object-contain rounded-lg" />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
