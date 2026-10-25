import { useState, useEffect } from 'react'

export interface SafetyAlert {
  id: number
  type: 'overcrowding' | 'panic' | 'medical' | 'fire'
  icon: string
  title: string
  desc: string
  time: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  location: string
  bus: string | null
  status: 'active' | 'responding' | 'resolved'
}

const initialAlerts: SafetyAlert[] = [
  { id: 1, type: 'overcrowding', icon: '👥', title: 'Overcrowding — Kashmere Gate Stop', desc: 'Crowd density at 94% capacity. 340+ passengers waiting. Immediate additional bus deployment recommended.', time: '3 min ago', severity: 'critical', location: 'Kashmere Gate', bus: null, status: 'active' },
  { id: 2, type: 'panic', icon: '🆘', title: 'Panic Alert — Bus DL-1-BP-411-C', desc: 'Passenger activated emergency button on Route 411. Driver Ajay Sharma notified. Police alert dispatched.', time: '7 min ago', severity: 'critical', location: 'Nehru Place Area', bus: 'DL-1-BP-411-C', status: 'responding' },
  { id: 3, type: 'medical', icon: '🚑', title: 'Medical Emergency — Route 764', desc: 'Driver reported passenger requiring medical assistance near Dhaula Kuan. Ambulance en route. ETA 4 minutes.', time: '12 min ago', severity: 'high', location: 'Dhaula Kuan', bus: 'DL-1-BP-764-A', status: 'resolved' },
  { id: 4, type: 'fire', icon: '🔥', title: 'Fire Alert — Connaught Place Depot', desc: 'Smoke detector triggered in Depot Block B. Fire brigade alerted. Evacuation procedure initiated.', time: '22 min ago', severity: 'high', location: 'CP Depot', bus: null, status: 'resolved' },
]

const severityColor: Record<string, string> = { critical: '#EF4444', high: '#F59E0B', medium: '#2D89EF', low: '#10B981' }
const statusColor: Record<string, string> = { active: '#EF4444', responding: '#F59E0B', resolved: '#10B981' }

