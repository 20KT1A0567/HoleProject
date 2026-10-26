import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '../../components/ui/PageHeader'
import { dashboardService, adminReportService } from '../../api/adminServices'

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

const customerGrowth = [
  { month: 'Dec', customers: 2800 }, { month: 'Jan', customers: 3000 },
  { month: 'Feb', customers: 3150 }, { month: 'Mar', customers: 3300 },
  { month: 'Apr', customers: 3480 }, { month: 'May', customers: 3652 },
]

const metrics = [
  { label: 'Avg. Order Value', value: fmt(Math.round(2485230 / 1248)), change: '+5.2%', color: 'text-green-400' },
  { label: 'Conversion Rate', value: '3.4%', change: '+0.8%', color: 'text-blue-400' },
  { label: 'Repeat Customers', value: '28%', change: '+3.1%', color: 'text-purple-400' },
  { label: 'Avg. Rating', value: '4.6 ★', change: '+0.1', color: 'text-yellow-400' },
]

export default function AnalyticsPage() {
  const [revenueTrend, setRevenueTrend] = useState<any[]>([])
  const [salesByStore, setSalesByStore] = useState<any[]>([])
  const [orderOverview, setOrderOverview] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminReportService.getRevenueTrend(),
      adminReportService.getSalesByStore(),
      dashboardService.getOrderOverview(),
    ])
      .then(([rev, sbs, oo]) => {
        setRevenueTrend(rev)
        setSalesByStore(sbs)
        setOrderOverview(oo)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <PageHeader title="Sales & Analytics" subtitle="Deep insights into your business performance" />
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4 animate-pulse">
                <div className="h-3 bg-[#1E3A5F] rounded w-24 mb-2" />
                <div className="h-8 bg-[#1E3A5F] rounded w-20 mb-2" />
                <div className="h-3 bg-[#1E3A5F] rounded w-16" />
              </div>
            ))}
          </div>
          <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5 animate-pulse">
            <div className="h-4 bg-[#1E3A5F] rounded w-48 mb-4" />
            <div className="h-[220px] bg-[#1E3A5F] rounded" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5 animate-pulse">
              <div className="h-4 bg-[#1E3A5F] rounded w-48 mb-4" />
              <div className="h-[200px] bg-[#1E3A5F] rounded" />
            </div>
            <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5 animate-pulse">
              <div className="h-4 bg-[#1E3A5F] rounded w-32 mb-4" />
              <div className="h-[200px] bg-[#1E3A5F] rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Sales & Analytics" subtitle="Deep insights into your business performance" />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {metrics.map(m => (
          <div key={m.label} className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4">
            <p className="text-[#64748B] text-xs mb-1">{m.label}</p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-green-400 text-xs mt-1">{m.change} vs last month</p>
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5 mb-5">
        <h3 className="text-white font-semibold mb-4">Revenue Trend (6 Months)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueTrend}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
            <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
            <Tooltip contentStyle={{ background: '#0F1F35', border: '1px solid #1E3A5F', borderRadius: 8 }} labelStyle={{ color: '#fff' }} formatter={(v: any) => [fmt(Number(v ?? 0)), 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#22C55E', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Sales by Store */}
        <div className="lg:col-span-2 bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5">
          <h3 className="text-white font-semibold mb-4">Sales by Store Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesByStore}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
              <XAxis dataKey="store" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
              <Tooltip contentStyle={{ background: '#0F1F35', border: '1px solid #1E3A5F', borderRadius: 8 }} labelStyle={{ color: '#fff' }} formatter={(v: any) => [fmt(Number(v ?? 0)), 'Sales']} />
              <Bar dataKey="sales" fill="#22C55E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status */}
        <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5">
          <h3 className="text-white font-semibold mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={orderOverview} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                {orderOverview.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0F1F35', border: '1px solid #1E3A5F', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {orderOverview.map(o => (
              <div key={o.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: o.color }} /><span className="text-[#94A3B8]">{o.name}</span></div>
                <span className="text-white">{o.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Growth */}
      <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5">
        <h3 className="text-white font-semibold mb-4">Customer Growth</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={customerGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
            <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#0F1F35', border: '1px solid #1E3A5F', borderRadius: 8 }} labelStyle={{ color: '#fff' }} formatter={(v: any) => [Number(v ?? 0).toLocaleString(), 'Customers']} />
            <Line type="monotone" dataKey="customers" stroke="#06B6D4" strokeWidth={2.5} dot={{ fill: '#06B6D4', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
