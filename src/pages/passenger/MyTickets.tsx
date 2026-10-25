import { useState, useEffect } from 'react'

export type TicketStatus = 'active' | 'used' | 'cancelled'
export type Filter = 'all' | TicketStatus

export interface TicketItem {
  id: string
  route: string
  from: string
  to: string
  date: string
  fare: number
  status: TicketStatus
  color: string
}

const initialTickets: TicketItem[] = [
  { id: 'ET-88214', route: '764', from: 'Dwarka Sec-21', to: 'Connaught Place', date: 'Today, 08:30 AM', fare: 30, status: 'active', color: '#10B981' },
  { id: 'ET-77321', route: '302', from: 'Kashmere Gate', to: 'Dilshad Garden', date: 'Yesterday', fare: 25, status: 'used', color: '#94A3B8' },
  { id: 'ET-65498', route: '411', from: 'Nehru Place', to: 'Dwarka Sec-21', date: '10 Oct 2026', fare: 40, status: 'used', color: '#94A3B8' },
  { id: 'ET-54221', route: '118', from: 'Mahipalpur', to: 'Airport T3', date: '08 Oct 2026', fare: 55, status: 'cancelled', color: '#EF4444' },
  { id: 'ET-43009', route: '764', from: 'Dwarka Sec-21', to: 'Dhaula Kuan', date: '06 Oct 2026', fare: 20, status: 'used', color: '#94A3B8' },
]

