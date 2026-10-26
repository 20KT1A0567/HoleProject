import { useState, useEffect } from 'react'
import { Download, TrendingUp, ShoppingCart, Package, Users } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import PageHeader from '@/components/ui/PageHeader'
import { adminReportService } from '../../api/adminServices'
import toast from 'react-hot-toast'

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

export default function ReportsPage() {
  const [revenueTrend, setRevenueTrend] = useState<any[]>([])
  const [salesByStore, setSalesByStore] = useState<any[]>([])

  useEffect(() => {
    Promise.all([adminReportService.getRevenueTrend(), adminReportService.getSalesByStore()])
      .then(([rev, sbs]) => { setRevenueTrend(rev); setSalesByStore(sbs) })
  }, [])

  const reports = [
    { title: 'Sales Report', icon: TrendingUp, iconBg: 'bg-green-500/20', iconColor: 'text-green-400', desc: 'Revenue, orders, and sales trends', data: revenueTrend, type: 'line', xKey: 'month', dataKey: 'revenue' },
    { title: 'Orders Report', icon: ShoppingCart, iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400', desc: 'Order status breakdown and trends', data: salesByStore, type: 'bar', xKey: 'store', dataKey: 'sales' },
    { title: 'Stock Report', icon: Package, iconBg: 'bg-purple-500/20', iconColor: 'text-purple-400', desc: 'Inventory levels across all stores', data: salesByStore, type: 'bar', xKey: 'store', dataKey: 'sales' },
    { title: 'Customer Report', icon: Users, iconBg: 'bg-orange-500/20', iconColor: 'text-orange-400', desc: 'Customer growth and behavior', data: revenueTrend, type: 'line', xKey: 'month', dataKey: 'revenue' },
  ]

  return (
    <div>
      <PageHeader title="Reports" subtitle="Download and analyze business data" />

      {/* Date range */}
      <div className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-4 mb-5 flex flex-wrap gap-3 items-center">
        <span className="text-[#94A3B8] text-sm">Date Range:</span>
        {['Today', 'This Week', 'This Month', 'Last 3 Months', 'This Year'].map(r => (
          <button key={r} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${r === 'This Month' ? 'bg-[#22C55E] text-black' : 'bg-[#0A1628] border border-[#1E3A5F] text-[#94A3B8] hover:text-white'}`}>
            {r}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <input type="date" defaultValue="2025-05-01" className="bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#22C55E]" />
          <input type="date" defaultValue="2025-05-24" className="bg-[#0A1628] border border-[#1E3A5F] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#22C55E]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {reports.map(r => (
          <div key={r.title} className="bg-[#0F1F35] rounded-xl border border-[#1E3A5F] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${r.iconBg} flex items-center justify-center`}>
                  <r.icon size={18} className={r.iconColor} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{r.title}</h3>
                  <p className="text-[#64748B] text-xs">{r.desc}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toast.success(`Downloading ${r.title} CSV...`)}
                  className="flex items-center gap-1.5 bg-[#0A1628] border border-[#1E3A5F] text-[#94A3B8] hover:text-white px-2.5 py-1.5 rounded-lg text-xs">
                  <Download size={12} /> CSV
                </button>
                <button onClick={() => toast.success(`Downloading ${r.title} PDF...`)}
                  className="flex items-center gap-1.5 bg-[#22C55E] hover:bg-[#16A34A] text-black font-medium px-2.5 py-1.5 rounded-lg text-xs">
                  <Download size={12} /> PDF
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              {r.type === 'line' ? (
                <LineChart data={r.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                  <XAxis dataKey={r.xKey} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
                  <Tooltip contentStyle={{ background: '#0F1F35', border: '1px solid #1E3A5F', borderRadius: 8 }} labelStyle={{ color: '#fff' }} formatter={(v: any) => [fmt(Number(v ?? 0))]} />
                  <Line type="monotone" dataKey={r.dataKey} stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E', r: 3 }} />
                </LineChart>
              ) : (
                <BarChart data={r.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                  <XAxis dataKey={r.xKey} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
                  <Tooltip contentStyle={{ background: '#0F1F35', border: '1px solid #1E3A5F', borderRadius: 8 }} labelStyle={{ color: '#fff' }} formatter={(v: any) => [fmt(Number(v ?? 0))]} />
                  <Bar dataKey={r.dataKey} fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  )
}
