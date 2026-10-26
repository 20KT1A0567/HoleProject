import { useState, useEffect } from 'react'
import { Eye, Mail, Phone, Search } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Avatar } from '@/components/ui/Avatar'
import { DataTable } from '@/components/ui/DataTable'
import type { Column } from '@/components/ui/DataTable'
import { adminCustomerService } from '../../api/adminServices'

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    adminCustomerService.getAll().then(d => setCustomers(d ?? [])).finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter((c: any) =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.includes(search)) &&
    (!statusFilter || c.status === statusFilter)
  )

  const stats = [
    { label: 'Total Customers', value: customers.length, color: 'text-emerald-400' },
    { label: 'Active', value: customers.filter((c: any) => c.status === 'Active').length, color: 'text-blue-400' },
    { label: 'Inactive', value: customers.filter((c: any) => c.status === 'Inactive').length, color: 'text-red-400' },
    { label: 'Total Revenue', value: fmt(customers.reduce((a: number, c: any) => a + (c.spent ?? 0), 0)), color: 'text-purple-400' },
  ]

  const columns: Column<any>[] = [
    {
      key: 'customer',
      header: 'Customer',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} fallback={row.name?.[0] ?? '?'} size="md" />
          <div>
            <p className="font-bold text-white">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'orders',
      header: 'Orders',
      sortable: true,
      cell: (row) => <span className="font-medium text-white">{row.orders}</span>,
    },
    {
      key: 'spent',
      header: 'Total Spent',
      sortable: true,
      cell: (row) => <span className="font-bold text-emerald-400">{fmt(row.spent)}</span>,
    },
    {
      key: 'joined',
      header: 'Joined',
      sortable: true,
      cell: (row) => <span className="text-xs text-slate-500">{row.joined}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'secondary'}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: () => (
        <Button variant="ghost" size="sm">
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
              <CardTitle>Customers</CardTitle>
              <p className="text-sm text-slate-400 mt-1">Manage customer accounts and their purchase history</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map(s => (
              <div key={s.label} className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                <p className="text-sm font-bold text-slate-400">{s.label}</p>
                <p className={`text-2xl font-bold mt-2 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6 p-4 bg-slate-900/30 rounded-xl border border-white/5">
            <div className="relative min-w-64 flex-1">
              <Input
                placeholder="Search name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[{ value: '', label: 'All Statuses' }, { value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]}
              className="w-40"
            />
          </div>

          {/* Table */}
          <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No customers found" />
        </CardContent>
      </Card>
    </div>
  )
}
