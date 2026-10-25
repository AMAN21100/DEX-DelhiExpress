import { useState, useEffect } from 'react'

interface Props {
  onTabChange?: (tab: any) => void
}

export interface TransitRoute {
  id: string
  name: string
  from: string
  to: string
  baseFare: number
  color: string
  stops: string[]
  status?: string
}

const FALLBACK_ROUTES: TransitRoute[] = [
  { id: '764', name: 'Route 764: Dwarka Sec-21 ↔ Connaught Place', from: 'Dwarka Sec-21', to: 'Connaught Place', baseFare: 30, color: '#10B981', stops: ['Dwarka Sec-21', 'Janakpuri West', 'Dhaula Kuan', 'RML Hospital', 'Connaught Place'] },
  { id: '302', name: 'Route 302: Dilshad Garden ↔ Kashmere Gate', from: 'Dilshad Garden', to: 'Kashmere Gate ISBT', baseFare: 25, color: '#2D89EF', stops: ['Dilshad Garden', 'Mansarovar Park', 'Shahdara', 'Kashmere Gate ISBT'] },
  { id: '411', name: 'Route 411: Nehru Place ↔ Dwarka Sec-21 (Diverted)', from: 'Nehru Place', to: 'Dwarka Sec-21', baseFare: 40, color: '#F59E0B', stops: ['Nehru Place', 'Govindpuri', 'Saket', 'IIT Delhi', 'Dwarka Sec-21'] },
  { id: '118', name: 'Route 118: Airport T3 ↔ Mahipalpur', from: 'Mahipalpur', to: 'Airport T3', baseFare: 55, color: '#8B5CF6', stops: ['Mahipalpur', 'Aerocity', 'Airport T3'] },
  { id: '550', name: 'Route 550: Noida Sec 18 ↔ Connaught Place', from: 'Noida Sec 18', to: 'Connaught Place', baseFare: 35, color: '#EC4899', stops: ['Noida Sec 18', 'Akshardham', 'Mandi House', 'Connaught Place'] },
]

