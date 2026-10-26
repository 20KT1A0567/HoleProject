import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Package, Boxes, BadgeIndianRupee, Star, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DataTable } from '@/components/ui/DataTable'
import type { Column } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Select'
import { adminProductService } from '../../api/adminServices'
import { MOCK_PRODUCTS } from '../../data/mockData'
import toast from 'react-hot-toast'

const fmt = (n: number) => '₹' + Number(n ?? 0).toLocaleString('en-IN')

export default function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => {
    adminProductService.getAll()
      .then(data => setProducts(data?.length ? data : MOCK_PRODUCTS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p =>
    (!search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())) &&
    (!category || p.category === category) &&
    (!brand || p.brand === brand)
  )

  const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))]
  const brands = [...new Set(products.map((p: any) => p.brand).filter(Boolean))]
  const totalStock = products.reduce((a, p) => a + Number(p.stock ?? 0), 0)
  const active = products.filter(p => p.status !== 'Inactive').length
  const revenue = products.reduce((a, p) => a + Number(p.price ?? 0) * Number(p.stock ?? 0), 0)

  const toggleSelect = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const toggleStatus = (id: number) => {
    adminProductService.toggleStatus(id).catch(() => {})
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p))
    toast.success('Product status updated')
  }

  const deleteProduct = (id: number) => {
    adminProductService.delete(id).catch(() => {})
    setProducts(prev => prev.filter(p => p.id !== id))
    toast.success('Product deleted')
  }

  const columns: Column<any>[] = [
    {
      key: 'product',
      header: 'Product',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img src={row.image} alt={row.name} className="h-12 w-14 rounded-xl border border-white/10 object-cover" />
          <div>
            <p className="font-bold text-white">{row.name}</p>
            <p className="text-xs font-mono text-slate-500">{row.sku}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Category' },
    { key: 'brand', header: 'Brand' },
    {
      key: 'price',
      header: 'Price',
      cell: (row) => (
        <div>
          <p className="font-bold text-white">{fmt(row.price)}</p>
          <p className="text-xs text-slate-500 line-through">{fmt(row.mrp)}</p>
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      cell: (row) => (
        <Badge variant={
          row.stock < 5 ? 'destructive' :
          row.stock < 10 ? 'warning' : 'success'
        }>
          {row.stock} units
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'featured',
      header: 'Featured',
      cell: (row) => row.featured
        ? <Badge variant="info"><Star size={10} className="mr-1" />Featured</Badge>
        : <span className="text-slate-500 text-xs">No</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/products/${row.id}/edit`)}>
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toggleStatus(row.id)}>
            {row.status === 'Active' ? <EyeOff size={14} /> : <Eye size={14} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => deleteProduct(row.id)}>
            <Trash2 size={14} className="text-red-400" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Products</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                {products.length} catalog items across laptops, desktops, monitors, and accessories
              </p>
            </div>
            <Button onClick={() => navigate('/products/new')}>
              <Plus size={16} />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-slate-400">Total Products</p>
                <Package className="text-emerald-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white">{products.length}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-slate-400">Active Listings</p>
                <Eye className="text-cyan-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white">{active}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-slate-400">Total Stock</p>
                <Boxes className="text-purple-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white">{totalStock}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-slate-400">Stock Value</p>
                <BadgeIndianRupee className="text-orange-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-white">{fmt(revenue)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6 p-4 bg-slate-900/30 rounded-xl border border-white/5">
            <div className="relative min-w-64 flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search product name or SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={category}
              onChange={e => setCategory(e.target.value)}
              options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c, label: c }))]}
              className="w-44"
            />
            <Select
              value={brand}
              onChange={e => setBrand(e.target.value)}
              options={[{ value: '', label: 'All Brands' }, ...brands.map(b => ({ value: b, label: b }))]}
              className="w-40"
            />
            {selected.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => { setProducts(prev => prev.filter(p => !selected.includes(p.id))); setSelected([]); toast.success('Selected products deleted') }}>
                Delete {selected.length}
              </Button>
            )}
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={filtered}
            loading={loading}
            emptyMessage="No products found"
          />

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-slate-400">
              Showing <span className="font-bold text-white">{filtered.length}</span> of {products.length} products
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Export CSV</Button>
              <Button variant="default" size="sm">Export PDF</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
