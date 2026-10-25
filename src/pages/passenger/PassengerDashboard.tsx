import { useState, useEffect } from 'react'

interface Props {
  onTabChange?: (tab: string) => void
}

export default function PassengerDashboard({ onTabChange }: Props) {
  const [activeBusesCount, setActiveBusesCount] = useState<number>(5)
  const [walletBal, setWalletBal] = useState<number>(10)
  const [recentTicket, setRecentTicket] = useState<any>(null)

  const syncData = () => {
    // 1. Sync Active Fleet Count from Admin bridge
    try {
      const fleetRaw = localStorage.getItem('admin_fleet_buses')
      if (fleetRaw) {
        const parsed = JSON.parse(fleetRaw)
        if (Array.isArray(parsed)) {
          const count = parsed.filter(b => (b.status || '').toLowerCase() === 'active').length
          setActiveBusesCount(count)
        }
      }
    } catch {
      setActiveBusesCount(5)
    }

    // 2. Sync Wallet Balance
    try {
      const balRaw = localStorage.getItem('passenger_wallet_balance')
      if (balRaw) {
        setWalletBal(parseFloat(balRaw))
      }
    } catch {
      setWalletBal(10)
    }

    // 3. Sync User's Latest Ticket
    try {
      const userRaw = localStorage.getItem('currentUser')
      const user = userRaw ? JSON.parse(userRaw) : null
      const userKey = user?.id ? `tickets_${user.id}` : 'passenger_booked_tickets'
      const ticketsRaw = localStorage.getItem(userKey) || localStorage.getItem('passenger_booked_tickets')
      if (ticketsRaw) {
        const tickets = JSON.parse(ticketsRaw)
        if (tickets.length > 0) {
          setRecentTicket(tickets[0])
        }
      }
    } catch {
      setRecentTicket(null)
    }
  }

  useEffect(() => {
    syncData()
    const handleStorage = () => syncData()
    window.addEventListener('storage', handleStorage)
    const interval = setInterval(syncData, 2000)

    return () => {
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="w-full max-w-5xl space-y-6 text-slate-800 font-sans">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Namaste, Commuter 👋
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Welcome to the Delhi Public Transit Network. Live corridor tracking and ticketing active.
        </p>
      </div>

      {/* Dynamic Summary Cards: 1 col on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
        {/* Active Buses Card */}
        <div
          onClick={() => onTabChange && onTabChange('tracking')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Fleet
            </span>
            <span className="text-xl">🚌</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {activeBusesCount} Buses
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live telemetry synced with Control Center</span>
            </div>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div
          onClick={() => onTabChange && onTabChange('profile')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              DEX Wallet
            </span>
            <span className="text-xl">👛</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#2D89EF] font-mono">
              ₹{walletBal.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Instant digital ticket debit enabled
            </div>
          </div>
        </div>

        {/* Pink Pass Scheme Card */}
        <div
          onClick={() => onTabChange && onTabChange('ticket')}
          className="bg-gradient-to-br from-pink-50 to-pink-100/70 rounded-2xl p-4 sm:p-5 border border-pink-200/80 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between sm:col-span-2 lg:col-span-1"
        >
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[11px] font-bold text-pink-800 uppercase tracking-wider">
              Delhi Scheme
            </span>
            <span className="text-xl">🌸</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-pink-700">
              Zero-Fare Pass
            </div>
            <div className="text-xs text-pink-800 font-semibold mt-1">
              Free bus travel for women commuters
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-3.5">
          Transit Shortcuts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('ticket')}
            className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer text-left active:scale-[0.98]"
          >
            <div className="text-2xl mb-1.5">🎫</div>
            <div className="font-bold text-xs sm:text-sm text-slate-900">Book Digital Ticket</div>
            <div className="text-[11px] text-slate-500 mt-0.5">QR pass & instant validation</div>
          </button>

          <button
            type="button"
            onClick={() => onTabChange && onTabChange('tracking')}
            className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer text-left active:scale-[0.98]"
          >
            <div className="text-2xl mb-1.5">📡</div>
            <div className="font-bold text-xs sm:text-sm text-slate-900">Live Bus Radar</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Real-time GPS arrivals</div>
          </button>

          <button
            type="button"
            onClick={() => onTabChange && onTabChange('plan')}
            className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer text-left active:scale-[0.98]"
          >
            <div className="text-2xl mb-1.5">🗺️</div>
            <div className="font-bold text-xs sm:text-sm text-slate-900">Route Planner</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Corridor maps & diversions</div>
          </button>
        </div>
      </div>

      {/* Latest Boarding Pass / Ticket Summary */}
      {recentTicket && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="size-11 sm:size-12 rounded-xl bg-blue-50 text-[#2D89EF] border border-blue-200/60 flex items-center justify-center font-black font-mono text-sm sm:text-base shrink-0">
              {recentTicket.route}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-[#2D89EF] tracking-wider uppercase">
                LATEST TICKET
              </div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 truncate mt-0.5">
                {recentTicket.from} → {recentTicket.to}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {recentTicket.date} · Paid ₹{recentTicket.fare}.00
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onTabChange && onTabChange('mytickets')}
            className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs sm:text-sm font-semibold text-slate-800 transition cursor-pointer active:scale-95 text-center shrink-0"
          >
            Open Ticket Pass →
          </button>
        </div>
      )}
    </div>
  )
}