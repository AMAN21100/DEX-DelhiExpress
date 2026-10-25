import { useState, useEffect } from 'react'

export interface TransitRoute {
  id: string
  name: string
  from: string
  to: string
  baseFare: number
  color: string
  stops: string[]
  status: 'Normal' | 'Diverted' | 'Congested'
  divertedStops?: string[]
}

export const DEFAULT_ROUTES: TransitRoute[] = [
  {
    id: '764',
    name: 'Route 764: Dwarka Sec-21 ↔ Connaught Place',
    from: 'Dwarka Sec-21',
    to: 'Connaught Place',
    baseFare: 30,
    color: '#10B981',
    status: 'Normal',
    stops: ['Dwarka Sec-21', 'Janakpuri West', 'Dhaula Kuan', 'RML Hospital', 'Connaught Place'],
  },
  {
    id: '302',
    name: 'Route 302: Dilshad Garden ↔ Kashmere Gate',
    from: 'Dilshad Garden',
    to: 'Kashmere Gate ISBT',
    baseFare: 25,
    color: '#2D89EF',
    status: 'Normal',
    stops: ['Dilshad Garden', 'Mansarovar Park', 'Shahdara', 'Kashmere Gate ISBT'],
  },
  {
    id: '411',
    name: 'Route 411: Nehru Place ↔ Dwarka Sec-21',
    from: 'Nehru Place',
    to: 'Dwarka Sec-21',
    baseFare: 40,
    color: '#F59E0B',
    status: 'Diverted',
    stops: ['Nehru Place', 'Govindpuri', 'Saket', 'IIT Delhi', 'Dwarka Sec-21'],
  },
  {
    id: '118',
    name: 'Route 118: Airport T3 ↔ Mahipalpur',
    from: 'Mahipalpur',
    to: 'Airport T3',
    baseFare: 55,
    color: '#8B5CF6',
    status: 'Normal',
    stops: ['Mahipalpur', 'Aerocity', 'Airport T3'],
  },
  {
    id: '550',
    name: 'Route 550: Noida Sec 18 ↔ Connaught Place',
    from: 'Noida Sec 18',
    to: 'Connaught Place',
    baseFare: 35,
    color: '#EC4899',
    status: 'Normal',
    stops: ['Noida Sec 18', 'Akshardham', 'Mandi House', 'Connaught Place'],
  },
]

