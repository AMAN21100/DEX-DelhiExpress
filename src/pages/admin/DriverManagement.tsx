import { useState, useEffect } from 'react'

export interface Driver {
  name: string
  id: string
  bus: string
  shift: string
  attendance: number
  contact: string
  status: 'On Duty' | 'Off Duty' | 'On Leave'
  rating: number
}

const initialDrivers: Driver[] = [
  { name: 'Ramesh Kumar', id: 'DRV-001', bus: 'DL-1-BP-764-A', shift: 'Morning (6AM-2PM)', attendance: 98, contact: '+91 98102 34567', status: 'On Duty', rating: 4.8 },
  { name: 'Suresh Singh', id: 'DRV-002', bus: 'DL-1-BP-302-B', shift: 'Morning (6AM-2PM)', attendance: 95, contact: '+91 98201 45678', status: 'On Duty', rating: 4.6 },
  { name: 'Ajay Sharma', id: 'DRV-003', bus: 'DL-1-BP-411-C', shift: 'Afternoon (2PM-10PM)', attendance: 91, contact: '+91 99102 56789', status: 'On Duty', rating: 4.4 },
  { name: 'Vinod Yadav', id: 'DRV-004', bus: 'DL-1-BP-118-D', shift: 'Afternoon (2PM-10PM)', attendance: 97, contact: '+91 97202 67890', status: 'On Duty', rating: 4.9 },
  { name: 'Deepak Nair', id: 'DRV-005', bus: 'DL-1-BP-764-E', shift: 'Morning (6AM-2PM)', attendance: 89, contact: '+91 96102 78901', status: 'On Duty', rating: 4.5 },
  { name: 'Manoj Tiwari', id: 'DRV-006', bus: 'DL-1-BP-302-G', shift: 'Night (10PM-6AM)', attendance: 93, contact: '+91 95302 89012', status: 'Off Duty', rating: 4.3 },
  { name: 'Pradeep Gupta', id: 'DRV-007', bus: '—', shift: 'Morning (6AM-2PM)', attendance: 82, contact: '+91 94402 90123', status: 'On Leave', rating: 4.1 },
]

const statusColor: Record<string, string> = {
  'On Duty': '#10B981',
  'Off Duty': '#94A3B8',
  'On Leave': '#F59E0B',
}