export default function SafetyCenter() {
  const [alerts, setAlerts] = useState<SafetyAlert[]>(() => {
    try {
      const saved = localStorage.getItem('safety_emergency_alerts')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      return initialAlerts
    } catch {
      return initialAlerts
    }
  })

  const [selected, setSelected] = useState<number | null>(1)
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<'broadcast' | 'allRoutes' | 'protocol' | null>(null)

  useEffect(() => {
    localStorage.setItem('safety_emergency_alerts', JSON.stringify(alerts))
  }, [alerts])

  const activeAlerts = alerts.filter(a => a.status !== 'resolved')
  const respondingAlerts = alerts.filter(a => a.status === 'responding')
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved')

  const triggerNotice = (msg: string) => {
    setFeedbackNotice(msg)
    setTimeout(() => setFeedbackNotice(null), 3000)
  }

  const handleDispatchPolice = (id: number) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'responding', desc: `${a.desc} [POLICE UNIT DISPATCHED — EN ROUTE]` } : a))
    )
    triggerNotice('🚔 Police dispatch order transmitted to Delhi Police PCR network!')
  }

  const handleRouteBroadcast = (alert: SafetyAlert) => {
    triggerNotice(`📢 Emergency audio/text advisory broadcasted to all units near ${alert.location}!`)
  }

  const handleResolveAlert = (id: number) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'resolved', time: 'Just now' } : a))
    )
    triggerNotice('✓ Incident logged as RESOLVED by Operations Command.')
  }

  const handleActivateProtocol = () => {
    setAlerts(prev =>
      prev.map(a => (a.status === 'active' ? { ...a, status: 'responding' } : a))
    )
    setActiveModal(null)
    triggerNotice('🚨 Emergency Protocol ACTIVE. Priority clearance sent to all active transit vehicles.')
  }

  return (
    <div className="w-full space-y-6 text-zinc-100 font-sans">
      {/* Responsive Emergency Header */}
      <div className="bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-transparent border border-rose-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="size-11 sm:size-13 rounded-full bg-rose-500/15 border-2 border-rose-500/40 flex items-center justify-center text-xl sm:text-2xl shrink-0 animate-pulse">
            🚨
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Safety & Emergency Center
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
              {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''} requiring attention · Emergency response coordinated from this panel
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveModal('broadcast')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 text-xs font-bold transition cursor-pointer active:scale-95"
          >
            <span>🚨 Emergency Broadcast</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('allRoutes')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-bold transition cursor-pointer active:scale-95"
          >
            <span>📡 All-Routes Alert</span>
          </button>
        </div>
      </div>

      {/* Floating Feedback Alert */}
      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Stats Grid: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Active Alerts', val: activeAlerts.length, color: '#EF4444', icon: '🚨' },
          { label: 'Responding', val: respondingAlerts.length, color: '#F59E0B', icon: '🚔' },
          { label: 'Resolved Today', val: resolvedAlerts.length, color: '#10B981', icon: '✅' },
          { label: 'Avg Response Time', val: '4.2 min', color: '#2D89EF', icon: '⏱️' },
        ].map(s => (
          <div
            key={s.label}
            className="bg-white/4 border rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 sm:gap-3.5 hover:border-white/15 transition"
            style={{ borderColor: `${s.color}25` }}
          >
            <div
              className="size-10 sm:size-11 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0"
              style={{ backgroundColor: `${s.color}15` }}
            >
              {s.icon}
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: s.color }}>
                {s.val}
              </div>
              <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate mt-0.5">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2-Column Split: Alert Feed + Emergency Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Alert List */}
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              onClick={() => setSelected(alert.id === selected ? null : alert.id)}
              className="bg-white/3 border rounded-2xl p-4 sm:p-5 transition cursor-pointer hover:border-white/15"
              style={{
                borderColor: selected === alert.id ? `${severityColor[alert.severity]}40` : 'rgba(255,255,255,0.08)',
                backgroundColor: selected === alert.id ? `${severityColor[alert.severity]}08` : 'rgba(255,255,255,0.03)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`size-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
                    alert.status === 'active' ? 'animate-pulse' : ''
                  }`}
                  style={{
                    backgroundColor: `${severityColor[alert.severity]}15`,
                    borderColor: `${severityColor[alert.severity]}30`,
                  }}
                >
                  {alert.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate">{alert.title}</h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${severityColor[alert.severity]}15`,
                          color: severityColor[alert.severity],
                        }}
                      >
                        {alert.severity}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${statusColor[alert.status]}15`,
                          color: statusColor[alert.status],
                        }}
                      >
                        {alert.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed mb-2.5">{alert.desc}</p>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                    <span>📍 {alert.location}</span>
                    <span>⏱ {alert.time}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Selected Alert */}
              {selected === alert.id && alert.status !== 'resolved' && (
                <div className="mt-3.5 pt-3.5 border-t border-white/8 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDispatchPolice(alert.id) }}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold transition cursor-pointer active:scale-95 text-center"
                  >
                    🚔 Dispatch Police
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRouteBroadcast(alert) }}
                    className="w-full py-2 px-3 rounded-xl bg-[#2D89EF]/15 hover:bg-[#2D89EF]/25 border border-[#2D89EF]/30 text-[#2D89EF] text-xs font-bold transition cursor-pointer active:scale-95 text-center"
                  >
                    📢 Broadcast
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleResolveAlert(alert.id) }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition cursor-pointer active:scale-95 text-center"
                  >
                    ✓ Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Emergency Map */}
        <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:px-5 sm:py-4 border-b border-white/6">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Emergency Incident Map</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Live emergency beacon telemetry across Delhi NCR corridors</p>
            </div>

            <div className="h-64 sm:h-72 bg-gradient-to-br from-[#060d1f] to-[#0a1628] relative overflow-hidden select-none">
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(rgba(45,137,239,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(45,137,239,0.08) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              <svg className="absolute inset-0 size-full" viewBox="0 0 420 300" preserveAspectRatio="xMidYMid meet">
                <path d="M 40 150 Q 160 80 280 140 Q 360 170 400 130" stroke="rgba(45,137,239,0.3)" strokeWidth="2" fill="none" strokeDasharray="5 3" />
                <path d="M 0 80 L 420 210" stroke="rgba(0,200,151,0.2)" strokeWidth="1.5" fill="none" strokeDasharray="5 3" />

                {/* Incident markers */}
                {[
                  { id: 1, cx: 180, cy: 100, icon: '👥', label: 'Kashmere Gate' },
                  { id: 2, cx: 260, cy: 150, icon: '🆘', label: 'Nehru Place' },
                  { id: 3, cx: 140, cy: 170, icon: '🚑', label: 'Dhaula Kuan' },
                  { id: 4, cx: 330, cy: 80, icon: '🔥', label: 'CP Depot' },
                ].map((inc, i) => {
                  const target = alerts.find(a => a.id === inc.id)
                  const isResolved = target?.status === 'resolved'
                  const pinColor = isResolved ? '#10B981' : target?.status === 'responding' ? '#F59E0B' : '#EF4444'

                  return (
                    <g key={i} className="cursor-pointer transition-transform hover:scale-110" onClick={() => setSelected(inc.id)}>
                      <circle cx={inc.cx} cy={inc.cy} r={isResolved ? 12 : 18} fill={`${pinColor}15`} />
                      <circle cx={inc.cx} cy={inc.cy} r={10} fill={`${pinColor}25`} stroke={pinColor} strokeWidth={2} />
                      <text x={inc.cx} y={inc.cy + 4} textAnchor="middle" fontSize={10}>{inc.icon}</text>
                      <text x={inc.cx} y={inc.cy + 24} textAnchor="middle" fontSize={8} fontWeight="bold" fill={isResolved ? '#10B981' : 'rgba(255,255,255,0.6)'}>
                        {inc.label} {isResolved ? '(Resolved)' : ''}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          <div className="p-4 border-t border-white/6">
            <button
              type="button"
              onClick={() => setActiveModal('protocol')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#c53030] hover:from-[#f85151] hover:to-[#db3939] text-white text-xs sm:text-sm font-bold shadow-[0_4px_20px_rgba(239,68,68,0.35)] transition cursor-pointer active:scale-95"
            >
              🚨 Activate Emergency Protocol
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Emergency Protocol Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1628] border border-white/12 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-2">
              {activeModal === 'broadcast' && 'Trigger Central Emergency Broadcast'}
              {activeModal === 'allRoutes' && 'Dispatch All-Routes Advisory'}
              {activeModal === 'protocol' && 'Authorize Rapid Emergency Protocol'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5">
              {activeModal === 'broadcast' && 'This will display high-priority audio & LED alert banners on all bus consoles and depot smart shelters simultaneously.'}
              {activeModal === 'allRoutes' && 'Send speed-reduction notifications and dispatch guidance to all vehicle telematics consoles across NCR corridors.'}
              {activeModal === 'protocol' && 'This automatically mobilizes standby depot patrol units, elevates response status on all active alarms, and updates state emergency dispatch lines.'}
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={activeModal === 'protocol' ? handleActivateProtocol : () => {
                  triggerNotice('✓ Operational advisory transmitted successfully across all units!')
                  setActiveModal(null)
                }}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition cursor-pointer shadow-md ${
                  activeModal === 'protocol'
                    ? 'bg-gradient-to-r from-[#EF4444] to-[#c53030] hover:from-[#f85151]'
                    : 'bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff]'
                }`}
              >
                Confirm & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}