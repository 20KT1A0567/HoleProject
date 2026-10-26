import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Grid3X3, Tag, ShoppingCart, Users, MapPin,
  Warehouse, BarChart3, Image, Ticket, Star, FileText, TrendingUp,
  UserCog, Settings, Plus, Bell, Search, Sun, Moon, ChevronDown,
  LogOut, Menu, X, AlertCircle, MessageCircle
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/categories', icon: Grid3X3, label: 'Categories' },
  { to: '/brands', icon: Tag, label: 'Brands' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/stores', icon: MapPin, label: 'Stores' },
  { to: '/inventory', icon: Warehouse, label: 'Inventory' },
  { to: '/banners', icon: Image, label: 'Banners' },
  { to: '/coupons', icon: Ticket, label: 'Coupons' },
  { to: '/reviews', icon: Star, label: 'Reviews' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/analytics', icon: TrendingUp, label: 'Sales & Analytics' },
  { to: '/whatsapp-campaigns', icon: MessageCircle, label: 'WhatsApp Campaigns' },
  { to: '/users', icon: UserCog, label: 'Users & Roles' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const quickActions = [
  { label: 'Add New Product', to: '/products/new', icon: Package },
  { label: 'Add New Store', to: '/stores', icon: MapPin },
  { label: 'Create Banner', to: '/banners', icon: Image },
  { label: 'Add Coupon', to: '/coupons', icon: Ticket },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn(
      mobile ? 'w-full' : 'w-64 hidden lg:flex',
      'flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 border-r border-emerald-500/10 h-full overflow-y-auto'
    )}>
      {/* Logo - Enhanced */}
      <div className="p-6 border-b border-emerald-500/10 flex items-center gap-3">
        <div className="admin-logo-mark text-lg">VR</div>
        <div>
          <p className="font-black text-white text-sm leading-none tracking-tighter">TECHNOLOGIES</p>
          <p className="text-emerald-400 text-[9px] font-black tracking-widest">ADMIN PANEL</p>
        </div>
      </div>

      {/* Nav - Organized by sections */}
      <nav className="flex-1 p-3 space-y-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 opacity-70">Core</p>
          {navItems.slice(0, 1).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-lg shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/8'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Catalog */}
        <div className="space-y-1">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 opacity-60">Catalog</p>
          {navItems.slice(1, 4).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Orders & Customers */}
        <div className="space-y-1">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 opacity-60">Business</p>
          {navItems.slice(4, 6).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Stores & Inventory */}
        <div className="space-y-1">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 opacity-60">Operations</p>
          {navItems.slice(6, 8).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Marketing */}
        <div className="space-y-1">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 opacity-60">Marketing</p>
          {navItems.slice(8, 10).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Analytics & Admin */}
        <div className="space-y-1">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 opacity-60">Analytics</p>
          {navItems.slice(10, 16).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Quick Actions - Improved */}
      <div className="p-3 border-t border-emerald-500/10 space-y-2">
        <p className="text-emerald-400 text-xs font-black uppercase tracking-wider px-3 opacity-80">Quick Actions</p>
        {quickActions.map(a => (
          <button
            key={a.to}
            onClick={() => { navigate(a.to); setSidebarOpen(false) }}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-slate-400 hover:text-emerald-300 text-xs font-medium rounded-xl hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20"
          >
            <a.icon size={14} />
            {a.label}
            <Plus size={12} className="ml-auto opacity-50" />
          </button>
        ))}
      </div>

      {/* Help Section - Improved */}
      <div className="p-3">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 rounded-xl p-4 text-center hover:border-emerald-500/40 transition-all">
          <AlertCircle size={20} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-white text-xs font-semibold mb-1">Need Help?</p>
          <p className="text-slate-400 text-[10px] mb-3">Support team ready to assist</p>
          <Button size="sm" className="w-full text-xs bg-emerald-600 hover:bg-emerald-500">Contact Support</Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar - Enhanced */}
        <header className="bg-slate-950/80 border-b border-emerald-500/10 px-4 lg:px-8 py-3.5 flex items-center gap-4 backdrop-blur-2xl sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <Menu size={20} />
          </button>

          {/* Search - Enhanced */}
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              placeholder="Search products, orders, customers..."
              className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle - Enhanced */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-white/8 border border-white/15 text-slate-400 hover:text-emerald-400 transition-all duration-200 hover:bg-emerald-500/10"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications - Enhanced */}
            <button className="relative p-2.5 rounded-xl bg-white/8 border border-white/15 text-slate-400 hover:text-emerald-400 transition-all duration-200 hover:bg-emerald-500/10">
              <Bell size={18} />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 items-center justify-center p-0 text-[10px] bg-red-500">
                12
              </Badge>
            </button>

            {/* Profile - Enhanced */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-xl px-3 py-2 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
              >
                <Avatar
                  src={user?.avatar}
                  fallback={user?.name?.[0] ?? 'A'}
                  size="sm"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-white text-xs font-semibold">{user?.name ?? 'Admin'}</p>
                  <p className="text-slate-500 text-[10px]">Super Admin</p>
                </div>
                <ChevronDown size={14} className={cn('text-slate-500 transition-transform', profileOpen && 'rotate-180')} />
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                    <div className="p-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-transparent">
                      <p className="text-white text-sm font-semibold">{user?.name}</p>
                      <p className="text-slate-400 text-xs mt-1">{user?.email}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors">
                        <UserCog size={14} />
                        Profile Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content - Enhanced */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