export default function RouteManagement() {
  const [routes, setRoutes] = useState<TransitRoute[]>(() => {
    try {
      const saved = localStorage.getItem('dex_routes')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      return DEFAULT_ROUTES
    } catch {
      return DEFAULT_ROUTES
    }
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')

  // New Route Form State
  const [routeId, setRouteId] = useState('')
  const [fromStop, setFromStop] = useState('')
  const [toStop, setToStop] = useState('')
  const [stopsInput, setStopsInput] = useState('')
  const [fare, setFare] = useState(30)
  const [color, setColor] = useState('#2D89EF')

  // Save changes to shared localStorage key and broadcast event
  useEffect(() => {
    localStorage.setItem('dex_routes', JSON.stringify(routes))
    window.dispatchEvent(new Event('storage'))
  }, [routes])

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault()
    if (!routeId.trim() || !fromStop.trim() || !toStop.trim()) return

    const parsedStops = stopsInput.trim()
      ? stopsInput.split(',').map(s => s.trim()).filter(Boolean)
      : [fromStop.trim(), toStop.trim()]

    if (!parsedStops.includes(fromStop.trim())) parsedStops.unshift(fromStop.trim())
    if (!parsedStops.includes(toStop.trim())) parsedStops.push(toStop.trim())

    const newRoute: TransitRoute = {
      id: routeId.trim().toUpperCase(),
      name: `Route ${routeId.trim().toUpperCase()}: ${fromStop.trim()} ↔ ${toStop.trim()}`,
      from: fromStop.trim(),
      to: toStop.trim(),
      baseFare: Number(fare) || 30,
      color: color,
      status: 'Normal',
      stops: parsedStops,
    }

    setRoutes(prev => [newRoute, ...prev])
    setShowAddModal(false)

    setRouteId('')
    setFromStop('')
    setToStop('')
    setStopsInput('')
    setFare(30)
  }

  const handleToggleStatus = (id: string) => {
    setRoutes(prev =>
      prev.map(r => {
        if (r.id === id) {
          const nextStatus = r.status === 'Normal' ? 'Diverted' : r.status === 'Diverted' ? 'Congested' : 'Normal'
          return { ...r, status: nextStatus }
        }
        return r
      })
    )
  }

  const handleDeleteRoute = (id: string) => {
    if (confirm(`Are you sure you want to delete Corridor Route ${id}?`)) {
      setRoutes(prev => prev.filter(r => r.id !== id))
    }
  }

  const filtered = routes.filter(
    r =>
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.from.toLowerCase().includes(search.toLowerCase()) ||
      r.to.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full space-y-6 text-zinc-100 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Corridor & Route Network
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            {routes.length} active corridors · Changes instantly sync to Passenger Booking & Radar
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] hover:to-[#227beb] text-white text-xs font-bold shadow-[0_4px_14px_rgba(45,137,239,0.3)] transition cursor-pointer active:scale-95"
        >
          <span>+ Add New Route</span>
        </button>
      </div>

      {/* Search Input */}
      <div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search route number, corridor name, origin or destination..."
          className="w-full sm:max-w-md px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-[#2D89EF] transition"
        />
      </div>

      {/* Routes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(route => (
          <div
            key={route.id}
            className="bg-white/3 border border-white/8 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/15 transition shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="px-2.5 py-1 rounded-lg font-extrabold text-xs sm:text-sm font-mono shrink-0 border"
                    style={{
                      backgroundColor: `${route.color}20`,
                      color: route.color,
                      borderColor: `${route.color}40`,
                    }}
                  >
                    {route.id}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-white truncate">
                    {route.from} ↔ {route.to}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(route.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 transition cursor-pointer border ${
                    route.status === 'Normal'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : route.status === 'Diverted'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  ● {route.status}
                </button>
              </div>

              <div className="text-xs text-zinc-400 mb-2.5 flex items-center gap-2">
                <span>Base Fare: <strong className="text-emerald-400 font-mono">₹{route.baseFare}.00</strong></span>
                <span className="text-zinc-600">•</span>
                <span>{route.stops.length} Corridor Stops</span>
              </div>

              {/* Stops list strip */}
              <div className="bg-white/2 border border-white/5 rounded-xl px-3 py-2 text-[11px] text-zinc-300 mb-4 truncate font-medium">
                🚏 {route.stops.join(' → ')}
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => handleDeleteRoute(route.id)}
                className="px-3 py-1.5 rounded-lg border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold transition cursor-pointer active:scale-95"
              >
                Remove Corridor
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1628] border border-white/12 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-4">Create New Transit Route</h3>
            <form onSubmit={handleAddRoute} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Route Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 901"
                    value={routeId}
                    onChange={e => setRouteId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-[#2D89EF] transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Base Fare (₹)</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={150}
                    value={fare}
                    onChange={e => setFare(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white outline-none focus:border-[#2D89EF] transition font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Starting Terminal</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kashmere Gate"
                    value={fromStop}
                    onChange={e => setFromStop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white outline-none focus:border-[#2D89EF] transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Ending Terminal</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AIIMS Terminal"
                    value={toStop}
                    onChange={e => setToStop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white outline-none focus:border-[#2D89EF] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Intermediate Stops (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Red Fort, ITO, Pragati Maidan, Lajpat Nagar"
                  value={stopsInput}
                  onChange={e => setStopsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-[#2D89EF] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Corridor Accent Color</label>
                <select
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/12 bg-[#0d1d36] text-xs sm:text-sm text-white outline-none focus:border-[#2D89EF] transition"
                >
                  <option value="#2D89EF">Blue Line (#2D89EF)</option>
                  <option value="#10B981">Green Line (#10B981)</option>
                  <option value="#8B5CF6">Purple Line (#8B5CF6)</option>
                  <option value="#EC4899">Pink Line (#EC4899)</option>
                  <option value="#F59E0B">Amber Line (#F59E0B)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] hover:to-[#227beb] text-white text-xs font-bold transition cursor-pointer shadow-md"
                >
                  Publish Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}