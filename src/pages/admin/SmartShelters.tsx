import { useState, useEffect } from 'react'

export interface SmartShelter {
  id: string
  name: string
  crowd: number
  eta: string
  etaBoard: 'Online' | 'Offline' | 'Rebooting'
  connectivity: 'Online' | 'Offline' | 'Rebooting'
  announcement: 'Online' | 'Fault' | 'Testing'
  status: 'Active' | 'Alert' | 'Warning'
  x: number
  y: number
}

const initialShelters: SmartShelter[] = [
  { id: 'SH-001', name: 'Dwarka Sector 21 Metro Gate', crowd: 78, eta: '4 min', etaBoard: 'Online', connectivity: 'Online', announcement: 'Online', status: 'Active', x: 20, y: 40 },
  { id: 'SH-002', name: 'Kashmere Gate ISBT', crowd: 94, eta: '2 min', etaBoard: 'Online', connectivity: 'Online', announcement: 'Fault', status: 'Alert', x: 55, y: 30 },
  { id: 'SH-003', name: 'Connaught Place Inner Circle', crowd: 62, eta: '8 min', etaBoard: 'Online', connectivity: 'Offline', announcement: 'Online', status: 'Warning', x: 65, y: 55 },
  { id: 'SH-004', name: 'Nehru Place Terminal', crowd: 45, eta: '11 min', etaBoard: 'Online', connectivity: 'Online', announcement: 'Online', status: 'Active', x: 60, y: 70 },
  { id: 'SH-005', name: 'Airport T3 DTC Stop', crowd: 38, eta: '18 min', etaBoard: 'Offline', connectivity: 'Online', announcement: 'Online', status: 'Warning', x: 30, y: 65 },
  { id: 'SH-006', name: 'Dilshad Garden Terminal', crowd: 55, eta: '6 min', etaBoard: 'Online', connectivity: 'Online', announcement: 'Online', status: 'Active', x: 80, y: 35 },
]

const statusColor: Record<string, string> = { Active: '#10B981', Alert: '#EF4444', Warning: '#F59E0B' }

