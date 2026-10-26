import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Search,
  MapPin,
  User,
  Menu,
  X,
  Shield,
  RotateCcw,
  Truck,
  Store,
  Package,
  Headphones,
  CheckCircle,
  ChevronDown,
  LogOut,
  Heart,
} from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

const NAV_LINKS = [
  { label: 'All Categories', href: '/products' },
  { label: 'Laptops', href: '/products?category=Laptops' },
  { label: 'Desktops', href: '/products?category=Desktops' },
  { label: 'Accessories', href: '/products?category=Accessories' },
  { label: 'Monitors', href: '/products?category=Monitors' },
  { label: 'Brands', href: '/products?view=brands' },
  { label: 'Offers', href: '/products?tag=offers' },
  { label: 'New Arrivals', href: '/products?tag=new' },
  { label: 'Stores', href: '/stores' },
]

const TOP_STRIP = [
  { icon: CheckCircle, label: 'Quality Checked' },
  { icon: Shield, label: '6-Month Warranty' },
  { icon: RotateCcw, label: 'Easy Returns' },
  { icon: Truck, label: 'Free Delivery' },
  { icon: Store, label: 'Store Locator', href: '/stores' },
  { icon: Package, label: 'Track Order', href: '/orders' },
  { icon: Headphones, label: 'Support', href: '/contact' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)
  const navigate = useNavigate()
  const itemCount = useCartStore((s) => s.itemCount())
  const { isAuthenticated, user, logout } = useAuthStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    setAccountOpen(false)
    navigate('/')
  }

  return (
    <header className="w-full sticky top-0 z-50 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
      {/* Top strip */}
      <div className="bg-[#070a08] text-gray-300 text-xs py-2 px-4 hidden md:flex items-center justify-center gap-7 overflow-x-auto border-b border-white/10">
        {TOP_STRIP.map(({ icon: Icon, label, href }) => (
          href ? (
            <Link key={label} to={href} className="flex items-center gap-1 hover:text-green-400 transition-colors whitespace-nowrap">
              <Icon size={12} />
              <span>{label}</span>
            </Link>
          ) : (
            <span key={label} className="flex items-center gap-1 whitespace-nowrap">
              <Icon size={12} />
              <span>{label}</span>
            </span>
          )
        ))}
      </div>

      {/* Main header */}
      <div className="bg-[#0a0f0d] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="vr-logo-mark">VR</div>
            <div>
              <p className="font-black text-white text-base leading-tight tracking-tight">TECHNOLOGIES</p>
              <p className="text-xs text-[#7ed321] leading-tight hidden sm:block">REFURBISHED. RELIABLE. READY FOR YOU.</p>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="flex w-full rounded-[10px] overflow-hidden border border-white/15 bg-white focus-within:border-[#7ed321] focus-within:ring-2 focus-within:ring-[#7ed321]/25 transition-all">
              <input
                type="text"
                placeholder="Search laptops, desktops, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white text-gray-900 px-4 py-2.5 text-sm outline-none"
              />
              <button
                type="submit"
                className="bg-[#64b51d] hover:bg-[#7ed321] text-white px-4 py-2 transition-colors"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Location */}
          <button className="hidden lg:flex items-center gap-2 text-white hover:text-[#7ed321] transition-colors shrink-0">
            <MapPin size={18} className="text-[#7ed321]" />
            <div className="text-left">
              <p className="text-xs text-gray-400">Deliver to</p>
              <p className="text-sm font-medium">KPHB, Hyderabad</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {/* Account */}
          <div className="relative shrink-0">
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="flex items-center gap-1.5 text-white hover:text-[#7ed321] transition-colors"
            >
              <User size={20} />
              <div className="hidden sm:block text-left">
                <p className="text-xs text-gray-400">{isAuthenticated ? 'Hello,' : 'Sign in'}</p>
                <p className="text-sm font-medium">{isAuthenticated ? (user?.name.split(' ')[0] ?? 'Account') : 'My Account'}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 w-48 py-2 z-50">
                {isAuthenticated ? (
                  <>
                    <Link to="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Package size={16} /> My Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Heart size={16} /> Wishlist
                    </Link>
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      Create Account
                    </Link>
                    <hr className="my-1" />
                    <Link to="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Package size={16} /> Track Order
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" className="relative flex items-center gap-1.5 text-white hover:text-[#7ed321] transition-colors shrink-0">
            <div className="relative">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#7ed321] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:block text-sm font-medium">Cart</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden mt-3 flex">
          <div className="flex w-full rounded-lg overflow-hidden border border-gray-600 focus-within:border-green-400">
            <input
              type="text"
              placeholder="Search laptops, desktops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white text-gray-900 px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="bg-green-500 text-white px-3 py-2">
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Navigation bar */}
      <nav className="bg-[#0a0f0d] border-t border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-gray-200 hover:text-[#7ed321] hover:bg-[#7ed321]/10 text-sm px-3 py-3 whitespace-nowrap transition-colors font-semibold border-b-2 border-transparent hover:border-[#7ed321]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="bg-[#07111F] border-t border-gray-800 md:hidden">
          <div className="px-4 py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-gray-300 hover:text-green-400 py-3 text-sm font-medium border-b border-gray-800 last:border-0"
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-3 mt-3 pb-3">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center bg-green-500 text-black font-semibold py-2 rounded-lg text-sm">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center border border-green-500 text-green-400 font-semibold py-2 rounded-lg text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
