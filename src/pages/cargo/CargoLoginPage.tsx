import { useState } from 'react'
import type { AppPage } from '../../App'
import { useAuth } from '../AuthContext'
import { MOCK_CARGO_USERS, type CargoRole } from '../../pages/data/mockDb'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Route,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'

interface Props {
  onNavigate: (page: AppPage) => void
}

export default function CargoLoginPage({ onNavigate }: Props) {
  const { login } = useAuth()
  const [cargoRole, setCargoRole] = useState<CargoRole>('Fleet Operator / DTC Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      const inputEmail = email.trim().toLowerCase()
      const inputPassword = password.trim()

      // 1. Verify solely against dedicated Cargo database
      const matchedUser = MOCK_CARGO_USERS.find(
        user => user.email.toLowerCase() === inputEmail && user.password === inputPassword
      )

      if (!matchedUser) {
        setIsLoading(false)
        setError('Invalid cargo credentials. Main passenger/admin transit accounts cannot access this gateway.')
        return
      }

      // 2. Strict cargo role enforcement
      if (matchedUser.cargoRole !== cargoRole) {
        setIsLoading(false)
        setError(
          `Role Mismatch: '${matchedUser.email}' is authorized as '${matchedUser.cargoRole}'. You cannot sign in under '${cargoRole}'.`
        )
        return
      }

      // 3. Establish session
      login(matchedUser.email, matchedUser.password)
      localStorage.setItem('dex_cargo_active_role', matchedUser.cargoRole)
      localStorage.setItem('dex_cargo_operator_email', matchedUser.email)
      localStorage.setItem('dex_cargo_operator_name', matchedUser.name)

      setIsLoading(false)
      onNavigate('cargo')
    }, 350)
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-zinc-950 overflow-x-hidden">
      {/* Top SCADA Ticker */}
      <div className="border-b border-orange-500/20 bg-orange-500 py-1.5 text-zinc-950 px-3">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[.12em] text-center">
          <Activity className="size-3.5 shrink-0" />
          <span>DEX SCADA Gatekeeper</span>
          <span className="opacity-40">|</span>
          <span className="hidden sm:inline">Isolated Cargo Logistics Network</span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span>Encrypted Session</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-white/7 bg-zinc-950/85 backdrop-blur-xl px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="relative grid size-8 sm:size-9 rotate-45 place-items-center rounded-xl border border-orange-300 bg-orange-500 text-zinc-950 shadow-[0_0_20px_rgba(249,115,22,0.3)] shrink-0">
            <Route className="size-3.5 sm:size-4 -rotate-45" />
          </span>
          <span className="text-sm sm:text-base font-black tracking-tight whitespace-nowrap">
            DEX <span className="text-orange-500">Cargo</span> <span className="text-[10px] sm:text-xs font-semibold text-zinc-500">| Gateway</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer px-2 py-1 rounded-lg hover:bg-white/5 active:scale-95"
        >
          ← Back to Portal
        </button>
      </header>

      {/* Main Login Card Container */}
      <div className="flex-1 flex items-center justify-center p-3.5 sm:p-6 md:p-8 relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(249,115,22,0.1),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl border border-white/10 bg-zinc-900/80 p-5 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-5 sm:mb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2.5">
              <ShieldCheck className="size-3" /> DTC Freight Auth
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Cargo Terminal Login</h1>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Select your operational assignment and sign in with authorized freight credentials.
            </p>
          </div>

          {error && (
            <div className="mb-4 sm:mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400 leading-relaxed">
              <ShieldAlert className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            {/* Target Role Selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Target Role Environment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 rounded-xl border border-white/10 bg-zinc-950 p-1.5">
                {(['Merchant / Shipper', 'Depot Handler', 'Fleet Operator / DTC Admin', 'Commuter PUDO Pickup'] as const).map(roleOption => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => {
                      setCargoRole(roleOption)
                      setError('')
                    }}
                    className={`rounded-lg py-2.5 px-2 text-[10px] sm:text-[11px] font-bold transition cursor-pointer text-center min-h-[40px] flex items-center justify-center leading-tight ${
                      cargoRole === roleOption
                        ? 'bg-orange-500 text-zinc-950 shadow-md font-extrabold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {roleOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Cargo Operator Email / ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 size-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. fleet@123, merchant@123"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 py-2.5 sm:py-3 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-orange-500/60 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 size-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 py-2.5 sm:py-3 pl-10 pr-3.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-orange-500/60 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] rounded-xl bg-orange-500 py-3 text-xs font-black uppercase tracking-wider text-zinc-950 shadow-[0_0_24px_rgba(249,115,22,0.3)] transition hover:bg-orange-400 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 pt-3"
            >
              {isLoading ? (
                <span>Verifying Role Credentials...</span>
              ) : (
                <>
                  <UserCheck className="size-4 shrink-0" />
                  <span className="truncate">Authenticate as {cargoRole.split(' ')[0]}</span>
                  <ArrowRight className="size-3.5 shrink-0" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation Switcher */}
          <div className="mt-5 pt-3.5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500 text-center sm:text-left">
            <button
              type="button"
              onClick={() => onNavigate('login-admin')}
              className="hover:text-zinc-300 transition cursor-pointer"
            >
              Control Center Login
            </button>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="size-3" /> Dedicated Cargo DB
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}