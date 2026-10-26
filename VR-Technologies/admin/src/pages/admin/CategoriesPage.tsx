import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { adminCategoryService } from '../../api/adminServices'
import { MOCK_CATEGORIES } from '../../data/mockData'
import toast from 'react-hot-toast'

export default function CategoriesPage() {
  const [cats, setCats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCat, setEditCat] = useState<any | null>(null)
  const [form, setForm] = useState({ name: '', slug: '' })

  useEffect(() => {
    adminCategoryService.getAll()
      .then(d => setCats(d?.length ? d : MOCK_CATEGORIES))
      .catch(() => setCats(MOCK_CATEGORIES))
      .finally(() => setLoading(false))
  }, [])

  const openAdd = () => { setEditCat(null); setForm({ name: '', slug: '' }); setShowModal(true) }
  const openEdit = (c: any) => { setEditCat(c); setForm({ name: c.name, slug: c.slug }); setShowModal(true) }

  const handleSave = () => {
    if (!form.name) { toast.error('Name required'); return }
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-')
    if (editCat) {
      setCats(prev => prev.map(c => c.id === editCat.id ? { ...c, name: form.name, slug } : c))
      adminCategoryService.update(editCat.id, { name: form.name, slug }).catch(() => {})
      toast.success('Category updated')
    } else {
      const newCat = { id: Date.now(), name: form.name, slug, products: 0, status: 'Active' }
      setCats(prev => [...prev, newCat])
      adminCategoryService.create(newCat).catch(() => {})
      toast.success('Category added')
    }
    setShowModal(false)
  }

  const deleteCat = (id: number) => {
    adminCategoryService.delete(id).catch(() => {})
    setCats(prev => prev.filter(c => c.id !== id))
    toast.success('Category deleted')
  }

  const stats = [
    { label: 'Total Categories', value: cats.length },
    { label: 'Active', value: cats.filter(c => c.status === 'Active').length },
    { label: 'Products Mapped', value: cats.reduce((a, c) => a + Number(c.products ?? 0), 0) },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Categories</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Organize your products into logical groupings</p>
            </div>
            <Button onClick={openAdd}>
              <Plus size={16} /> Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map(s => (
              <div key={s.label} className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                <p className="text-sm font-bold text-slate-400">{s.label}</p>
                <p className="text-2xl font-bold text-white mt-2">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : cats.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-white/5 rounded-xl">
              No categories yet. Create your first category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {cats.map(c => (
                <div key={c.id} className="group relative bg-slate-900/50 rounded-xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                      <Tag className="text-emerald-400" size={20} />
                    </div>
                    <Badge variant={c.status === 'Active' ? 'success' : 'secondary'} size="sm">
                      {c.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-white text-sm truncate">{c.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{c.products ?? 0} products</p>
                  <div className="mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Edit size={12} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteCat(c.id)} className="text-red-400"><Trash2 size={12} /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal
        onClose={() => setShowModal(false)}
        title={editCat ? 'Edit Category' : 'Add Category'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300">Category Name</label>
            <Input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
              placeholder="e.g. Laptops"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-300">Slug</label>
            <Input
              value={form.slug}
              onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
              placeholder="e.g. laptops"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
