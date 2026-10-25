import { useState, useEffect } from 'react'
import type { AppPage } from '../App'
import { MOCK_USERS, User } from './data/mockDb'

interface Props {
  role: 'passenger' | 'admin'
  onNavigate: (page: AppPage) => void
}

export default function LoginPage({ role, onNavigate }: Props) {
  const isAdmin = role === 'admin'

  // Admin portal is strictly 'signin' only; passenger portal allows toggling
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  // Form input states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Status feedback states
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // Force signin mode and reset fields when switching role
  useEffect(() => {
    if (isAdmin) {
      setAuthMode('signin')
    }
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFullName('')
    setErrorMsg('')
    setSuccessMsg('')
  }, [isAdmin, authMode])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email and password.')
      return
    }

    // --- Sign Up Flow (Passengers Only) ---
    if (!isAdmin && authMode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.')
        return
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.')
        return
      }

      setLoading(true)

      setTimeout(() => {
        let dynamicUsers: any[] = []
        try {
          const stored = localStorage.getItem('dex_registered_users')
          if (stored) dynamicUsers = JSON.parse(stored)
        } catch {
          dynamicUsers = []
        }

        const allUsers = [...dynamicUsers, ...MOCK_USERS]
        const emailExists = allUsers.some(
          u => u.email.trim().toLowerCase() === email.trim().toLowerCase()
        )

        if (emailExists) {
          setLoading(false)
          setErrorMsg('An account with this email already exists.')
          return
        }

        const randomId = Math.floor(1000 + Math.random() * 9000).toString()
        const newUser = {
          id: `DEX-${randomId}-DL`,
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          role: 'passenger',
          avatar: fullName.trim().charAt(0).toUpperCase(),
        }

        const updatedUsers = [newUser, ...dynamicUsers]
        localStorage.setItem('dex_registered_users', JSON.stringify(updatedUsers))
        localStorage.setItem('passenger_wallet_balance', '10.00')

        const { password: _, ...safeUser } = newUser
        localStorage.setItem('currentUser', JSON.stringify(safeUser))
        localStorage.setItem('current_user', JSON.stringify(safeUser))

        setLoading(false)
        setSuccessMsg('Account created successfully! Credited ₹10.00. Redirecting…')

        setTimeout(() => {
          onNavigate('passenger')
        }, 800)
      }, 700)
      return
    }

    // --- Sign In Flow (Admin & Registered/Mock Passengers) ---
    setLoading(true)

    setTimeout(() => {
      let dynamicUsers: User[] = []
      try {
        const stored = localStorage.getItem('dex_registered_users')
        if (stored) dynamicUsers = JSON.parse(stored)
      } catch {
        dynamicUsers = []
      }

      const allUsers = [...dynamicUsers, ...MOCK_USERS]
      const user = allUsers.find(
        u =>
          u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
          (u as any).password === password &&
          u.role === role
      )

      if (user) {
        const { password: _, ...safeUser } = user as any
        localStorage.setItem('currentUser', JSON.stringify(safeUser))
        localStorage.setItem('current_user', JSON.stringify(safeUser))

        setLoading(false)
        onNavigate(isAdmin ? 'admin' : 'passenger')
      } else {
        setLoading(false)
        setErrorMsg(
          isAdmin
            ? 'Unauthorized: Admin credentials not found in transit database.'
            : 'Invalid email or password.'
        )
      }
    }, 600)
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center font-sans relative overflow-x-hidden p-4 sm:p-6 ${
        isAdmin
          ? 'bg-gradient-to-br from-slate-950 via-[#1a2744] to-[#0a1628] text-white'
          : 'bg-gradient-to-br from-blue-50/70 via-sky-50/50 to-blue-100/50 text-slate-900'
      }`}
    >
      {/* Background Dots Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(45,137,239,0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-full max-w-md mx-auto space-y-5">
        {/* Header Logo */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2.5 bg-transparent border-none cursor-pointer group mb-1"
          >
            <div className="size-10 sm:size-11 rounded-xl bg-gradient-to-br from-[#2D89EF] to-[#00C897] flex items-center justify-center text-xl shadow-md">
              🚌
            </div>
            <span className="font-['Poppins'] font-extrabold text-xl sm:text-2xl tracking-tight text-white">
              DEX-DelhiExpress
            </span>
          </button>
          <p className={`text-xs sm:text-sm ${isAdmin ? 'text-slate-400' : 'text-slate-600'}`}>
            {isAdmin ? 'Central Transit Control & Fleet Dispatch' : 'AI Powered Smart Public Transport Ecosystem'}
          </p>
        </div>

        {/* Login / Sign Up Card */}
        <div
          className={`rounded-2xl sm:rounded-3xl p-5 sm:p-8 backdrop-blur-xl shadow-xl border ${
            isAdmin
              ? 'bg-slate-900/80 border-white/10 shadow-black/40'
              : 'bg-white/95 border-slate-200/80 shadow-blue-500/10'
          }`}
        >
          {/* Sign In / Sign Up Toggle (Rendered ONLY for passengers) */}
          {!isAdmin ? (
            <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-4 font-mono">
              🔒 RESTRICTED CONSOLE
            </div>
          )}

          <h2 className="font-bold text-lg sm:text-xl tracking-tight mb-1">
            {isAdmin
              ? 'Control Center Login'
              : authMode === 'signin'
              ? 'Welcome Back'
              : 'Create Passenger ID'}
          </h2>
          <p className={`text-xs mb-5 ${isAdmin ? 'text-slate-400' : 'text-slate-500'}`}>
            {isAdmin
              ? 'Authorized transit personnel & operations staff only'
              : authMode === 'signin'
              ? 'Enter your credentials to continue'
              : 'Sign up to receive ₹10 welcome transit balance'}
          </p>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <span>✓ {successMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isAdmin && authMode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  placeholder="e.g. Aman Sharma"
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:border-[#2D89EF] transition"
                />
              </div>
            )}

            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isAdmin ? 'text-slate-300' : 'text-slate-500'}`}>
                {isAdmin ? 'Official Staff Email ID' : 'Email Address'}
              </label>
              <input
                type="email"
                required
                value={email}
                placeholder={isAdmin ? 'admin@dex.gov.in' : 'name@example.com'}
                onChange={e => setEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm outline-none transition ${
                  isAdmin
                    ? 'border-white/15 bg-white/5 text-white placeholder-slate-500 focus:border-[#2D89EF]'
                    : 'border-slate-200 bg-white text-slate-900 focus:border-[#2D89EF]'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isAdmin ? 'text-slate-300' : 'text-slate-500'}`}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                placeholder="••••••••"
                onChange={e => setPassword(e.target.value)}
                className={`w-full px-3.5 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm outline-none transition ${
                  isAdmin
                    ? 'border-white/15 bg-white/5 text-white placeholder-slate-500 focus:border-[#2D89EF]'
                    : 'border-slate-200 bg-white text-slate-900 focus:border-[#2D89EF]'
                }`}
              />
            </div>

            {!isAdmin && authMode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  placeholder="••••••••"
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:border-[#2D89EF] transition"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 sm:py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95 disabled:opacity-70 ${
                isAdmin || authMode === 'signin'
                  ? 'bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff]'
                  : 'bg-gradient-to-r from-[#00C897] to-[#009d78] hover:from-[#05dfa9]'
              }`}
            >
              {loading
                ? 'Authenticating…'
                : isAdmin
                ? 'Sign In to Control Center'
                : authMode === 'signin'
                ? 'Sign In'
                : 'Create Account & Claim ₹10'}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className={`bg-transparent border-none text-xs cursor-pointer hover:underline ${
                isAdmin ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Portal Switch Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => onNavigate(isAdmin ? 'login-passenger' : 'login-admin')}
            className={`bg-transparent border-none text-xs font-semibold cursor-pointer hover:underline ${
              isAdmin ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {isAdmin ? 'Switch to Passenger Portal →' : 'Switch to Admin / Control Center →'}
          </button>
        </div>
      </div>
    </div>
  )
}