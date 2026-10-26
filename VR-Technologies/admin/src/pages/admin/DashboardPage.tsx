import { useState, useEffect } from 'react'
import {
  BarChart3, Download, Package, ShoppingBag, Store, TrendingUp, Users, ChevronDown
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { dashboardService, adminOrderService, adminStoreService } from '../../api/adminServices'
import {
  MOCK_ACTIVITIES,
  MOCK_LOW_STOCK,
  MOCK_ORDER_OVERVIEW,
  MOCK_ORDERS,
  MOCK_SALES_BY_STORE,
  MOCK_SALES_CHART,
  MOCK_STATS,
  MOCK_STORE_SUMMARY,
  MOCK_STORES,
  MOCK_TOP_PRODUCTS,
} from '../../data/mockData'

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [salesChart, setSalesChart] = useState<any[]>([])
  const [orderOverview, setOrderOverview] = useState<any[]>([])
  const [salesByStore, setSalesByStore] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [lowStock, setLowStock] = useState<any[]>([])
  const [storeSummary, setStoreSummary] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [storesOverview, setStoresOverview] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getSalesChart(),
      dashboardService.getOrderOverview(),
      dashboardService.getSalesByStore(),
      adminOrderService.getAll(),
      dashboardService.getLowStock(),
      dashboardService.getStoreSummary(),
      dashboardService.getTopProducts(),
      dashboardService.getActivities(),
      adminStoreService.getAll(),
    ]).then(([s, sc, oo, sbs, orders, ls, ss, tp, act, stores]) => {
      setStats(s ?? MOCK_STATS)
      setSalesChart(sc?.length ? sc : MOCK_SALES_CHART)
      setOrderOverview(oo?.length ? oo : MOCK_ORDER_OVERVIEW)
      setSalesByStore(sbs?.length ? sbs : MOCK_SALES_BY_STORE)
      setRecentOrders(orders?.length ? orders.slice(0, 5) : MOCK_ORDERS.slice(0, 5))
      setLowStock(ls?.length ? ls : MOCK_LOW_STOCK)
      setStoreSummary(ss?.length ? ss : MOCK_STORE_SUMMARY)
      setTopProducts(tp?.length ? tp : MOCK_TOP_PRODUCTS)
      setActivities(act?.length ? act : MOCK_ACTIVITIES)
      setStoresOverview(stores?.length ? stores : MOCK_STORES)
    }).finally(() => setLoading(false))
  }, [])

  const orderTotal = orderOverview.reduce((s, o) => s + (o.value ?? 0), 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800/50 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - Enhanced */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm">Welcome back, Admin! Here's a complete overview of your business performance.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/8 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm backdrop-blur-sm hover:bg-white/12 transition-all">
          <span className="text-slate-300 font-medium">17 May 2025 – 24 May 2025</span>
          <ChevronDown size={14} className="text-slate-500" />
        </div>
      </div>

      {/* Stat Cards - Enhanced */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders != null ? stats.totalOrders.toLocaleString() : '—'}
          trend={{ value: 12, isPositive: true }}
          icon={ShoppingBag}
          variant="emerald"
        />
        <StatCard
          title="Total Sales"
          value={stats?.totalSales != null ? fmt(stats.totalSales) : '—'}
          trend={{ value: 8, isPositive: true }}
          icon={TrendingUp}
          variant="blue"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts != null ? stats.totalProducts.toLocaleString() : '—'}
          trend={{ value: 5, isPositive: true }}
          icon={Package}
          variant="purple"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers != null ? stats.totalCustomers.toLocaleString() : '—'}
          trend={{ value: 15, isPositive: true }}
          icon={Users}
          variant="orange"
        />
        <StatCard
          title="Active Stores"
          value={stats?.totalStores != null ? stats.totalStores : '—'}
          icon={Store}
          variant="default"
        />
      </div>

      {/* Charts Row - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Overview */}
        <Card className="lg:col-span-1 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-white">Sales Overview</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-emerald-400">
                This Week <ChevronDown size={12} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} labelStyle={{ color: '#fff' }} formatter={(v: any) => [fmt(Number(v ?? 0)), 'Sales']} />
                  <Line type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Overview */}
        <Card className="border-blue-500/20 hover:border-blue-500/40 transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-white">Order Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative h-[140px] w-[140px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={orderOverview} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                      {orderOverview.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-white text-lg font-bold">{orderTotal.toLocaleString()}</p>
                  <p className="text-slate-500 text-[10px]">Total Orders</p>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {orderOverview.map(o => (
                  <div key={o.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: o.color }} />
                      <span className="text-slate-400">{o.name}</span>
                    </div>
                    <span className="text-white font-medium">
                      {o.value} ({orderTotal > 0 ? ((o.value / orderTotal) * 100).toFixed(1) : '0.0'}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Stores */}
        <Card className="border-purple-500/20 hover:border-purple-500/40 transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-white">Sales by Stores</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-purple-400">
                This Week <ChevronDown size={12} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByStore}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="store" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} labelStyle={{ color: '#fff' }} formatter={(v: any) => [fmt(Number(v ?? 0)), 'Sales']} />
                  <Bar dataKey="sales" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Orders */}
        <Card className="lg:col-span-1 border-white/10 hover:border-emerald-500/30 transition-all">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-white">Recent Orders</CardTitle>
              <Button variant="link" size="sm" className="text-emerald-400 hover:text-emerald-300">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 hover:bg-white/5 px-1 rounded transition-colors">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold">{o.id}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">{o.customer} · {o.store}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-xs font-semibold">{fmt(o.amount)}</p>
                    <Badge variant={
                      o.status === 'Delivered' ? 'success' :
                        o.status === 'Pending' ? 'warning' : 'default'
                    } className="mt-0.5 text-[10px]">
                      {o.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="border-red-500/20 hover:border-red-500/40 transition-all">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-white">Low Stock Alert</CardTitle>
              <Button variant="link" size="sm" className="text-emerald-400 hover:text-emerald-300">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {lowStock.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0 hover:bg-red-500/5 px-1 rounded transition-colors">
                  <img src={item.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{item.product}</p>
                    <p className="text-slate-500 text-[10px]">{item.store}</p>
                  </div>
                  <Badge variant={item.stock <= 3 ? 'destructive' : 'warning'} className="text-[10px] flex-shrink-0">
                    {item.stock} left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Store Summary */}
        <Card className="border-orange-500/20 hover:border-orange-500/40 transition-all">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-white">Store Summary</CardTitle>
              <Button variant="link" size="sm" className="text-emerald-400 hover:text-emerald-300">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {storeSummary.map(s => (
                <div key={s.store} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-1 rounded transition-colors">
                  <div>
                    <p className="text-white text-xs font-semibold">{s.store}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">{s.orders} orders</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-emerald-400 text-xs font-semibold">{fmt(s.sales)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products + Orders by Status + Quick Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Selling Products */}
        <Card className="border-green-500/20 hover:border-green-500/40 transition-all">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-white">Top Selling Products</CardTitle>
              <Button variant="link" size="sm" className="text-emerald-400 hover:text-emerald-300">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3.5">
              {topProducts.map(p => (
                <div key={p.rank} className="flex items-center gap-3 hover:bg-white/5 p-2 rounded transition-colors">
                  <span className="text-slate-500 text-xs w-5 text-center font-bold flex-shrink-0">#{p.rank}</span>
                  <img src={p.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{p.product}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Sold: {p.sold} · {fmt(p.revenue)}</p>
                  </div>
                  <Badge variant="secondary" size="sm" className="text-[10px] flex-shrink-0">{p.store}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status pie */}
        <Card className="border-pink-500/20 hover:border-pink-500/40 transition-all">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-base font-bold text-white">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderOverview}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    strokeWidth={0}
                    label={({ name, percent }) => `${name} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {orderOverview.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {orderOverview.map(o => (
                <div key={o.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: o.color }} />
                  <span className="text-slate-400">{o.name}</span>
                  <span className="text-white ml-auto font-medium">{o.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <Card className="border-yellow-500/20 hover:border-yellow-500/40 transition-all">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-base font-bold text-white">Quick Reports</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Sales Report', icon: '📊', color: 'from-emerald-500 to-emerald-600' },
                { label: 'Orders Report', icon: '🛒', color: 'from-blue-500 to-blue-600' },
                { label: 'Stock Report', icon: '📦', color: 'from-purple-500 to-purple-600' },
                { label: 'Customer Report', icon: '👥', color: 'from-orange-500 to-orange-600' },
                { label: 'Analytics', icon: '📈', color: 'from-cyan-500 to-cyan-600' },
                { label: 'Export Data', icon: '⬇️', color: 'from-slate-600 to-slate-700' },
              ].map(r => (
                <button
                  key={r.label}
                  className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${r.color} p-4 text-white text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95`}
                >
                  <div className="relative z-10">
                    <div className="text-2xl mb-1">{r.icon}</div>
                    <p className="text-xs font-semibold leading-tight">{r.label}</p>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stores Overview + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stores Overview */}
        <Card className="lg:col-span-2 border-cyan-500/20 hover:border-cyan-500/40 transition-all">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-white">Stores Overview</CardTitle>
              <Button variant="link" size="sm" className="text-emerald-400 hover:text-emerald-300">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {storesOverview.map(s => (
                <div key={s.id} className="bg-gradient-to-br from-white/8 to-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-emerald-500/30 transition-all group cursor-pointer">
                  <img src={s.image} alt={s.name} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-xs font-semibold truncate">{s.city?.split(',')[0] ?? s.name}</p>
                      <Badge variant="success" size="sm" className="text-[10px]">Active</Badge>
                    </div>
                    <p className="text-slate-500 text-[10px] mb-1">Orders: {s.orders}</p>
                    <p className="text-emerald-400 text-[10px] font-medium mb-2">{fmt(s.sales)}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 text-[10px]">★</span>
                      <span className="text-slate-400 text-[10px]">{s.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-indigo-500/20 hover:border-indigo-500/40 transition-all">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-white">Recent Activities</CardTitle>
              <Button variant="link" size="sm" className="text-emerald-400 hover:text-emerald-300">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3.5">
              {activities.map((a, i) => (
                <div key={i} className="flex gap-3 hover:bg-white/5 p-2 rounded transition-colors">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm",
                    a.icon === 'order' ? 'bg-blue-500/20 text-blue-400' :
                      a.icon === 'stock' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-emerald-500/20 text-emerald-400'
                  )}>
                    {a.icon === 'order' ? '🛒' : a.icon === 'stock' ? '📦' : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs leading-snug truncate font-medium">{a.text}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