export default function TicketBooking({ onTabChange }: Props) {
  const [routes, setRoutes] = useState<TransitRoute[]>(() => {
    try {
      const saved = localStorage.getItem('dex_routes')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      return FALLBACK_ROUTES
    } catch {
      return FALLBACK_ROUTES
    }
  })

  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '764')
  const [fromStop, setFromStop] = useState('')
  const [toStop, setToStop] = useState('')
  const [passengerCount, setPassengerCount] = useState(1)
  const [isPinkPass, setIsPinkPass] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi' | 'cash'>('wallet')
  const [walletBalance, setWalletBalance] = useState<number>(10)
  const [errorMsg, setErrorMsg] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState<any>(null)

  useEffect(() => {
    const syncRoutes = () => {
      try {
        const saved = localStorage.getItem('dex_routes')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRoutes(parsed)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }

    window.addEventListener('storage', syncRoutes)
    const interval = setInterval(syncRoutes, 3000)
    return () => {
      window.removeEventListener('storage', syncRoutes)
      clearInterval(interval)
    }
  }, [])

  const currentRoute = routes.find(r => r.id === selectedRouteId) || routes[0] || FALLBACK_ROUTES[0]

  useEffect(() => {
    if (currentRoute && currentRoute.stops && currentRoute.stops.length > 0) {
      setFromStop(currentRoute.stops[0])
      setToStop(currentRoute.stops[currentRoute.stops.length - 1])
    }
  }, [selectedRouteId, routes])

  useEffect(() => {
    try {
      const savedBal = localStorage.getItem('passenger_wallet_balance')
      if (savedBal) setWalletBalance(parseFloat(savedBal))
    } catch {
      setWalletBalance(10)
    }
  }, [])

  const farePerPassenger = isPinkPass ? 0 : currentRoute.baseFare
  const totalFare = farePerPassenger * passengerCount

  const handleBookTicket = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (fromStop === toStop) {
      setErrorMsg('Boarding and destination stops cannot be the same.')
      return
    }

    if (paymentMethod === 'wallet' && !isPinkPass && walletBalance < totalFare) {
      setErrorMsg(`Insufficient wallet balance (₹${walletBalance.toFixed(2)}). Please select UPI or recharge your DEX wallet.`)
      return
    }

    let currentUser: any = null
    try {
      const userRaw = localStorage.getItem('currentUser')
      if (userRaw) currentUser = JSON.parse(userRaw)
    } catch {
      currentUser = null
    }

    const userTicketKey = currentUser?.id ? `tickets_${currentUser.id}` : 'passenger_booked_tickets'
    const generatedId = `ET-${Math.floor(10000 + Math.random() * 90000)}`

    const newTicket = {
      id: generatedId,
      route: currentRoute.id,
      from: fromStop,
      to: toStop,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fare: totalFare,
      status: 'active',
      color: isPinkPass ? '#EC4899' : currentRoute.color,
    }

    try {
      const existingUserTickets = JSON.parse(localStorage.getItem(userTicketKey) || '[]')
      localStorage.setItem(userTicketKey, JSON.stringify([newTicket, ...existingUserTickets]))

      const existingGlobal = JSON.parse(localStorage.getItem('passenger_booked_tickets') || '[]')
      localStorage.setItem('passenger_booked_tickets', JSON.stringify([newTicket, ...existingGlobal]))

      if (paymentMethod === 'wallet' && !isPinkPass) {
        const newBal = (walletBalance - totalFare).toFixed(2)
        localStorage.setItem('passenger_wallet_balance', newBal)
        setWalletBalance(parseFloat(newBal))
      }

      setBookingSuccess(newTicket)
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to process booking.')
    }
  }

  return (
    <div className="w-full max-w-3xl space-y-5 sm:space-y-6 text-slate-800 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Book Digital Ticket
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Generate instant contactless QR tickets and Delhi State zero-fare Pink Passes
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {/* Main Booking Form Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleBookTicket} className="space-y-5">
          {/* Corridor Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Select Transit Corridor ({routes.length} Available)
            </label>
            <select
              value={selectedRouteId}
              onChange={e => setSelectedRouteId(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 font-semibold outline-none focus:border-[#2D89EF] transition cursor-pointer"
            >
              {routes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.name} (₹{route.baseFare}) {route.status === 'Diverted' ? '⚠️ [Diverted]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Stops Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Boarding Stop (From)
              </label>
              <select
                value={fromStop}
                onChange={e => setFromStop(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 font-medium outline-none focus:border-[#2D89EF] transition cursor-pointer"
              >
                {currentRoute?.stops?.map(stop => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Destination Stop (To)
              </label>
              <select
                value={toStop}
                onChange={e => setToStop(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 font-medium outline-none focus:border-[#2D89EF] transition cursor-pointer"
              >
                {currentRoute?.stops?.map(stop => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Passenger Count & Pink Pass Option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Number of Passengers
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={passengerCount}
                onChange={e => setPassengerCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold font-mono text-slate-900 outline-none focus:border-[#2D89EF] transition"
              />
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-pink-50 border border-pink-200/80">
              <input
                type="checkbox"
                id="pinkPassCheck"
                checked={isPinkPass}
                onChange={e => setIsPinkPass(e.target.checked)}
                className="size-4.5 accent-pink-600 cursor-pointer rounded"
              />
              <label htmlFor="pinkPassCheck" className="text-xs sm:text-[13px] font-bold text-pink-900 cursor-pointer select-none">
                🌸 Women's Zero-Fare Pink Pass
              </label>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Payment Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3.5 rounded-2xl border transition cursor-pointer text-center flex flex-col items-center justify-center ${
                  paymentMethod === 'wallet'
                    ? 'border-[#2D89EF] bg-blue-50/70 shadow-xs ring-1 ring-[#2D89EF]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-xl mb-1">👛</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">DEX Wallet</span>
                <span className="text-[11px] text-[#2D89EF] font-semibold mt-0.5 font-mono">
                  Bal: ₹{walletBalance.toFixed(2)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3.5 rounded-2xl border transition cursor-pointer text-center flex flex-col items-center justify-center ${
                  paymentMethod === 'upi'
                    ? 'border-[#2D89EF] bg-blue-50/70 shadow-xs ring-1 ring-[#2D89EF]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-xl mb-1">📱</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">UPI / QR</span>
                <span className="text-[11px] text-slate-500 mt-0.5">GPay / PhonePe / Paytm</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3.5 rounded-2xl border transition cursor-pointer text-center flex flex-col items-center justify-center ${
                  paymentMethod === 'cash'
                    ? 'border-[#2D89EF] bg-blue-50/70 shadow-xs ring-1 ring-[#2D89EF]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-xl mb-1">💵</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">Conductor Cash</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Pay physical on board</span>
              </button>
            </div>
          </div>

          {/* Fare Summary & Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Amount Due
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                isPinkPass ? 'text-pink-600' : 'text-slate-900'
              }`}>
                {isPinkPass ? 'FREE (₹0.00)' : `₹${totalFare}.00`}
              </div>
            </div>

            <button
              type="submit"
              className={`w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition cursor-pointer active:scale-95 text-center ${
                isPinkPass
                  ? 'bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 shadow-pink-500/20'
                  : 'bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] hover:to-[#227beb] shadow-blue-500/20'
              }`}
            >
              {isPinkPass ? '🌸 Generate Free Pink Pass' : `Pay ₹${totalFare}.00 & Book`}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-sm text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3.5">
              ✓
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
              Booking Confirmed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
              Ticket <strong className="font-mono text-slate-800">{bookingSuccess.id}</strong> has been generated and added directly to your account.
            </p>

            <button
              type="button"
              onClick={() => {
                setBookingSuccess(null)
                if (onTabChange) onTabChange('mytickets')
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md active:scale-95"
            >
              View in My Tickets →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}