export default function MyTickets() {
  const getCurrentUser = () => {
    try {
      const raw = localStorage.getItem('currentUser')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const currentUser = getCurrentUser()
  const userTicketKey = currentUser?.id ? `tickets_${currentUser.id}` : 'passenger_booked_tickets'

  const [ticketList, setTicketList] = useState<TicketItem[]>(() => {
    try {
      const savedUser = localStorage.getItem(userTicketKey)
      if (savedUser && JSON.parse(savedUser).length > 0) {
        return JSON.parse(savedUser)
      }

      const savedGlobal = localStorage.getItem('passenger_booked_tickets')
      if (savedGlobal && JSON.parse(savedGlobal).length > 0) {
        return JSON.parse(savedGlobal)
      }

      if (currentUser?.email === 'priya@example.com') {
        return initialTickets
      }

      return []
    } catch {
      return []
    }
  })

  const [filter, setFilter] = useState<Filter>('all')
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(userTicketKey, JSON.stringify(ticketList))
      localStorage.setItem('passenger_booked_tickets', JSON.stringify(ticketList))
    } catch (e) {
      console.error(e)
    }
  }, [ticketList, userTicketKey])

  const filtered = filter === 'all' ? ticketList : ticketList.filter(t => t.status === filter)

  const handleCancelTicket = (id: string) => {
    setTicketList(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'cancelled' as TicketStatus, color: '#EF4444' } : t))
    )
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status: 'cancelled', color: '#EF4444' })
    }
    setFeedback(`Ticket ${id} has been cancelled. Refund will be credited within 24 hours.`)
    setTimeout(() => setFeedback(null), 3500)
  }

  return (
    <div className="w-full max-w-3xl space-y-5 sm:space-y-6 text-slate-800 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Tickets
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          All your journey transit passes — active, used, and cancelled
        </p>
      </div>

      {/* Cancellation & Action Feedback Banner */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto no-scrollbar w-full sm:w-fit">
        {(['all', 'active', 'used', 'cancelled'] as Filter[]).map(f => {
          const count = f === 'all' ? ticketList.length : ticketList.filter(t => t.status === f).length
          const isActive = filter === f

          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="capitalize">{f}</span> ({count})
            </button>
          )
        })}
      </div>

      {/* Ticket List Cards */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border-2 border-dashed border-slate-200 text-slate-400">
            <div className="text-3xl sm:text-4xl mb-2">🎫</div>
            <div className="text-sm sm:text-base font-bold text-slate-700 mb-1">
              {ticketList.length === 0 ? 'No Journey Tickets Yet' : `No ${filter} tickets found`}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              {ticketList.length === 0
                ? 'Your booked tickets and Pink Passes will show up here.'
                : `No ${filter} tickets are present in your account.`}
            </p>
          </div>
        ) : (
          filtered.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer overflow-hidden flex flex-row"
            >
              {/* Left Accent Bar */}
              <div
                className="w-1.5 shrink-0"
                style={{ backgroundColor: ticket.color }}
              />

              <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                {/* Route identification & Details */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className="size-11 sm:size-13 rounded-2xl flex items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 border"
                    style={{
                      backgroundColor: `${ticket.color}15`,
                      borderColor: `${ticket.color}30`,
                      color: ticket.color,
                    }}
                  >
                    {ticket.route}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-sm sm:text-base text-slate-900 truncate">
                        {ticket.from} → {ticket.to}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0"
                        style={{
                          backgroundColor:
                            ticket.status === 'active'
                              ? 'rgba(16,185,129,0.12)'
                              : ticket.status === 'cancelled'
                              ? 'rgba(239,68,68,0.12)'
                              : 'rgba(148,163,184,0.15)',
                          color:
                            ticket.status === 'active'
                              ? '#10B981'
                              : ticket.status === 'cancelled'
                              ? '#EF4444'
                              : '#64748B',
                        }}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3.5 text-xs text-slate-500 flex-wrap">
                      <span className="font-mono text-[11px]">📋 {ticket.id}</span>
                      <span>📅 {ticket.date}</span>
                      <span>🚌 DEX {ticket.route}</span>
                    </div>
                  </div>
                </div>

                {/* Fare & Miniature QR for Active passes */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100 shrink-0">
                  <div className="font-black text-lg sm:text-xl text-slate-900 font-mono">
                    ₹{ticket.fare}
                  </div>

                  {ticket.status === 'active' && (
                    <div className="bg-slate-900 p-1.5 rounded-lg shadow-xs mt-0.5" title="Click to view full boarding QR">
                      <div
                        className="size-7 sm:size-8 rounded-xs"
                        style={{
                          background: `repeating-linear-gradient(0deg, white 0px, white 2px, transparent 2px, transparent 4px), repeating-linear-gradient(90deg, white 0px, white 2px, transparent 2px, transparent 4px)`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Digital Boarding Pass & QR Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex justify-between items-start gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#2D89EF] tracking-wider uppercase">
                  DEX-DELHIEXPRESS BOARDING PASS
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  Ticket {selectedTicket.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm transition cursor-pointer"
                aria-label="Close pass dialog"
              >
                ✕
              </button>
            </div>

            {/* Cryptographic QR Presentation Block */}
            <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 text-center border-2 border-dashed border-slate-200 mb-5">
              <div className="bg-slate-950 rounded-xl p-3 inline-block shadow-md mb-2.5">
                <div
                  className="size-32 sm:size-36 rounded-xs mx-auto"
                  style={{
                    background: `repeating-linear-gradient(0deg, white 0px, white 4px, transparent 4px, transparent 8px), repeating-linear-gradient(90deg, white 0px, white 4px, transparent 4px, transparent 8px)`,
                  }}
                />
              </div>
              <div className="text-xs font-bold text-slate-700">Scan at Smart Shelter or Bus Validator</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Secure cryptographic offline transit token</div>
            </div>

            {/* Ticket Key-Value Specs */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  ROUTE
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-900">
                  DEX {selectedTicket.route}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  FARE PAID
                </div>
                <div className="font-bold text-xs sm:text-sm text-emerald-600 font-mono">
                  ₹{selectedTicket.fare}.00
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  FROM
                </div>
                <div className="font-semibold text-xs text-slate-900 truncate">
                  {selectedTicket.from}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  TO
                </div>
                <div className="font-semibold text-xs text-slate-900 truncate">
                  {selectedTicket.to}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              {selectedTicket.status === 'active' && (
                <button
                  type="button"
                  onClick={() => handleCancelTicket(selectedTicket.id)}
                  className="flex-1 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition cursor-pointer active:scale-95"
                >
                  Cancel Ticket
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] hover:to-[#227beb] text-white text-xs font-bold transition cursor-pointer shadow-md active:scale-95 text-center"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}