import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, Star, Truck, RotateCcw } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

interface Props {
  defaultTab?: 'login' | 'register'
}

export default function LoginPage({ defaultTab = 'login' }: Props) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: ''
  })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill all fields')
      return
    }
    setLoading(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000))
    login(
      { id: 1, name: 'Demo User', email: loginForm.email },
      'demo_token_123'
    )
    toast.success('Logged in successfully!', { icon: '👋' })
    navigate('/')
    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast.error('Please fill all required fields')
      return
    }
    if (registerForm.password !== registerForm.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    login(
      { id: 1, name: registerForm.name, email: registerForm.email, phone: registerForm.phone },
      'demo_token_123'
    )
    toast.success('Account created successfully!', { icon: '🎉' })
    navigate('/')
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex">
      {/* Left panel - Brand */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#07111F] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-green-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          <Link to="/" className="flex items-center gap-3 justify-center mb-8">
            <div className="bg-green-500 rounded-lg px-3 py-2 font-black text-black text-3xl leading-none">VR</div>
            <div className="text-left">
              <p className="font-black text-white text-lg leading-tight">TECHNOLOGIES</p>
              <p className="text-xs text-green-400 leading-tight">REFURBISHED. RELIABLE. READY FOR YOU.</p>
            </div>
          </Link>

          <h2 className="text-2xl font-bold text-white mb-3">Hyderabad's Most Trusted<br />Refurbished Tech Store</h2>
          <p className="text-gray-400 text-sm mb-10 max-w-xs">
            Premium quality laptops & desktops at unbeatable prices, backed by a 6-month warranty.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {[
              { icon: Shield, text: '6-Month Warranty', color: 'text-blue-400' },
              { icon: Star, text: '4.5+ Rating', color: 'text-yellow-400' },
              { icon: Truck, text: 'Free Delivery', color: 'text-green-400' },
              { icon: RotateCcw, text: '7-Day Returns', color: 'text-orange-400' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-2 bg-white/5 rounded-xl p-3">
                <Icon size={18} className={color} />
                <span className="text-xs text-gray-300 font-medium">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-6 justify-center text-center">
            <div>
              <p className="text-2xl font-black text-green-400">4</p>
              <p className="text-xs text-gray-500">Stores</p>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div>
              <p className="text-2xl font-black text-cyan-400">3600+</p>
              <p className="text-xs text-gray-500">Customers</p>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div>
              <p className="text-2xl font-black text-purple-400">860+</p>
              <p className="text-xs text-gray-500">Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Forms */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="bg-green-500 rounded px-2 py-1 font-black text-black text-xl leading-none">VR</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">TECHNOLOGIES</p>
                <p className="text-xs text-green-600">REFURBISHED. RELIABLE. READY FOR YOU.</p>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {/* Tab switcher */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  tab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Login form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email / Phone</label>
                  <input
                    type="text"
                    placeholder="Enter email or phone number"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-gray-700">Password</label>
                    <button type="button" className="text-xs text-green-600 hover:underline">Forgot Password?</button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 pr-11 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-black font-bold py-3.5 rounded-xl text-sm transition-colors"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">or continue with</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-400 py-3 rounded-xl text-sm font-medium text-gray-700 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 7 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.2 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 7 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.2 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6.2 5.2C41.5 36.1 44 30.4 44 24c0-1.3-.1-2.6-.4-3.9z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>
            )}

            {/* Register form */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 pr-11 transition-colors"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={registerForm.confirm}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 pr-11 transition-colors"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  By registering, you agree to our{' '}
                  <Link to="/terms" className="text-green-600 hover:underline">Terms & Conditions</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-black font-bold py-3.5 rounded-xl text-sm transition-colors"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            {tab === 'login' ? (
              <>Don't have an account?{' '}<button onClick={() => setTab('register')} className="text-green-600 font-semibold hover:underline">Sign Up</button></>
            ) : (
              <>Already have an account?{' '}<button onClick={() => setTab('login')} className="text-green-600 font-semibold hover:underline">Sign In</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
