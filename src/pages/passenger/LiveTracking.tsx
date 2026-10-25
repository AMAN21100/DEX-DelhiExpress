import { useState, useEffect } from 'react'

export interface BusTracker {
  id: string
  busNumber?: string
  route?: string
  from?: string
  to?: string
  driver?: string
  status?: string
  occupancy?: number
  occ?: number
  nextStop?: string
  location?: string
  etaMinutes?: number
  speedKmH?: number
  speed?: number
  lat?: number
  lng?: number
  mapX?: number
  mapY?: number
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

const MAP_STOPS = [
  { id: 'dwarka', name: 'Dwarka Sec-21', x: 18, y: 72, hub: true },
  { id: 'dhaula', name: 'Dhaula Kuan', x: 42, y: 52, hub: false },
  { id: 'cp', name: 'Connaught Place', x: 55, y: 40, hub: true },
  { id: 'kg', name: 'Kashmere Gate ISBT', x: 60, y: 22, hub: true },
  { id: 'dilshad', name: 'Dilshad Garden', x: 84, y: 18, hub: false },
  { id: 'nehru', name: 'Nehru Place', x: 64, y: 75, hub: true },
  { id: 'airport', name: 'Airport T3', x: 26, y: 84, hub: true },
  { id: 'mahipalpur', name: 'Mahipalpur', x: 34, y: 76, hub: false },
]

const ROUTE_PATHS: Record<string, { points: string; color: string }> = {
  '764': { points: '18,72 42,52 55,40', color: '#10B981' },
  '302': { points: '60,22 72,20 84,18', color: '#2D89EF' },
  '411': { points: '64,75 52,65 42,52 18,72', color: '#F59E0B' },
  '118': { points: '34,76 30,80 26,84', color: '#8B5CF6' },
}

export default function LiveTracking() {
  const [buses, setBuses] = useState<BusTracker[]>([])
  const [routes, setRoutes] = useState<TransitRoute[]>([])
  const [selectedRoute, setSelectedRoute] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeBus, setActiveBus] = useState<BusTracker | null>(null)
  const [lastSynced, setLastSynced] = useState<string>('')
  const [mapZoom, setMapZoom] = useState<number>(1)

  const resolveBusCoords = (bus: any, index: number) => {
    if (bus.mapX && bus.mapY) return { x: bus.mapX, y: bus.mapY }
    if (bus.route === '764') return { x: 30 + ((index * 8) % 25), y: 62 - ((index * 6) % 20) }
    if (bus.route === '302') return { x: 65 + ((index * 7) % 18), y: 21 }
    if (bus.route === '411') return { x: 45 + ((index * 9) % 20), y: 64 }
    if (bus.route === '118') return { x: 31, y: 79 }
    return { x: 40 + ((index * 9) % 35), y: 40 + ((index * 8) % 30) }
  }

