import { useState } from 'react'
import type { PassengerTab } from './PassengerLayout'

interface Props {
  onTabChange: (tab: PassengerTab) => void
}

interface PlannedRoute {
  id: number
  number: string
  from: string
  to: string
  time: string
  transfers: number
  crowd: number
  eta: string
  fare: number
  aiRecommended: boolean
  stopsList: string[]
}

const stops = [
  'Dwarka Sector 21', 'Dwarka Sector 12', 'Dwarka Sector 9', 'Dwarka Sector 6',
  'Palam', 'Mahipalpur', 'Dhaula Kuan', 'Moti Bagh', 'Connaught Place',
  'Kashmere Gate', 'Dilshad Garden', 'Nehru Place', 'Airport T3', 'Noida Sector 18',
]

export default function JourneyPlanner({ onTabChange }: Props) {
  const [source, setSource] = useState('Dwarka Sector 21')
  const [destination, setDestination] = useState('Connaught Place')

  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [time, setTime] = useState('08:30')
  const [searched, setSearched] = useState(true)
  const [selectedRoute, setSelectedRoute] = useState<number | null>(1)

  const generateRoutes = (): PlannedRoute[] => {
    return [
      {
        id: 1,
        number: '764 Express',
        from: source,
        to: destination,
        time: '52 min',
        transfers: 0,
        crowd: 67,
        eta: '09:22 AM',
        fare: 30,
        aiRecommended: true,
        stopsList: [source, 'Palam', 'Dhaula Kuan', 'Moti Bagh', destination],
      },
      {
        id: 2,
        number: '302 → 118',
        from: source,
        to: destination,
        time: '1h 10m',
        transfers: 1,
        crowd: 34,
        eta: '09:40 AM',
        fare: 45,
        aiRecommended: false,
        stopsList: [source, 'Dwarka Sector 9', 'Mahipalpur (Transfer)', destination],
      },
      {
        id: 3,
        number: '411 Direct',
        from: source,
        to: destination,
        time: '1h 25m',
        transfers: 0,
        crowd: 88,
        eta: '09:55 AM',
        fare: 25,
        aiRecommended: false,
        stopsList: [source, 'Dwarka Sector 6', 'Nehru Place', destination],
      },
    ]
  }

  const [routeResults, setRouteResults] = useState<PlannedRoute[]>(generateRoutes)

  const handleSearch = () => {
    setSearched(true)
    setRouteResults(generateRoutes())
    setSelectedRoute(1)
  }

  const handleBookRoute = (route: PlannedRoute) => {
    const bookingIntent = {
      from: route.from,
      to: route.to,
      busNumber: route.number,
      fare: route.fare,
      date,
      time,
    }
    localStorage.setItem('pending_ticket_booking', JSON.stringify(bookingIntent))
    onTabChange('ticket')
  }

  return (
    <div className="w-full max-w-4xl space-y-6 text-slate-800 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Plan Your Journey
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          AI-powered route planning with real-time crowd and ETA predictions
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              📍 Origin Stop
            </label>
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 font-medium outline-none focus:border-[#2D89EF] transition cursor-pointer"
            >
              {stops.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              🎯 Destination
            </label>
            <select
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 font-medium outline-none focus:border-[#2D89EF] transition cursor-pointer"
            >
              {stops.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              📅 Journey Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 font-medium outline-none focus:border-[#2D89EF] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              ⏰ Departure Time
            </label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 font-medium outline-none focus:border-[#2D89EF] transition"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] hover:to-[#227beb] text-white font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(45,137,239,0.3)] transition cursor-pointer active:scale-95"
        >
          🔍 Find Routes
        </button>
      </div>

      {/* Route Results Feed */}
      {searched && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {routeResults.length} Routes Found
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#8B5CF6] text-xs font-semibold self-start sm:self-auto">
              <span>🧠</span>
              <span>AI recommendations active</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {routeResults.map(route => {
              const isSelected = selectedRoute === route.id

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(isSelected ? null : route.id)}
                  className={`bg-white rounded-2xl border transition cursor-pointer overflow-hidden shadow-xs ${
                    isSelected
                      ? 'border-[#2D89EF] shadow-[0_8px_32px_rgba(45,137,239,0.12)] ring-1 ring-[#2D89EF]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    {/* Route identification */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-12 sm:size-14 rounded-2xl flex items-center justify-center text-white font-black text-xs sm:text-sm text-center shrink-0 shadow-xs px-1 ${
                          route.aiRecommended
                            ? 'bg-gradient-to-br from-[#8B5CF6] to-[#6d3fd4]'
                            : 'bg-gradient-to-br from-[#2D89EF] to-[#1a6fd4]'
                        }`}
                      >
                        {route.number}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-sm sm:text-base text-slate-900">
                            {route.from} → {route.to}
                          </span>
                          {route.aiRecommended && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-500/15 text-[#8B5CF6] border border-purple-500/30">
                              🧠 AI PICK
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-slate-500">
                          <span className="flex items-center gap-1">⏱️ {route.time}</span>
                          <span className="flex items-center gap-1">
                            🔄 {route.transfers} transfer{route.transfers !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">🕐 Arrives {route.eta}</span>
                        </div>
                      </div>
                    </div>

                    {/* Crowd meter & Fare */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100 shrink-0">
                      <div className="font-black text-lg sm:text-xl text-slate-900 font-mono">
                        ₹{route.fare}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${route.crowd}%`,
                              backgroundColor: route.crowd > 80 ? '#EF4444' : route.crowd > 60 ? '#F59E0B' : '#10B981',
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-bold font-mono"
                          style={{
                            color: route.crowd > 80 ? '#EF4444' : route.crowd > 60 ? '#F59E0B' : '#10B981',
                          }}
                        >
                          {route.crowd}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Route Details */}
                  {isSelected && (
                    <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 space-y-4">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Corridor Timeline & Stops
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1">
                          {route.stopsList.map((stop, i, arr) => {
                            const isEndpoint = i === 0 || i === arr.length - 1
                            return (
                              <div key={stop} className="flex items-center shrink-0">
                                <div className="flex flex-col items-center">
                                  <span
                                    className={`size-2.5 rounded-full border-2 border-white shadow-xs ${
                                      isEndpoint ? 'bg-[#2D89EF] ring-2 ring-[#2D89EF]/30' : 'bg-slate-300'
                                    }`}
                                  />
                                  <span
                                    className={`text-[10px] mt-1.5 whitespace-nowrap ${
                                      isEndpoint ? 'font-bold text-slate-800' : 'text-slate-500'
                                    }`}
                                  >
                                    {stop}
                                  </span>
                                </div>
                                {i < arr.length - 1 && (
                                  <span className="w-6 sm:w-10 h-0.5 bg-slate-200 mb-4 shrink-0 mx-1" />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookRoute(route)
                          }}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] hover:to-[#227beb] text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95 text-center"
                        >
                          🎫 Book This Route — ₹{route.fare}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}