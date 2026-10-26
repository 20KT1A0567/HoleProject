import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'

const ADMIN_ROLES = ['SUPER_ADMIN', 'STORE_MANAGER', 'SALES_STAFF', 'SUPPORT']

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token, name, role } = res.data ?? {}
      if (!token) { toast.error('Login failed: no token returned'); return }
      if (!ADMIN_ROLES.includes(role)) {
        toast.error(`Access denied: role ${role} cannot use admin panel`)
        return
      }
      login({ name: name ?? email, email, role }, token)
      toast.success(`Welcome back, ${name ?? 'Admin'}!`)
      navigate('/dashboard')
    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message
        || (status === 401 || status === 403 ? 'Invalid email or password' : 'Login failed')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05080D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-[#22C55E] rounded-lg px-3 py-2">
              <span className="font-black text-black text-2xl">VR</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-white text-lg leading-none">TECHNOLOGIES</p>
              <p className="text-[#22C55E] text-xs">ADMIN PANEL</p>
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold">Sign in to Admin Panel</h1>
          <p className="text-[#64748B] text-sm mt-1">Manage your stores, products & orders</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#0F1F35] rounded-2xl border border-[#1E3A5F] p-8 space-y-5 shadow-2xl">
          <div>
            <label className="text-[#94A3B8] text-sm font-medium block mb-2">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@vr.com"
                className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg pl-9 pr-4 py-3 text-white placeholder-[#64748B] text-sm focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>
          <div>
            <label className="text-[#94A3B8] text-sm font-medium block mb-2">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded-lg pl-9 pr-10 py-3 text-white placeholder-[#64748B] text-sm focus:outline-none focus:border-[#22C55E]"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-[#64748B] text-xs">
            Demo: admin@vr.com / admin123
          </p>
        </form>
      </div>
    </div>
  )
}