export default function SmartShelters() {
  const [shelterList, setShelterList] = useState<SmartShelter[]>(() => {
    try {
      const saved = localStorage.getItem('admin_smart_shelters')
      return saved ? JSON.parse(saved) : initialShelters
    } catch {
      return initialShelters
    }
  })

  const [selected, setSelected] = useState<string | null>('SH-001')
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('admin_smart_shelters', JSON.stringify(shelterList))
  }, [shelterList])

  const sel = shelterList.find(s => s.id === selected)

  const showNotification = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 2500)
  }

  const handleRebootHub = (id: string) => {
    setShelterList(prev =>
      prev.map(s => (s.id === id ? { ...s, connectivity: 'Rebooting', etaBoard: 'Rebooting' } : s))
    )
    showNotification(`Reboot signal transmitted to Shelter ${id}...`)

    setTimeout(() => {
      setShelterList(prev =>
        prev.map(s => {
          if (s.id === id) {
            const newStatus = s.announcement === 'Fault' ? 'Alert' : 'Active'
            return { ...s, connectivity: 'Online', etaBoard: 'Online', status: newStatus }
          }
          return s
        })
      )
      showNotification(`✓ Shelter ${id} IoT hub online with nominal connectivity!`)
    }, 1500)
  }

  const handleTestPA = (id: string) => {
    setShelterList(prev =>
      prev.map(s => (s.id === id ? { ...s, announcement: 'Testing' } : s))
    )
    showNotification(`Transmitting PA test frequency to ${id}...`)

    setTimeout(() => {
      setShelterList(prev =>
        prev.map(s => {
          if (s.id === id) {
            const newStatus = s.connectivity === 'Offline' ? 'Warning' : 'Active'
            return { ...s, announcement: 'Online', status: newStatus }
          }
          return s
        })
      )
      showNotification(`✓ PA Acoustic link verified on Shelter ${id}!`)
    }, 1200)
  }

  const onlineCount = shelterList.filter(s => s.status === 'Active').length
  const warningCount = shelterList.filter(s => s.status === 'Warning').length
  const alertCount = shelterList.filter(s => s.status === 'Alert').length

  return (
    <div className="w-full space-y-6 text-zinc-100 font-sans">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Smart Bus Shelter Monitoring
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
          {shelterList.length} telemetry-connected shelters · Real-time crowd load · Dynamic ETA signage
        </p>
      </div>

      {/* Summary KPI Cards: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Shelters', val: shelterList.length, color: '#2D89EF' },
          { label: 'Online Status', val: onlineCount, color: '#10B981' },
          { label: 'Warnings', val: warningCount, color: '#F59E0B' },
          { label: 'Critical Alert', val: alertCount, color: '#EF4444' },
        ].map(s => (
          <div
            key={s.label}
            className="bg-white/4 border rounded-2xl p-3.5 sm:p-4.5 flex flex-col justify-between hover:border-white/15 transition"
            style={{ borderColor: `${s.color}25` }}
          >
            <div className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: s.color }}>
              {s.val.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[11px] text-zinc-400 font-bold uppercase tracking-wider mt-1 truncate">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
          <span>{feedback}</span>
        </div>
      )}

      {/* Split Grid: Network Map + Shelter Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 sm:gap-5">
        {/* Network Map */}
        <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between">
          <div className="p-4 sm:px-5 sm:py-4 border-b border-white/6 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Shelter Network Map</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Geospatial telemetry nodes across NCR routes</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#2D89EF] uppercase bg-[#2D89EF]/10 px-2.5 py-0.5 rounded-full border border-[#2D89EF]/20">
              LIVE BEACONS
            </span>
          </div>

          <div className="h-[300px] sm:h-[380px] bg-gradient-to-br from-[#060d1f] to-[#0a1628] relative overflow-hidden select-none">
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(45,137,239,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(45,137,239,0.08) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <svg className="absolute inset-0 size-full pointer-events-none" viewBox="0 0 560 380" preserveAspectRatio="xMidYMid meet">
              <path d="M 40 190 Q 200 100 360 180 Q 460 210 520 160" stroke="rgba(45,137,239,0.3)" strokeWidth="2" fill="none" strokeDasharray="5 3" />
              <path d="M 0 100 L 560 260" stroke="rgba(0,200,151,0.2)" strokeWidth="1.5" fill="none" strokeDasharray="5 3" />
            </svg>

            {shelterList.map(sh => {
              const isSelected = selected === sh.id
              return (
                <div
                  key={sh.id}
                  onClick={() => setSelected(isSelected ? null : sh.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform z-10"
                  style={{ left: `${sh.x}%`, top: `${sh.y}%` }}
                >
                  <div
                    className={`size-7 sm:size-8 rounded-xl flex items-center justify-center text-xs sm:text-sm text-white shadow-lg transition-transform ${
                      isSelected ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#060d1f]' : 'hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: statusColor[sh.status],
                      boxShadow: `0 4px 16px ${statusColor[sh.status]}66`,
                    }}
                  >
                    🏠
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Shelter Inspector & List */}
        <div className="space-y-4 flex flex-col justify-between">
          {sel && (
            <div
              className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition shadow-lg"
              style={{
                backgroundColor: `${statusColor[sel.status]}08`,
                borderColor: `${statusColor[sel.status]}25`,
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-3.5">
                <div className="min-w-0">
                  <h4 className="font-bold text-sm sm:text-base text-white truncate">{sel.name}</h4>
                  <span className="text-[11px] text-zinc-400 font-mono">{sel.id}</span>
                </div>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 uppercase tracking-wider"
                  style={{
                    backgroundColor: `${statusColor[sel.status]}15`,
                    color: statusColor[sel.status],
                    borderColor: `${statusColor[sel.status]}30`,
                  }}
                >
                  {sel.status}
                </span>
              </div>

              {/* 2x2 Telemetry Status */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {[
                  { label: 'ETA Board', val: sel.etaBoard, icon: '📺' },
                  { label: 'Connectivity', val: sel.connectivity, icon: '📶' },
                  { label: 'Announcement', val: sel.announcement, icon: '📢' },
                  { label: 'Next Bus', val: sel.eta, icon: '🚌' },
                ].map(f => (
                  <div
                    key={f.label}
                    className="bg-white/4 rounded-xl p-2.5 flex items-center justify-between border border-white/5"
                  >
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
                      <span>{f.icon}</span>
                      <span>{f.label}</span>
                    </span>
                    <span
                      className="text-[11px] font-bold font-mono shrink-0 ml-1"
                      style={{
                        color:
                          f.val === 'Online' || f.val === sel.eta
                            ? '#10B981'
                            : f.val.includes('ing')
                            ? '#F59E0B'
                            : '#EF4444',
                      }}
                    >
                      {f.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Crowd Level Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-zinc-400">Live Crowd Occupancy</span>
                  <span
                    className="font-bold font-mono"
                    style={{
                      color: sel.crowd > 80 ? '#EF4444' : sel.crowd > 60 ? '#F59E0B' : '#10B981',
                    }}
                  >
                    {sel.crowd}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${sel.crowd}%`,
                      backgroundColor: sel.crowd > 80 ? '#EF4444' : sel.crowd > 60 ? '#F59E0B' : '#10B981',
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleRebootHub(sel.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#2D89EF]/15 hover:bg-[#2D89EF]/25 border border-[#2D89EF]/30 text-[#2D89EF] text-xs font-bold transition cursor-pointer active:scale-95 text-center"
                >
                  🔄 Reboot Hub
                </button>
                <button
                  type="button"
                  onClick={() => handleTestPA(sel.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[#8B5CF6] text-xs font-bold transition cursor-pointer active:scale-95 text-center"
                >
                  📢 Test PA Audio
                </button>
              </div>
            </div>
          )}

          {/* Shelter Roster List */}
          <div className="bg-white/3 border border-white/7 rounded-2xl overflow-hidden divide-y divide-white/5">
            {shelterList.map(sh => (
              <div
                key={sh.id}
                onClick={() => setSelected(sh.id === selected ? null : sh.id)}
                className={`flex items-center gap-3 p-3 sm:px-4 cursor-pointer transition ${
                  selected === sh.id ? 'bg-white/6' : 'hover:bg-white/2'
                }`}
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: statusColor[sh.status],
                    boxShadow: sh.status === 'Alert' ? `0 0 8px ${statusColor[sh.status]}` : 'none',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{sh.name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    {sh.id} · Crowd {sh.crowd}%
                  </div>
                </div>
                <div className="text-xs font-bold font-mono text-[#2D89EF] shrink-0">
                  {sh.eta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}