import { useState, useEffect } from 'react'

interface SavedRoute {
  from: string
  to: string
  route: string
  freq: string
}

interface HistoryItem {
  date: string
  route: string
  from: string
  to: string
  fare: number
}

const initialSavedRoutes: SavedRoute[] = [
  { from: 'Dwarka Sec-21', to: 'Connaught Place', route: '764', freq: 'Daily' },
  { from: 'Kashmere Gate', to: 'Dilshad Garden', route: '302', freq: '3x/week' },
  { from: 'Mahipalpur', to: 'Airport T3', route: '118', freq: 'Monthly' },
]

const initialHistory: HistoryItem[] = [
  { date: '12 Sep 2026', route: '302', from: 'Kashmere Gate', to: 'Dilshad Garden', fare: 25 },
  { date: '10 Sep 2026', route: '411', from: 'Nehru Place', to: 'Dwarka Sec-21', fare: 40 },
  { date: '8 Sep 2026', route: '118', from: 'Mahipalpur', to: 'Airport T3', fare: 55 },
  { date: '5 Sep 2026', route: '764', from: 'Dwarka Sec-21', to: 'Dhaula Kuan', fare: 20 },
]

export default function PassengerProfile() {
  // 1. User state
  const [profileName, setProfileName] = useState('Priya Sharma')
  const [profileEmail, setProfileEmail] = useState('priya.sharma@gmail.com')
  const [passengerId, setPassengerId] = useState('ET-2847-DL')

  // 2. Wallet state
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('passenger_wallet_balance')
      return saved ? parseFloat(saved) : 142.5
    } catch {
      return 142.5
    }
  })

  // 3. Saved Routes
  const [routes, setRoutes] = useState<SavedRoute[]>(() => {
    try {
      const saved = localStorage.getItem('passenger_saved_routes')
      return saved ? JSON.parse(saved) : initialSavedRoutes
    } catch {
      return initialSavedRoutes
    }
  })

  // 4. History (merged with real bookings)
  const [travelHistory, setTravelHistory] = useState<HistoryItem[]>(initialHistory)

  // Modals
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState<number>(200)
  const [showAddRouteModal, setShowAddRouteModal] = useState(false)
  const [newRoute, setNewRoute] = useState({ from: '', to: '', route: '', freq: 'Daily' })
  const [feedback, setFeedback] = useState<string | null>(null)

  // Sync user profile and booked tickets
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser')
      if (stored) {
        const user = JSON.parse(stored)
        if (user.name) setProfileName(user.name)
        if (user.email) setProfileEmail(user.email)
        if (user.id) setPassengerId(`ET-${user.id.slice(-4).toUpperCase()}-DL`)
      }

      const bookedTickets = localStorage.getItem('passenger_booked_tickets')
      if (bookedTickets) {
        const parsed = JSON.parse(bookedTickets)
        const newHistory = parsed.map((t: any) => ({
          date: t.date || 'Recent',
          route: t.route,
          from: t.from,
          to: t.to,
          fare: t.fare,
        }))
        setTravelHistory([...newHistory, ...initialHistory])
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Sync wallet
  useEffect(() => {
    localStorage.setItem('passenger_wallet_balance', walletBalance.toString())
  }, [walletBalance])

  // Sync routes
  useEffect(() => {
    localStorage.setItem('passenger_saved_routes', JSON.stringify(routes))
  }, [routes])

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault()
    if (rechargeAmount <= 0) return
    const updated = walletBalance + rechargeAmount
    setWalletBalance(updated)
    setShowAddMoneyModal(false)
    setFeedback(`✓ Added ₹${rechargeAmount}.00 to EquiTransit Wallet via UPI.`)
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoute.from.trim() || !newRoute.to.trim()) return
    const item: SavedRoute = {
      from: newRoute.from.trim(),
      to: newRoute.to.trim(),
      route: newRoute.route.trim() || 'Feeder',
      freq: newRoute.freq,
    }
    setRoutes(prev => [item, ...prev])
    setShowAddRouteModal(false)
    setNewRoute({ from: '', to: '', route: '', freq: 'Daily' })
    setFeedback('✓ Route added to your favorites!')
    setTimeout(() => setFeedback(null), 2500)
  }

  return (
    <div className="w-full max-w-5xl space-y-5 sm:space-y-6 text-slate-800 font-sans">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account credentials, saved transit routes, and travel receipts
        </p>
      </div>

      {/* Action Notification Banner */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <span>{feedback}</span>
        </div>
      )}

      {/* Responsive Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-4 sm:gap-6">
        {/* Left Column: User Card & Wallet */}
        <div className="space-y-4 sm:space-y-5">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs text-center">
            <div className="size-18 sm:size-20 rounded-full bg-gradient-to-br from-[#2D89EF] to-[#00C897] text-white flex items-center justify-center text-2xl sm:text-3xl font-black shadow-md mx-auto mb-3.5">
              {getInitials(profileName)}
            </div>

            <h2 className="font-bold text-lg sm:text-xl text-slate-900">
              {profileName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">Verified Commuter</p>

            {/* 3 Metric Badges */}
            <div className="grid grid-cols-3 gap-2 py-3.5 border-y border-slate-100 mb-4">
              {[
                { val: `${120 + travelHistory.length}`, label: 'Journeys' },
                { val: '₹2,840', label: 'Spent' },
                { val: '4.8★', label: 'Rating' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-black text-base sm:text-lg text-slate-900 font-mono">
                    {s.val}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Identity Details */}
            <div className="space-y-2.5 text-left text-xs sm:text-[13px]">
              {[
                { label: 'Passenger ID', val: passengerId, mono: true },
                { label: 'Mobile', val: '+91 98765 43210' },
                { label: 'Email', val: profileEmail },
                { label: 'DTC Smart Card', val: '••••••8821' },
                { label: 'Wallet Balance', val: `₹${walletBalance.toFixed(2)}`, mono: true },
              ].map(f => (
                <div key={f.label} className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 text-xs">{f.label}</span>
                  <span className={`font-semibold text-slate-800 truncate max-w-[180px] ${f.mono ? 'font-mono' : ''}`}>
                    {f.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-800 text-white shadow-lg">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
              DEX WALLET BALANCE
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight mb-1 text-emerald-400">
              ₹{walletBalance.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 mb-4">
              Instant digital transit fare debit enabled
            </div>
            <button
              type="button"
              onClick={() => setShowAddMoneyModal(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00C897] to-[#009d78] hover:from-[#05dfa9] hover:to-[#02b389] text-white text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(0,200,151,0.3)] transition cursor-pointer active:scale-95 text-center"
            >
              + Add Money
            </button>
          </div>
        </div>

        {/* Right Column: Saved Routes & Travel History */}
        <div className="space-y-4 sm:space-y-5">
          {/* Saved Routes */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:px-5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Saved Favorite Routes
              </h3>
              <button
                type="button"
                onClick={() => setShowAddRouteModal(true)}
                className="text-xs font-bold text-[#2D89EF] hover:underline cursor-pointer"
              >
                + Add Route
              </button>
            </div>

            <div className="p-3 sm:p-4 divide-y divide-slate-100">
              {routes.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 sm:py-3 first:pt-1 last:pb-1"
                >
                  <div className="size-9 sm:size-10 rounded-xl bg-blue-50 border border-blue-200/60 text-[#2D89EF] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {r.route}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {r.from} → {r.to}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {r.freq} Commute
                    </div>
                  </div>
                  <span className="text-base shrink-0 select-none">⭐</span>
                </div>
              ))}
            </div>
          </div>

          {/* Travel History */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:px-5 sm:py-4 border-b border-slate-100">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Recent Travel History
              </h3>
            </div>

            <div className="p-3 sm:p-4 divide-y divide-slate-100">
              {travelHistory.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 sm:py-3 first:pt-1 last:pb-1"
                >
                  <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {h.from} → {h.to}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {h.date} · Route {h.route}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 shrink-0">
                    ₹{h.fare}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              Top Up Transit Wallet
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Instant recharge using Unified Payments Interface (UPI)
            </p>

            <form onSubmit={handleAddMoney} className="space-y-4">
              <div className="grid grid-cols-4 gap-1.5">
                {[100, 200, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRechargeAmount(amt)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition cursor-pointer border ${
                      rechargeAmount === amt
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Recharge Amount (₹)
                </label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={rechargeAmount}
                  onChange={e => setRechargeAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono text-slate-900 outline-none focus:border-[#2D89EF] transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMoneyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00C897] to-[#009d78] hover:from-[#05dfa9] text-white text-xs font-bold shadow-md transition cursor-pointer active:scale-95"
                >
                  Pay via UPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
              Save Frequent Route
            </h3>

            <form onSubmit={handleAddRoute} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Origin Stop
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dwarka Sec-21"
                  value={newRoute.from}
                  onChange={e => setNewRoute({ ...newRoute, from: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#2D89EF] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Destination Stop
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Connaught Place"
                  value={newRoute.to}
                  onChange={e => setNewRoute({ ...newRoute, to: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#2D89EF] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Bus / Route Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 764"
                    value={newRoute.route}
                    onChange={e => setNewRoute({ ...newRoute, route: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#2D89EF] transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newRoute.freq}
                    onChange={e => setNewRoute({ ...newRoute, freq: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:border-[#2D89EF] transition"
                  >
                    <option value="Daily">Daily</option>
                    <option value="3x/week">3x/week</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] text-white text-xs font-bold shadow-md transition cursor-pointer active:scale-95"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}