  const loadData = () => {
    try {
      const storedRoutes = localStorage.getItem('dex_routes')
      if (storedRoutes) {
        const parsedRoutes = JSON.parse(storedRoutes)
        if (Array.isArray(parsedRoutes)) setRoutes(parsedRoutes)
      }

      const storedFleet = localStorage.getItem('admin_fleet_buses')
      if (storedFleet) {
        const parsedFleet = JSON.parse(storedFleet)
        if (Array.isArray(parsedFleet) && parsedFleet.length > 0) {
          setBuses(parsedFleet)
          setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
          return
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
    const handleStorageChange = () => loadData()
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(loadData, 2000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const availableRouteCodes = ['all', ...Array.from(new Set(routes.map(r => r.id)))]

  const availableBuses = buses.filter(b => {
    const st = (b.status || '').toLowerCase()
    return st !== 'maintenance' && st !== 'depot'
  })

  const filteredBuses = availableBuses.filter(bus => {
    const busRoute = bus.route || ''
    const busNum = bus.busNumber || bus.id || ''
    const busStop = bus.nextStop || bus.location || ''
    const busTo = bus.to || ''
    const q = searchQuery.toLowerCase()

    const matchesRoute = selectedRoute === 'all' || busRoute === selectedRoute
    const matchesSearch =
      busNum.toLowerCase().includes(q) ||
      busRoute.toLowerCase().includes(q) ||
      busStop.toLowerCase().includes(q) ||
      busTo.toLowerCase().includes(q)

    return matchesRoute && matchesSearch
  })

  return (
    <div className="w-full max-w-6xl space-y-5 sm:space-y-6 text-slate-800 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Live Transit Radar & GPS Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamic Delhi corridor tracking synced with Control Center telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-semibold">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync: {lastSynced || 'Connecting…'}</span>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Dynamic Corridor Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 pb-1 md:pb-0">
          {availableRouteCodes.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRoute(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedRoute === r
                  ? 'bg-[#2D89EF] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {r === 'all' ? 'All Corridors' : `Route ${r}`}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search bus, stop, or destination…"
          className="w-full md:max-w-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#2D89EF] transition"
        />
      </div>

      {/* Visual Canvas Map */}
      <div className="relative bg-[#0B1329] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 shadow-xl h-[320px] sm:h-[400px]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(45,137,239,0.12) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Map Telemetry Header */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] sm:text-xs font-bold text-white tracking-wide">
            DELHI RADAR · {filteredBuses.length} ACTIVE BUSES
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMapZoom(prev => Math.min(prev + 0.15, 1.4))}
            className="size-7 sm:size-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setMapZoom(prev => Math.max(prev - 0.15, 0.85))}
            className="size-7 sm:size-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setMapZoom(1)}
            className="h-7 sm:h-8 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center text-[11px] font-semibold transition cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Map Canvas */}
        <div
          className="size-full transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${mapZoom})` }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full pointer-events-none">
            {Object.entries(ROUTE_PATHS).map(([rCode, rData]) => {
              const isSelected = selectedRoute === 'all' || selectedRoute === rCode
              return (
                <polyline
                  key={rCode}
                  points={rData.points}
                  fill="none"
                  stroke={rData.color}
                  strokeWidth={isSelected ? 1.5 : 0.5}
                  strokeOpacity={isSelected ? 0.9 : 0.25}
                  strokeDasharray={isSelected ? 'none' : '2 2'}
                />
              )
            })}

            {MAP_STOPS.map(stop => (
              <g key={stop.id} transform={`translate(${stop.x}, ${stop.y})`}>
                <circle r={stop.hub ? 1.8 : 1.2} fill="#1E293B" stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
                <circle r={stop.hub ? 1.0 : 0.6} fill={stop.hub ? '#2D89EF' : '#94A3B8'} />
              </g>
            ))}
          </svg>

          {MAP_STOPS.map(stop => (
            <div
              key={stop.id}
              className={`absolute -translate-x-1/2 translate-y-2 text-[9px] sm:text-[10px] whitespace-nowrap pointer-events-none select-none ${
                stop.hub ? 'text-white font-bold' : 'text-slate-400 font-medium'
              }`}
              style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
            >
              {stop.name}
            </div>
          ))}

          {/* Live Bus Markers */}
          {filteredBuses.map((bus, idx) => {
            const coords = resolveBusCoords(bus, idx)
            const isDelayed = (bus.status || '').toLowerCase() === 'delayed'
            const isSelected = activeBus?.id === bus.id
            const color = isDelayed ? '#F59E0B' : '#10B981'

            return (
              <div
                key={bus.id}
                onClick={() => setActiveBus(bus)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  zIndex: isSelected ? 30 : 20,
                }}
              >
                <div
                  className={`size-6 sm:size-7 rounded-full flex items-center justify-center text-xs shadow-md transition-colors ${
                    isSelected ? 'bg-white' : 'bg-slate-900'
                  }`}
                  style={{
                    border: `2px solid ${color}`,
                    boxShadow: `0 0 14px ${color}90`,
                  }}
                >
                  🚌
                </div>

                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-950/90 text-white text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.2 rounded border font-mono whitespace-nowrap shadow-xs"
                  style={{ borderColor: `${color}80` }}
                >
                  {bus.route || 'DEX'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Telemetry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredBuses.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-8 sm:p-12 text-center border-2 border-dashed border-slate-200">
            <div className="text-3xl sm:text-4xl mb-2">🚏</div>
            <div className="font-bold text-sm sm:text-base text-slate-800">No Active Buses On Route</div>
            <p className="text-xs text-slate-500 mt-1">
              No active buses currently operating on corridor {selectedRoute}.
            </p>
          </div>
        ) : (
          filteredBuses.map(bus => {
            const occupancy = bus.occupancy ?? bus.occ ?? 0
            const speed = bus.speedKmH ?? bus.speed ?? 0
            const isDelayed = (bus.status || '').toLowerCase() === 'delayed'
            const isSelected = activeBus?.id === bus.id

            return (
              <div
                key={bus.id}
                onClick={() => setActiveBus(bus)}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition cursor-pointer shadow-xs flex flex-col justify-between ${
                  isSelected ? 'border-[#2D89EF] ring-1 ring-[#2D89EF]' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#2D89EF]/10 text-[#2D89EF] font-black text-xs font-mono">
                        {bus.route || '—'}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {bus.busNumber || bus.id}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        !isDelayed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {!isDelayed ? '● ON ROUTE' : '⚠️ DELAYED'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mb-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Destination
                    </span>
                    <strong className="text-slate-900 text-sm">
                      {bus.to || bus.location || 'Connaught Place'}
                    </strong>
                  </div>

                  {/* 3-Column Metrics */}
                  <div className="bg-slate-50 rounded-xl p-2.5 grid grid-cols-3 gap-2 text-center mb-3.5 border border-slate-100">
                    <div>
                      <div className="text-[9px] font-bold uppercase text-slate-400">Next Stop</div>
                      <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                        {bus.nextStop || bus.location || 'En Route'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase text-slate-400">ETA</div>
                      <div className="text-xs font-black text-emerald-600 font-mono mt-0.5">
                        ~{bus.etaMinutes ?? 5} min
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase text-slate-400">Speed</div>
                      <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                        {speed} km/h
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Crowding */}
                <div>
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="text-slate-500 font-medium">Crowd Load</span>
                    <span
                      className="font-bold font-mono"
                      style={{ color: occupancy > 80 ? '#EF4444' : '#10B981' }}
                    >
                      {occupancy}% {occupancy > 80 ? '(Heavy)' : '(Seats Avail)'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${occupancy}%`,
                        backgroundColor: occupancy > 80 ? '#EF4444' : occupancy > 50 ? '#F59E0B' : '#10B981',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Selected Bus Modal Dialog */}
      {activeBus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex justify-between items-start gap-3 mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2D89EF]">
                  Live Bus Telemetry
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {activeBus.busNumber || activeBus.id} (Route {activeBus.route || '—'})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveBus(null)}
                className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm transition cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Driver
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {activeBus.driver || 'Assigned Staff'}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Next Station
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {activeBus.nextStop || activeBus.location || 'Central Corridor'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveBus(null)}
              className="w-full py-3 rounded-xl bg-[#2D89EF] hover:bg-[#2577d4] text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md active:scale-95"
            >
              Close Radar View
            </button>
          </div>
        </div>
      )}
    </div>
  )
}