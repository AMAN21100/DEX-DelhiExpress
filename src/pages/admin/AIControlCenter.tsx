import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts'
import { useState, useEffect } from 'react'

const demandData = [
  { time: '5AM', actual: 1200, forecast: 1300 },
  { time: '6AM', actual: 3400, forecast: 3200 },
  { time: '7AM', actual: 7800, forecast: 8200 },
  { time: '8AM', actual: 11200, forecast: 10900 },
  { time: '9AM', actual: 9400, forecast: 9800 },
  { time: '10AM', actual: 6200, forecast: 6100 },
  { time: '11AM', actual: 5100, forecast: 5400 },
  { time: '12PM', actual: 6800, forecast: 6600 },
  { time: '1PM', actual: 7200, forecast: 7100 },
  { time: '2PM', actual: 6100, forecast: null },
  { time: '3PM', actual: null, forecast: 6800 },
  { time: '4PM', actual: null, forecast: 8900 },
  { time: '5PM', actual: null, forecast: 11400 },
  { time: '6PM', actual: null, forecast: 10800 },
  { time: '7PM', actual: null, forecast: 8200 },
  { time: '8PM', actual: null, forecast: 5600 },
]

interface RouteAlloc {
  route: string
  current: number
  recommended: number
  demand: number
}

const initialRouteAllocation: RouteAlloc[] = [
  { route: '764', current: 18, recommended: 24, demand: 87 },
  { route: '302', current: 12, recommended: 9, demand: 42 },
  { route: '411', current: 10, recommended: 13, demand: 71 },
  { route: '118', current: 6, recommended: 6, demand: 44 },
  { route: '550', current: 14, recommended: 11, demand: 38 },
  { route: '222', current: 8, recommended: 14, demand: 84 },
]

interface AIRecItem {
  id: number
  type: 'increase' | 'decrease' | 'alert'
  route: string
  action: string
  confidence: number
  priority: 'critical' | 'high' | 'medium'
  status: 'pending' | 'approved' | 'rejected'
}

const initialAiRecs: AIRecItem[] = [
  { id: 1, type: 'increase', route: '764', action: 'Increase buses on Route 764 by 6 units — peak demand 147% above normal from 5 PM to 8 PM', confidence: 94, priority: 'critical', status: 'pending' },
  { id: 2, type: 'decrease', route: '302', action: 'Reduce Route 302 allocation by 3 buses — avg occupancy only 31% this week, low efficiency', confidence: 87, priority: 'medium', status: 'pending' },
  { id: 3, type: 'alert', route: '222', action: 'High passenger demand near Dwarka Sector 21 from 5 PM to 8 PM today — deploy 6 additional buses', confidence: 91, priority: 'high', status: 'approved' },
  { id: 4, type: 'increase', route: '411', action: 'Reinforce Route 411 with 3 buses — construction diversion adding 12 min to journey times', confidence: 82, priority: 'medium', status: 'pending' },
]

