import { useState, useEffect } from 'react'

interface StationDemand {
  station: string
  route: string
  ticketsRaised: number
  normalCapacity: number
  status: 'SURGE' | 'NORMAL' | 'UNDERUTILIZED'
  suggestedAction: string
  busAdjustment: number
}

export default function RouteDiversionManager() {
  const [demands, setDemands] = useState<StationDemand[]>([
    {
      station: 'Kashmere Gate ISBT',
      route: 'Route 764 (Terminal)',
      ticketsRaised: 482,
      normalCapacity: 300,
      status: 'SURGE',
      suggestedAction: 'Divert 3 EV buses from Route 302 to handle morning commuter surge.',
      busAdjustment: +3,
    },
    {
      station: 'Rajiv Chowk Metro Station',
      route: 'Route 411 (Central)',
      ticketsRaised: 610,
      normalCapacity: 350,
      status: 'SURGE',
      suggestedAction: 'Deploy express shuttle loop & reroute 2 buses from ring road.',
      busAdjustment: +4,
    },
    {
      station: 'Anand Vihar Terminal',
      route: 'Route 118 (East Delhi)',
      ticketsRaised: 390,
      normalCapacity: 280,
      status: 'SURGE',
      suggestedAction: 'Increase frequency by 40% using automated AI fleet re-dispatch.',
      busAdjustment: +2,
    },
    {
      station: 'Dwarka Sector 21',
      route: 'Route 522 (West Corridor)',
      ticketsRaised: 85,
      normalCapacity: 220,
      status: 'UNDERUTILIZED',
      suggestedAction: 'Reduce fleet count by 2 buses to conserve energy and reallocate.',
      busAdjustment: -2,
    },
  ])

  const [executingId, setExecutingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('dex_route_diversions')
    if (saved) {
      try {
        setDemands(JSON.parse(saved))
      } catch {
        // fallback to default
      }
    }
  }, [])

  const handleExecuteDiversion = (stationName: string) => {
    setExecutingId(stationName)
    setSuccessMessage('')

    setTimeout(() => {
      const updated = demands.map(d => {
        if (d.station === stationName) {
          return {
            ...d,
            status: 'NORMAL' as const,
            suggestedAction: 'AI Diversion Executed Successfully. Fleet Balanced.',
            busAdjustment: 0,
          }
        }
        return d
      })

      setDemands(updated)
      localStorage.setItem('dex_route_diversions', JSON.stringify(updated))
      setExecutingId(null)
      setSuccessMessage(`Successfully applied AI fleet reallocation for ${stationName}!`)

      setTimeout(() => setSuccessMessage(''), 4000)
    }, 800)
  }

  const handleAutoPilotAll = () => {
    setExecutingId('ALL')
    setSuccessMessage('')

    setTimeout(() => {
      const updated = demands.map(d => ({
        ...d,
        status: 'NORMAL' as const,
        suggestedAction: 'AI Auto-Pilot Active: Fleet harmonized across Delhi NCR.',
        busAdjustment: 0,
      }))

      setDemands(updated)
      localStorage.setItem('dex_route_diversions', JSON.stringify(updated))
      setExecutingId(null)
      setSuccessMessage('AI Auto-Pilot successfully harmonized all transit corridors!')

      setTimeout(() => setSuccessMessage(''), 4000)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-5 sm:p-7 border border-blue-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,137,239,0.15),transparent_50%)] pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              AI DIVERSION & FLEET OPTIMIZER
            </div>
            <h2 className="font-['Poppins'] font-bold text-xl sm:text-2xl text-white">
              Smart Route Diversion & Ticket Load Control
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time ticket raise counts across Delhi NCR stations trigger autonomous AI fleet rerouting and reduce bus allocation on underutilized corridors.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAutoPilotAll}
            disabled={executingId !== null}
            className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-['Poppins'] font-bold text-xs sm:text-sm shadow-lg transition cursor-pointer active:scale-95 shrink-0 disabled:opacity-50"
          >
            {executingId === 'ALL' ? 'Optimizing Fleet…' : '⚡ AI Auto-Pilot Harmonize All'}
          </button>
        </div>
      </div>

      {/* Success Feedback */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Demand & Diversion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {demands.map((item, index) => {
          const isSurge = item.status === 'SURGE'
          const isExecuting = executingId === item.station

          return (
            <div
              key={index}
              className={`rounded-2xl p-5 sm:p-6 border transition-all shadow-md bg-slate-900/90 backdrop-blur-xl ${
                isSurge
                  ? 'border-amber-500/40 shadow-amber-500/5'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wide">
                    {item.route}
                  </div>
                  <h3 className="font-['Poppins'] font-bold text-base sm:text-lg text-white mt-0.5">
                    {item.station}
                  </h3>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider ${
                    isSurge
                      ? 'bg-amber-500/2og border border-amber-500/40 text-amber-400 bg-amber-500/15'
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Tickets Raised / Demand</div>
                  <div className="font-mono font-bold text-lg sm:text-xl text-white mt-0.5">
                    {item.ticketsRaised}{' '}
                    <span className="text-xs text-slate-500 font-normal">/ {item.normalCapacity} normal</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 font-medium">AI Fleet Adjustment</div>
                  <div
                    className={`font-mono font-bold text-lg sm:text-xl mt-0.5 ${
                      item.busAdjustment > 0
                        ? 'text-emerald-400'
                        : item.busAdjustment < 0
                        ? 'text-orange-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.busAdjustment > 0 ? `+${item.busAdjustment} Buses` : item.busAdjustment < 0 ? `${item.busAdjustment} Buses` : 'Balanced'}
                  </div>
                </div>
              </div>

              {/* AI Recommendation Box */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5 mb-4 text-xs sm:text-sm text-blue-200/90 leading-relaxed">
                <span className="font-bold text-blue-400">🤖 AI Recommendation:</span> {item.suggestedAction}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleExecuteDiversion(item.station)}
                disabled={isExecuting || item.status === 'NORMAL'}
                className={`w-full py-2.5 sm:py-3 rounded-xl font-['Poppins'] font-bold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50 ${
                  item.status === 'NORMAL'
                    ? 'bg-slate-800 text-slate-400 cursor-default'
                    : 'bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] text-white'
                }`}
              >
                {isExecuting
                  ? 'Executing Diversion…'
                  : item.status === 'NORMAL'
                  ? '✓ Route Balanced'
                  : '🚀 Execute AI Reroute & Reallocate'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}