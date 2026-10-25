import { useState, useEffect } from 'react'
import type { AdminTab } from './AdminLayout'

interface Props {
  onTabChange: (tab: AdminTab) => void
}

interface BusMarker {
  id: string
  x: number
  y: number
  color: string
}

interface AIRec {
  id: number
  msg: string
  confidence: number
  priority: 'high' | 'medium' | 'low'
}

interface AlertItem {
  icon: string
  msg: string
  time: string
  color: string
}

const initialBuses: BusMarker[] = [
  { id: 'DL-764-A', x: 22, y: 38, color: '#2D89EF' },
  { id: 'DL-302-B', x: 55, y: 52, color: '#00C897' },
  { id: 'DL-411-C', x: 70, y: 28, color: '#EF4444' },
  { id: 'DL-118-D', x: 38, y: 65, color: '#8B5CF6' },
  { id: 'DL-764-E', x: 78, y: 48, color: '#F59E0B' },
  { id: 'DL-550-F', x: 15, y: 58, color: '#10B981' },
]

export default function AdminDashboard({ onTabChange }: Props) {
  // 1. Live IST Clock
  const [currentTime, setCurrentTime] = useState<string>('')
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatted = now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).toUpperCase()
      const time = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      setCurrentTime(`LIVE — ${formatted} · ${time} IST`)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // 2. Interactive Map Layer
  const [activeLayer, setActiveLayer] = useState<'All' | 'Buses' | 'Depots' | 'Heatmap'>('All')

  // 3. Mutable AI Recommendations
  const [aiRecs, setAiRecs] = useState<AIRec[]>([
    { id: 1, msg: 'Increase allocation on Route 764 by 3 buses — demand forecast 147% above normal from 5 PM', confidence: 94, priority: 'high' },
    { id: 2, msg: 'Reduce Route 302 fleet by 2 buses — occupancy avg 31% below target this week', confidence: 87, priority: 'medium' },
    { id: 3, msg: 'Deploy 2 additional buses near Dwarka Sector 21 — 6:30 PM peak demand predicted', confidence: 91, priority: 'high' },
  ])

  // 4. Mutable Alerts Feed
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { icon: '⏱️', msg: 'Route 411 — 8 min delay', time: '2m ago', color: '#F59E0B' },
    { icon: '🚨', msg: 'Overcrowding at Kashmere Gate', time: '5m ago', color: '#EF4444' },
    { icon: '🔧', msg: 'Bus DL-302-G maintenance due', time: '12m ago', color: '#94A3B8' },
    { icon: '✅', msg: 'AI Rec #18 approved — Route 764', time: '18m ago', color: '#10B981' },
  ])

  // Approve Recommendation Handler
  const handleApproveRec = (id: number, msg: string) => {
    setAiRecs(prev => prev.filter(r => r.id !== id))
    const firstSentence = msg.split('—')[0] || msg
    setAlerts(prev => [
      {
        icon: '✅',
        msg: `AI Approved: ${firstSentence.trim()}`,
        time: 'Just now',
        color: '#10B981',
      },
      ...prev,
    ])
  }

  // Reject Recommendation Handler
  const handleRejectRec = (id: number) => {
    setAiRecs(prev => prev.filter(r => r.id !== id))
  }

  // Export Report as CSV
  const handleExportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value,Status\n"
      + "Active Buses,2184,Nominal\n"
      + "Tickets Today,84291,+8.4%\n"
      + "Passenger Footfall,1.2M,+3.2%\n"
      + "Average Occupancy,64%,Stable\n"
      + "Delayed Routes,7,-3\n"
      + "AI Interventions,23,Active\n"

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `EquiTransit_Ops_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const stats = [
    { label: 'Active Buses', value: '2,184', change: '+12', color: '#2D89EF', icon: '🚌' },
    { label: 'Tickets Today', value: '84,291', change: '+8.4%', color: '#00C897', icon: '🎫' },
    { label: 'Passengers', value: '1.2M', change: '+3.2%', color: '#8B5CF6', icon: '👥' },
    { label: 'Avg Occupancy', value: '64%', change: '-2%', color: '#F59E0B', icon: '📊' },
    { label: 'Delayed Routes', value: '7', change: '-3', color: '#EF4444', icon: '⏱️' },
    { label: 'AI Actions', value: '23', change: 'today', color: '#10B981', icon: '🧠' },
  ]

  return (
    <div className="w-full space-y-6">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="size-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#10B981] uppercase font-mono">
              {currentTime || 'LIVE — OPERATIONS STREAM'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Operations Dashboard</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Delhi NCR Fleet Command — Real-time telemetry & dispatch</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onTabChange('ai')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-[#8B5CF6] text-xs font-bold transition cursor-pointer active:scale-95"
          >
            <span>🧠</span>
            <span>AI Control Center</span>
          </button>
          <button
            type="button"
            onClick={handleExportReport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3595ff] hover:to-[#227beb] text-white text-xs font-bold shadow-[0_0_20px_rgba(45,137,239,0.3)] transition cursor-pointer active:scale-95"
          >
            <span>📥</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Responsive Stats Grid: 2 cols on mobile, 3 cols on tablet, 6 cols on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white/4 border border-white/7 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between hover:border-white/15 transition"
          >
            <div className="flex items-start justify-between gap-1 mb-2">
              <span className="text-lg sm:text-xl">{s.icon}</span>
              <span
                className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  s.change.startsWith('+')
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : s.change.startsWith('-') && s.label !== 'Delayed Routes'
                    ? 'bg-rose-500/15 text-rose-400'
                    : 'bg-purple-500/15 text-purple-400'
                }`}
              >
                {s.change}
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-zinc-400 truncate mt-0.5">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map + AI Recommendations Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4 sm:gap-5">
        {/* City Map */}
        <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col">
          <div className="p-4 sm:px-5 sm:py-4 border-b border-white/6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">City Operations Map</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">2,184 active buses · 23 depots · 642 routes</p>
            </div>
            
            {/* Layer Controls */}
            <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950/60 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
              {(['All', 'Buses', 'Depots', 'Heatmap'] as const).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setActiveLayer(l)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold transition cursor-pointer ${
                    activeLayer === l
                      ? 'bg-[#2D89EF]/20 text-[#2D89EF] border border-[#2D89EF]/40 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[280px] sm:h-[360px] bg-gradient-to-br from-[#060d1f] to-[#0a1628] relative overflow-hidden select-none">
            {/* Grid Mesh */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(45,137,239,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(45,137,239,0.1) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Heatmap overlay */}
            {(activeLayer === 'All' || activeLayer === 'Heatmap') && (
              <>
                <div className="absolute left-[40%] top-[30%] w-28 sm:w-32 h-20 bg-[radial-gradient(ellipse,rgba(239,68,68,0.28)_0%,transparent_70%)] rounded-full pointer-events-none" />
                <div className="absolute left-[18%] top-[52%] w-24 sm:w-28 h-18 bg-[radial-gradient(ellipse,rgba(245,158,11,0.22)_0%,transparent_70%)] rounded-full pointer-events-none" />
                <div className="absolute left-[62%] top-[42%] w-20 sm:w-24 h-16 bg-[radial-gradient(ellipse,rgba(45,137,239,0.25)_0%,transparent_70%)] rounded-full pointer-events-none" />
              </>
            )}

            {/* Route Corridors SVG */}
            <svg className="absolute inset-0 size-full pointer-events-none" viewBox="0 0 560 360" preserveAspectRatio="xMidYMid slice">
              <path d="M 40 180 Q 160 80 310 160 Q 400 200 520 150" stroke="rgba(45,137,239,0.3)" strokeWidth="2.5" fill="none" strokeDasharray="6 4" />
              <path d="M 0 100 L 560 280" stroke="rgba(0,200,151,0.2)" strokeWidth="2" fill="none" strokeDasharray="6 4" />
              <path d="M 240 0 L 220 360" stroke="rgba(139,92,246,0.2)" strokeWidth="1.5" fill="none" strokeDasharray="6 4" />
              <path d="M 0 280 Q 160 240 320 270 Q 440 290 560 260" stroke="rgba(245,158,11,0.2)" strokeWidth="2" fill="none" strokeDasharray="6 4" />

              {/* Depots */}
              {(activeLayer === 'All' || activeLayer === 'Depots') && (
                [[80, 160], [300, 80], [450, 200], [200, 300], [480, 300]].map(([cx, cy], i) => (
                  <g key={i}>
                    <rect x={cx - 8} y={cy - 8} width={16} height={16} rx={3} fill="rgba(0,200,151,0.15)" stroke="#00C897" strokeWidth={1.5} />
                    <text x={cx} y={cy + 4} textAnchor="middle" fontSize={8} fill="#00C897" fontWeight="bold">D</text>
                  </g>
                ))
              )}
            </svg>

            {/* Bus Node Markers */}
            {(activeLayer === 'All' || activeLayer === 'Buses') && (
              initialBuses.map((bus) => (
                <div
                  key={bus.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
                  style={{ left: `${bus.x}%`, top: `${bus.y}%` }}
                >
                  <div
                    className="rounded-lg px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md flex items-center gap-1 font-mono"
                    style={{ backgroundColor: bus.color, boxShadow: `0 2px 10px ${bus.color}66` }}
                  >
                    <span>🚌</span>
                    <span className="hidden sm:inline">{bus.id.slice(3)}</span>
                  </div>
                </div>
              ))
            )}

            {/* Map Legend */}
            <div className="absolute bottom-2.5 right-2.5 bg-zinc-950/85 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1.5 flex items-center gap-2.5 text-[9px] sm:text-[10px] text-zinc-300">
              {[{ color: '#2D89EF', label: 'Bus' }, { color: '#00C897', label: 'Depot' }, { color: '#EF4444', label: 'Congested' }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="size-1.5 sm:size-2 rounded-full" style={{ backgroundColor: l.color }} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
          <div>
            <div className="p-4 sm:px-5 sm:py-4 border-b border-white/6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                <h3 className="text-sm sm:text-base font-bold text-white">AI Recommendations</h3>
              </div>
              <span className="bg-purple-500/15 border border-purple-500/25 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-[#8B5CF6]">
                {aiRecs.length} pending
              </span>
            </div>

            <div className="p-3.5 sm:p-4 space-y-3">
              {aiRecs.length === 0 ? (
                <div className="py-10 text-center text-xs text-zinc-400">
                  🎉 All recommendations addressed for this operational cycle.
                </div>
              ) : (
                aiRecs.map(rec => (
                  <div
                    key={rec.id}
                    className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-3 sm:p-3.5 space-y-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm shrink-0">🧠</span>
                      <p className="text-xs text-zinc-300 leading-relaxed m-0">{rec.msg}</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#2D89EF] rounded-full"
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[#8B5CF6] shrink-0 font-mono">
                        {rec.confidence}% conf.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleApproveRec(rec.id, rec.msg)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[11px] font-bold transition cursor-pointer active:scale-95"
                      >
                        ✓ Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectRec(rec.id)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-[11px] font-bold transition cursor-pointer active:scale-95"
                      >
                        ✕ Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => onTabChange('ai')}
                        className="px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-zinc-400 text-[11px] transition cursor-pointer"
                        title="Edit Dispatch Parameters"
                      >
                        ✎
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3.5 sm:p-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => onTabChange('ai')}
              className="w-full py-2.5 rounded-xl border border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/20 text-[#8B5CF6] text-xs font-bold transition cursor-pointer text-center block"
            >
              Open AI Control Center →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Tri-Grid: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Fleet status */}
        <div className="bg-white/3 border border-white/7 rounded-2xl p-4 sm:p-5">
          <h4 className="text-xs sm:text-sm font-bold text-white mb-4">Fleet Status</h4>
          <div className="space-y-3.5">
            {[
              { label: 'Active in Transit', val: 2184, total: 2400, color: '#10B981' },
              { label: 'Under Maintenance', val: 156, total: 2400, color: '#F59E0B' },
              { label: 'Parked at Depot', val: 60, total: 2400, color: '#2D89EF' },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-zinc-400">{s.label}</span>
                  <span className="font-bold font-mono" style={{ color: s.color }}>{s.val}</span>
                </div>
                <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(s.val / s.total) * 100}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top routes */}
        <div className="bg-white/3 border border-white/7 rounded-2xl p-4 sm:p-5">
          <h4 className="text-xs sm:text-sm font-bold text-white mb-4">Top Routes Today</h4>
          <div className="space-y-2.5">
            {[
              { route: '764', passengers: 12840, occ: 87 },
              { route: '302', passengers: 9420, occ: 61 },
              { route: '411', passengers: 8110, occ: 78 },
              { route: '118', passengers: 6820, occ: 44 },
            ].map((r) => (
              <div key={r.route} className="flex items-center gap-3">
                <span className="size-8 rounded-lg bg-[#2D89EF]/15 text-[#2D89EF] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  {r.route}
                </span>
                <div className="flex-1">
                  <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.occ}%`,
                        backgroundColor: r.occ > 80 ? '#EF4444' : r.occ > 60 ? '#F59E0B' : '#10B981',
                      }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                  {(r.passengers / 1000).toFixed(1)}k
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent alerts */}
        <div className="bg-white/3 border border-white/7 rounded-2xl p-4 sm:p-5 md:col-span-2 xl:col-span-1">
          <h4 className="text-xs sm:text-sm font-bold text-white mb-4">Recent Alerts Feed</h4>
          <div className="space-y-3">
            {alerts.slice(0, 4).map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 pb-2.5 border-b border-white/5 last:border-0 last:pb-0"
              >
                <span className="text-sm shrink-0">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-zinc-300 truncate leading-snug">{a.msg}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}