const etaData = [
  { route: '764', predicted: 4.2, actual: 4.8, accuracy: 94 },
  { route: '302', predicted: 8.1, actual: 8.0, accuracy: 98 },
  { route: '411', predicted: 12.4, actual: 16.2, accuracy: 76 },
  { route: '118', predicted: 6.8, actual: 7.1, accuracy: 96 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0a1628] border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
      <p className="text-zinc-400 text-[11px] mb-1 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs font-bold font-mono my-0.5" style={{ color: p.color }}>
          {p.name}: {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function AIControlCenter() {
  const [activeRecs, setActiveRecs] = useState<AIRecItem[]>(() => {
    try {
      const saved = localStorage.getItem('ai_recommendations')
      return saved ? JSON.parse(saved) : initialAiRecs
    } catch {
      return initialAiRecs
    }
  })

  const [routeAlloc, setRouteAlloc] = useState<RouteAlloc[]>(() => {
    try {
      const saved = localStorage.getItem('route_allocations')
      return saved ? JSON.parse(saved) : initialRouteAllocation
    } catch {
      return initialRouteAllocation
    }
  })

  const [todayString, setTodayString] = useState('')
  useEffect(() => {
    setTodayString(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))
  }, [])

  useEffect(() => {
    localStorage.setItem('ai_recommendations', JSON.stringify(activeRecs))
  }, [activeRecs])

  useEffect(() => {
    localStorage.setItem('route_allocations', JSON.stringify(routeAlloc))
  }, [routeAlloc])

  const [editingRec, setEditingRec] = useState<AIRecItem | null>(null)
  const [editActionText, setEditActionText] = useState('')

  const openEditModal = (rec: AIRecItem) => {
    setEditingRec(rec)
    setEditActionText(rec.action)
  }

  const saveEdit = () => {
    if (!editingRec) return
    setActiveRecs(prev => prev.map(r => r.id === editingRec.id ? { ...r, action: editActionText } : r))
    setEditingRec(null)
  }

  const approve = (id: number) => {
    const targetRec = activeRecs.find(r => r.id === id)
    if (targetRec) {
      setRouteAlloc(prev =>
        prev.map(r => {
          if (r.route === targetRec.route) {
            return { ...r, current: r.recommended }
          }
          return r
        })
      )
    }
    setActiveRecs(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))
  }

  const reject = (id: number) => {
    setActiveRecs(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
  }

  return (
    <div className="w-full space-y-6 text-zinc-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="size-2 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_rgba(139,92,246,0.6)] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold text-[#8B5CF6] tracking-wider uppercase font-mono">
              AI ENGINE ACTIVE — MODEL v4.2.1
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">AI Control Center</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Demand forecasting · Fleet allocation · ETA prediction · Traffic intelligence
          </p>
        </div>

        <div className="self-start sm:self-auto bg-purple-500/10 border border-purple-500/25 rounded-2xl px-4 py-3 flex sm:flex-col items-center justify-between gap-2.5 sm:gap-0 sm:text-center shrink-0">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Overall AI Accuracy</div>
          <div className="text-2xl sm:text-3xl font-black text-[#8B5CF6] font-mono leading-none">94.2%</div>
        </div>
      </div>

      {/* Demand Forecast Chart */}
      <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Passenger Demand Forecast — {todayString || 'Today'}
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              Solid = Actual · Dashed = AI Forecast · Peak demand expected: 5–7 PM
            </p>
          </div>
          <div className="flex items-center gap-4 self-start sm:self-auto">
            {[{ color: '#2D89EF', label: 'Actual' }, { color: '#8B5CF6', label: 'AI Forecast' }].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <span className="w-5 h-0.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[11px] text-zinc-400 font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={demandData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
              <defs>
                <linearGradient id="actual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D89EF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2D89EF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="forecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="actual" stroke="#2D89EF" strokeWidth={2.5} fill="url(#actual)" name="Actual" connectNulls={false} />
              <Area type="monotone" dataKey="forecast" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="6 3" fill="url(#forecast)" name="Forecast" connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: AI Fleet Allocation + ETA Prediction Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-5">
        {/* Fleet allocation */}
        <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-4">AI Fleet Allocation</h3>
            <div className="space-y-3">
              {routeAlloc.map(r => {
                const diff = r.recommended - r.current
                return (
                  <div
                    key={r.route}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition"
                  >
                    <div className="size-9 rounded-xl bg-[#2D89EF]/15 flex items-center justify-center font-mono font-bold text-xs text-[#2D89EF] shrink-0">
                      {r.route}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-xs mb-1.5 gap-2">
                        <span className="text-zinc-400 truncate">
                          Current: <strong className="text-white font-mono">{r.current}</strong>
                        </span>
                        <span className="text-zinc-400 truncate">
                          Target: <strong className="text-[#8B5CF6] font-mono">{r.recommended}</strong>
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/6 rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-[#2D89EF]/50 rounded-full"
                          style={{ width: `${Math.min(100, (r.current / 25) * 100)}%` }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 bg-[#8B5CF6]/70 rounded-full"
                          style={{ width: `${Math.min(100, (r.recommended / 25) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 font-mono ${
                        diff === 0
                          ? 'bg-white/5 text-zinc-400'
                          : diff > 0
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {diff === 0 ? 'Optimal' : diff > 0 ? `+${diff}` : diff}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ETA Engine */}
        <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-4">ETA Prediction Engine</h3>
            <div className="space-y-3">
              {etaData.map(e => (
                <div
                  key={e.route}
                  className="p-3 rounded-xl bg-white/2 border border-white/5 space-y-2 hover:border-white/10 transition"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-[#2D89EF]">Route {e.route}</span>
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="text-zinc-400">
                        Pred: <strong className="text-[#8B5CF6]">{e.predicted}m</strong>
                      </span>
                      <span className="text-zinc-400">
                        Actual: <strong className={e.accuracy < 85 ? 'text-rose-400' : 'text-white'}>{e.actual}m</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${e.accuracy}%`,
                          backgroundColor: e.accuracy > 90 ? '#10B981' : e.accuracy > 80 ? '#F59E0B' : '#EF4444',
                        }}
                      />
                    </div>
                    <span
                      className="text-[11px] font-bold font-mono min-w-9 text-right"
                      style={{ color: e.accuracy > 90 ? '#10B981' : e.accuracy > 80 ? '#F59E0B' : '#EF4444' }}
                    >
                      {e.accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Feed */}
      <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>🧠</span>
            <span>AI Recommendation Feed</span>
          </h3>
          <span className="bg-purple-500/15 border border-purple-500/25 rounded-full px-3 py-1 text-[11px] font-bold text-[#8B5CF6] self-start sm:self-auto font-mono">
            {activeRecs.filter(r => r.status === 'pending').length} pending decisions
          </span>
        </div>

        {/* Responsive Grid: 1 col on mobile, 2 cols on tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activeRecs.map(rec => {
            const isApproved = rec.status === 'approved'
            const isRejected = rec.status === 'rejected'

            return (
              <div
                key={rec.id}
                className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 transition ${
                  isApproved
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : isRejected
                    ? 'bg-rose-500/5 border-rose-500/15'
                    : 'bg-purple-500/5 border-purple-500/15 hover:border-purple-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{rec.type === 'increase' ? '📈' : rec.type === 'decrease' ? '📉' : '🚨'}</span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          rec.priority === 'critical'
                            ? 'bg-rose-500/15 text-rose-400'
                            : rec.priority === 'high'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-[#2D89EF]/15 text-[#2D89EF]'
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>

                    {rec.status !== 'pending' && (
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                          isApproved ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {isApproved ? '✓ Approved' : '✕ Rejected'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed m-0">{rec.action}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#2D89EF] rounded-full"
                        style={{ width: `${rec.confidence}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold font-mono text-[#8B5CF6] shrink-0">
                      {rec.confidence}%
                    </span>
                  </div>

                  {rec.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => approve(rec.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold transition cursor-pointer active:scale-95 text-center"
                      >
                        ✓ Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => reject(rec.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-rose-500/12 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition cursor-pointer active:scale-95 text-center"
                      >
                        ✕ Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(rec)}
                        className="px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white text-xs transition cursor-pointer"
                        title="Edit Dispatch Parameters"
                      >
                        ✎
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile-Safe Edit Modal */}
      {editingRec && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1628] border border-white/15 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-1">Edit AI Recommendation</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Adjust operational action parameters for Route {editingRec.route}:
            </p>

            <textarea
              value={editActionText}
              onChange={(e) => setEditActionText(e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-[#8B5CF6] transition font-sans resize-none mb-5"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingRec(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] hover:to-[#227beb] text-white text-xs font-bold transition cursor-pointer shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}