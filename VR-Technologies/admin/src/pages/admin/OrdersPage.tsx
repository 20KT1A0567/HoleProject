import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, ShoppingCart, Clock3, Truck, CheckCircle2, XCircle, ArrowUpDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import type { Column } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import { adminOrderService } from '../../api/adminServices'
import { MOCK_ORDERS } from '../../data/mockData'
import toast from 'react-hot-toast'

const fmt = (n: number) => '₹' + Number(n ?? 0).toLocaleString('en-IN')
const STATUSES = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [storeFilter, setStoreFilter] = useState('')

  useEffect(() => {
    adminOrderService.getAll()
      .then(data => setOrders(data?.length ? data : MOCK_ORDERS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o =>
    (!search || String(o.id).toLowerCase().includes(search.toLowerCase()) || o.customer?.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || o.status === statusFilter) &&
    (!storeFilter || o.store === storeFilter)
  )

  const updateStatus = (id: string, status: string) => {
    adminOrderService.updateStatus(id, status).catch(() => {})
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    toast.success('Order status updated')
  }

  const stores = [...new Set(orders.map((o: any) => o.store).filter(Boolean))]
  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-emerald-400', status: '' },
    { label: 'Processing', value: orders.filter(o => o.status === 'PROCESSING').length, icon: Clock3, color: 'text-blue-400', status: 'PROCESSING' },
    { label: 'Shipped', value: orders.filter(o => o.status === 'SHIPPED').length, icon: Truck, color: 'text-orange-400', status: 'SHIPPED' },
    { label: 'Delivered', value: orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status)).length, icon: CheckCircle2, color: 'text-emerald-400', status: 'DELIVERED' },
    { label: 'Cancelled', value: orders.filter(o => o.status === 'CANCELLED').length, icon: XCircle, color: 'text-red-400', status: 'CANCELLED' },
  ]

  const columns: Column<any>[] = [
    {
      key: 'id',
      header: 'Order ID',
      sortable: true,
      cell: (row) => <span className="font-bold text-emerald-400">{row.id}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      sortable: true,
      cell: (row) => <span className="font-bold text-white">{row.customer}</span>,
    },
    {
      key: 'store',
      header: 'Store',
      cell: (row) => (
        <Badge variant="secondary">{row.store}</Badge>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      cell: (row) => <span className="text-slate-400">{row.items}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      cell: (row) => <span className="font-bold text-white">{fmt(row.amount)}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      cell: (row) => (
        <Badge variant={row.type === 'Pickup' ? 'default' : 'info'}>
          {row.type}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => {
        const statusVariant = row.status === 'DELIVERED' || row.status === 'COMPLETED' ? 'success' :
                            row.status === 'PROCESSING' ? 'info' :
                            row.status === 'SHIPPED' ? 'warning' :
                            row.status === 'CANCELLED' ? 'destructive' : 'secondary'
        return (
          <Select
            value={row.status}
            onChange={e => updateStatus(row.id, e.target.value)}
            options={STATUSES.map(s => ({ value: s, label: s }))}
            className="w-32"
          />
        )
      },
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      cell: (row) => <span className="text-xs text-slate-500">{row.date}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${String(row.id).replace('#', '')}`)}>
          <Eye size={14} />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Orders</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                {orders.length} customer orders and fulfilment updates
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {stats.map(({ label, value, icon: Icon, color, status }) => (
              <button
                key={label}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "bg-slate-900/50 rounded-xl p-4 text-left border border-white/5 hover:border-emerald-500/30 transition-all hover:scale-[1.02]",
                  statusFilter === status && "ring-2 ring-emerald-500/30 border-emerald-500/50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-slate-400">{label}</p>
                  <Icon className={color} size={19} />
                </div>
                <p className="text-2xl font-bold text-white">{value}</p>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6 p-4 bg-slate-900/30 rounded-xl border border-white/5">
            <div className="relative min-w-64 flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search order ID or customer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={storeFilter}
              onChange={e => setStoreFilter(e.target.value)}
              options={[{ value: '', label: 'All Stores' }, ...stores.map(s => ({ value: s, label: s }))]}
              className="w-44"
            />
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[{ value: '', label: 'All Statuses' }, ...STATUSES.map(s => ({ value: s, label: s }))]}
              className="w-44"
            />
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={filtered}
            loading={loading}
            emptyMessage="No orders found"
            hoverable
          />

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-slate-400">
              Showing <span className="font-bold text-white">{filtered.length}</span> of {orders.length} orders
            </p>
            <p className="font-bold text-emerald-400">
              Total value: {fmt(filtered.reduce((a, o) => a + Number(o.amount ?? 0), 0))}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