export default function DriverManagement() {
  const [driverList, setDriverList] = useState<Driver[]>(() => {
    try {
      const saved = localStorage.getItem('admin_drivers')
      return saved ? JSON.parse(saved) : initialDrivers
    } catch {
      return initialDrivers
    }
  })

  const [aiApplied, setAiApplied] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('All')

  const [newDriver, setNewDriver] = useState({
    name: '',
    bus: '',
    shift: 'Morning (6AM-2PM)',
    contact: '+91 ',
    status: 'On Duty' as 'On Duty' | 'Off Duty' | 'On Leave',
  })

  useEffect(() => {
    localStorage.setItem('admin_drivers', JSON.stringify(driverList))
  }, [driverList])

  const handleApplyAI = () => {
    setDriverList(prev =>
      prev.map(d => {
        if (d.shift.includes('Night')) {
          return { ...d, shift: 'Morning (6AM-2PM)', status: 'On Duty' }
        }
        return d
      })
    )
    setAiApplied(true)
  }

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDriver.name.trim()) return

    const nextIdNum = driverList.length + 1
    const generatedId = `DRV-${String(nextIdNum).padStart(3, '0')}`

    const created: Driver = {
      name: newDriver.name.trim(),
      id: generatedId,
      bus: newDriver.bus.trim() || '—',
      shift: newDriver.shift,
      attendance: 100,
      contact: newDriver.contact.trim() || '+91 98000 00000',
      status: newDriver.status,
      rating: 5.0,
    }

    setDriverList(prev => [created, ...prev])
    setShowAddModal(false)
    setNewDriver({
      name: '',
      bus: '',
      shift: 'Morning (6AM-2PM)',
      contact: '+91 ',
      status: 'On Duty',
    })
  }

  const handleConfirmRemoveDriver = () => {
    if (!driverToDelete) return
    setDriverList(prev => prev.filter(d => d.id !== driverToDelete.id))
    setDriverToDelete(null)
  }

  const filteredDrivers = driverList.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bus.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === 'All' || d.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const onDutyCount = driverList.filter(d => d.status === 'On Duty').length
  const offDutyCount = driverList.filter(d => d.status === 'Off Duty').length
  const onLeaveCount = driverList.filter(d => d.status === 'On Leave').length
  const avgAttendance = (
    driverList.reduce((acc, curr) => acc + curr.attendance, 0) / (driverList.length || 1)
  ).toFixed(1)

  return (
    <div className="w-full space-y-6 text-zinc-100 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Driver Management</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            {driverList.length} registered personnel · Shift allocation · AI dispatching
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] hover:to-[#227beb] text-white text-xs font-bold shadow-[0_4px_14px_rgba(45,137,239,0.3)] transition cursor-pointer active:scale-95"
        >
          <span>+ Add Driver</span>
        </button>
      </div>

      {/* AI Shift Recommendation Card */}
      <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start gap-4">
        <div className="size-11 sm:size-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl sm:text-2xl shrink-0">
          🧠
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] sm:text-[11px] text-[#8B5CF6] font-bold tracking-wider uppercase mb-1 font-mono">
            AI SHIFT RECOMMENDATION
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-3.5">
            Based on tomorrow's forecast demand, EquiTransit AI recommends shifting drivers from Night Shift to Morning Shift on Route 764 and 302 corridors. Peak demand predicted 6 AM–10 AM. Current allocation will result in 23% under-capacity.
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleApplyAI}
              disabled={aiApplied}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                aiApplied
                  ? 'bg-emerald-500/25 text-emerald-400 cursor-default'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400'
              }`}
            >
              {aiApplied ? '✓ AI Recommendation Applied' : '✓ Apply AI Recommendation'}
            </button>
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="px-3.5 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Review Details
            </button>
          </div>
        </div>

        <div className="self-end md:self-start text-right shrink-0 pt-1">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Confidence</div>
          <div className="text-2xl sm:text-3xl font-black text-[#8B5CF6] font-mono leading-none mt-0.5">89%</div>
        </div>
      </div>

      {/* Stats Cards: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'On Duty', val: onDutyCount, color: '#10B981' },
          { label: 'Off Duty', val: offDutyCount, color: '#94A3B8' },
          { label: 'On Leave', val: onLeaveCount, color: '#F59E0B' },
          { label: 'Avg Attendance', val: `${avgAttendance}%`, color: '#2D89EF' },
        ].map(s => (
          <div
            key={s.label}
            className="bg-white/4 border border-white/7 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between hover:border-white/15 transition"
          >
            <div className="text-[10px] sm:text-[11px] text-zinc-400 font-bold uppercase tracking-wider truncate mb-1">
              {s.label}
            </div>
            <div className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: s.color }}>
              {s.val}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search driver name, ID, or bus..."
          className="w-full sm:max-w-xs px-3.5 py-2 rounded-xl border border-white/10 bg-white/4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-[#2D89EF] transition"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 pb-1 sm:pb-0">
          {(['All', 'On Duty', 'Off Duty', 'On Leave'] as const).map(status => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#2D89EF]/20 text-[#2D89EF] border border-[#2D89EF]/40'
                  : 'bg-white/3 border border-white/8 text-zinc-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Drivers Table with Horizontal Scroll Wrapper */}
      <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[760px]">
            <thead>
              <tr className="border-b border-white/6 bg-white/2">
                {['Driver', 'ID', 'Assigned Bus', 'Shift', 'Attendance', 'Rating', 'Status', 'Contact', 'Action'].map(h => (
                  <th
                    key={h}
                    className="p-3.5 sm:px-4 sm:py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4 text-xs">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-zinc-400 text-xs">
                    No drivers match your current filter.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map(d => (
                  <tr
                    key={d.id}
                    className="hover:bg-white/2 transition"
                  >
                    <td className="p-3 sm:px-4 sm:py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-gradient-to-br from-[#2D89EF] to-[#1a6fd4] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {d.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-semibold text-white whitespace-nowrap">{d.name}</span>
                      </div>
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {d.id}
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 font-mono text-xs text-[#2D89EF] whitespace-nowrap">
                      {d.bus}
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 text-zinc-400 whitespace-nowrap">
                      {d.shift}
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${d.attendance}%`,
                              backgroundColor: d.attendance > 95 ? '#10B981' : d.attendance > 85 ? '#F59E0B' : '#EF4444',
                            }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400">{d.attendance}%</span>
                      </div>
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 font-bold text-amber-400 whitespace-nowrap">
                      {d.rating}★
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 whitespace-nowrap">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          backgroundColor: `${statusColor[d.status]}15`,
                          color: statusColor[d.status],
                          borderColor: `${statusColor[d.status]}30`,
                        }}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {d.contact}
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setDriverToDelete(d)}
                        title="Remove driver"
                        className="px-2.5 py-1 rounded-lg border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold transition cursor-pointer active:scale-95"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remove Driver Modal */}
      {driverToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1628] border border-rose-500/30 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-2">Remove Driver from System?</h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5">
              Are you sure you want to remove <strong className="text-white">{driverToDelete.name}</strong> (<span className="text-[#2D89EF] font-mono">{driverToDelete.id}</span>)? This action will detach them from any assigned bus.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDriverToDelete(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveDriver}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#f85151] hover:to-[#eb3434] text-white text-xs font-bold transition cursor-pointer shadow-md"
              >
                Yes, Remove Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Details Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1628] border border-white/12 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-2">AI Shift Allocation Breakdown</h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5">
              Route 764 passenger surge is expected between 6 AM and 10 AM due to office commute schedules. Shifting night standby drivers ensures driver resting quotas remain compliant under transport regulation guidelines.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] hover:to-[#227beb] text-white text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1628] border border-white/12 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-4">Add New Driver</h3>
            <form onSubmit={handleAddDriver} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Verma"
                  value={newDriver.name}
                  onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-[#2D89EF] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Assigned Bus Number</label>
                <input
                  type="text"
                  placeholder="e.g. DL-1-BP-550-H"
                  value={newDriver.bus}
                  onChange={e => setNewDriver({ ...newDriver, bus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-[#2D89EF] transition font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Shift</label>
                <select
                  value={newDriver.shift}
                  onChange={e => setNewDriver({ ...newDriver, shift: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/12 bg-[#0d1d36] text-xs sm:text-sm text-white outline-none focus:border-[#2D89EF] transition"
                >
                  <option value="Morning (6AM-2PM)">Morning (6AM-2PM)</option>
                  <option value="Afternoon (2PM-10PM)">Afternoon (2PM-10PM)</option>
                  <option value="Night (10PM-6AM)">Night (10PM-6AM)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={newDriver.contact}
                  onChange={e => setNewDriver({ ...newDriver, contact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white outline-none focus:border-[#2D89EF] transition font-mono"
                />
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
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}