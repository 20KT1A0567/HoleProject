import { useState, useEffect } from 'react'
import { Search, Save } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import { adminInventoryService } from '../../api/adminServices'
import toast from 'react-hot-toast'

const STORES = ['ameerpet', 'kphb', 'dilsukhnagar', 'guntur'] as const
const STORE_LABELS = { ameerpet: 'Ameerpet', kphb: 'KPHB', dilsukhnagar: 'Dilsukhnagar', guntur: 'Guntur' }

type StoreKey = typeof STORES[number]

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [edited, setEdited] = useState<Set<number>>(new Set())

  useEffect(() => {
    adminInventoryService.getAll().then(d => setInventory(d ?? [])).finally(() => setLoading(false))
  }, [])

  const filtered = inventory.filter((item: any) =>
    !search || item.product.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase())
  )

  const updateStock = (id: number, store: StoreKey, value: number) => {
    setInventory(prev => prev.map((item: any) => item.id === id ? { ...item, [store]: value } : item))
    setEdited(prev => new Set([...prev, id]))
  }

  const saveRow = (id: number) => {
    const item = inventory.find((i: any) => i.id === id)
    if (item) {
      adminInventoryService.updateStock(id, item).catch(() => {})
    }
    setEdited(prev => { const n = new Set(prev); n.delete(id); return n })
    toast.success('Stock updated successfully')
  }

  const getStockColor = (val: number) =>
    val <= 2 ? 'border-red-500 text-red-400' : val <= 5 ? 'border-orange-500 text-orange-400' : 'border-[#1E3A5F] text-white'

  const totalStock = (item: any) => STORES.reduce((a, s) => a + (item[s] ?? 0), 0)

  if (loading) {
    return (
      <div>
        <PageHeader title="Inventory" subtitle="Manage stock levels across all stores" />
        <div className="animate-pulse space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4 h-20" />
            ))}
          </div>
          <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4 h-14" />
          <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 border-b border-[#1E3A5F] bg-[#0A1628]/20" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Manage stock levels across all stores" />

      {/* Store summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {STORES.map(s => {
          const total = inventory.reduce((a: number, item: any) => a + (item[s] ?? 0), 0)
          const low = inventory.filter((item: any) => (item[s] ?? 0) <= 5).length
          return (
            <div key={s} className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4">
              <p className="text-white font-semibold text-sm">{STORE_LABELS[s]}</p>
              <p className="text-2xl font-bold text-[#22C55E] mt-1">{total}</p>
              <p className="text-[#64748B] text-xs mt-0.5">Total units · <span className="text-orange-400">{low} low stock</span></p>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4 mb-5">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product or SKU..."
            className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#22C55E]" />
        </div>
      </div>

      {/* Empty state */}
      {!loading && inventory.length === 0 && (
        <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] py-16 flex flex-col items-center gap-3">
          <p className="text-[#64748B] text-lg">No inventory items yet</p>
          <p className="text-[#475569] text-sm">Inventory data will appear here once available.</p>
        </div>
      )}

      {/* Inventory Matrix */}
      {inventory.length > 0 && (
        <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0A1628] border-b border-[#1E3A5F]">
                <tr>
                  <th className="p-4 text-left text-[#64748B] font-medium">Product</th>
                  <th className="p-4 text-left text-[#64748B] font-medium">SKU</th>
                  {STORES.map(s => (
                    <th key={s} className="p-4 text-center text-[#64748B] font-medium">{STORE_LABELS[s]}</th>
                  ))}
                  <th className="p-4 text-center text-[#64748B] font-medium">Total</th>
                  <th className="p-4 text-center text-[#64748B] font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item: any, i: number) => (
                  <tr key={item.id} className={`border-b border-[#1E3A5F] last:border-0 hover:bg-[#0A1628] ${i % 2 !== 0 ? 'bg-[#0A1628]/30' : ''}`}>
                    <td className="p-4 text-white font-medium">{item.product}</td>
                    <td className="p-4 text-[#64748B] text-xs font-mono">{item.sku}</td>
                    {STORES.map(s => (
                      <td key={s} className="p-4 text-center">
                        <input
                          type="number"
                          min={0}
                          value={item[s] ?? 0}
                          onChange={e => updateStock(item.id, s, Number(e.target.value))}
                          className={`w-16 text-center bg-[#0A1628] border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#22C55E] ${getStockColor(item[s] ?? 0)}`}
                        />
                      </td>
                    ))}
                    <td className="p-4 text-center">
                      <span className="text-white font-bold">{totalStock(item)}</span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => saveRow(item.id)}
                        disabled={!edited.has(item.id)}
                        className={`flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          edited.has(item.id)
                            ? 'bg-[#22C55E] text-black hover:bg-[#16A34A]'
                            : 'bg-[#1E3A5F] text-[#475569] cursor-default'
                        }`}
                      >
                        <Save size={12} /> Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-[#1E3A5F] flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500" /><span className="text-[#94A3B8]">Critical (≤2)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-orange-500/20 border border-orange-500" /><span className="text-[#94A3B8]">Low (3–5)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#0A1628] border border-[#1E3A5F]" /><span className="text-[#94A3B8]">Normal (6+)</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
