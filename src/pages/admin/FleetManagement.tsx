import { useState, useEffect } from 'react'

export interface Bus {
  id: string
  route: string
  occ: number
  driver: string
  status: 'Active' | 'Delayed' | 'Maintenance' | 'Depot'
  location: string
  speed: number
  type: string
  busNumber?: string
  from?: string
  to?: string
  nextStop?: string
  etaMinutes?: number
  speedKmH?: number
  occupancy?: number
  lat?: number
  lng?: number
}

const initialBuses: Bus[] = [
  { 
    id: 'DL-1-BP-764-A', 
    busNumber: 'DL 1PD 4512',
    route: '764', 
    occ: 87, 
    driver: 'Ramesh Kumar', 
    status: 'Active', 
    location: 'Dhaula Kuan', 
    speed: 42, 
    type: 'AC Low Floor',
    from: 'Dwarka Sec-21',
    to: 'Connaught Place',
    nextStop: 'Dhaula Kuan',
    etaMinutes: 4,
    speedKmH: 42,
    occupancy: 87,
    lat: 28.5921,
    lng: 77.0460,
  },
  { 
    id: 'DL-1-BP-302-B', 
    busNumber: 'DL 1PD 8831',
    route: '302', 
    occ: 61, 
    driver: 'Suresh Singh', 
    status: 'Active', 
    location: 'Kashmere Gate', 
    speed: 38, 
    type: 'Non-AC',
    from: 'Dilshad Garden',
    to: 'Kashmere Gate ISBT',
    nextStop: 'Shahdara',
    etaMinutes: 7,
    speedKmH: 38,
    occupancy: 61,
    lat: 28.6692,
    lng: 77.2285,
  },
  { 
    id: 'DL-1-BP-411-C', 
    busNumber: 'DL 1PD 2109',
    route: '411', 
    occ: 45, 
    driver: 'Ajay Sharma', 
    status: 'Delayed', 
    location: 'Nehru Place', 
    speed: 18, 
    type: 'AC Low Floor',
    from: 'Nehru Place',
    to: 'Dwarka Sec-21',
    nextStop: 'Govindpuri (Diverted)',
    etaMinutes: 12,
    speedKmH: 18,
    occupancy: 45,
    lat: 28.5494,
    lng: 77.2539,
  },
  { 
    id: 'DL-1-BP-118-D', 
    busNumber: 'DL 1PD 9014',
    route: '118', 
    occ: 32, 
    driver: 'Vinod Yadav', 
    status: 'Active', 
    location: 'Airport T3', 
    speed: 62, 
    type: 'Non-AC',
    from: 'Mahipalpur',
    to: 'Airport T3',
    nextStop: 'Aerocity Metro',
    etaMinutes: 3,
    speedKmH: 62,
    occupancy: 32,
    lat: 28.5562,
    lng: 77.0999,
  },
  { 
    id: 'DL-1-BP-764-E', 
    busNumber: 'DL 1PD 7731',
    route: '764', 
    occ: 54, 
    driver: 'Deepak Nair', 
    status: 'Active', 
    location: 'Palam', 
    speed: 45, 
    type: 'AC Low Floor',
    from: 'Dwarka Sec-21',
    to: 'Connaught Place',
    nextStop: 'Palam Flyover',
    etaMinutes: 8,
    speedKmH: 45,
    occupancy: 54,
    lat: 28.5855,
    lng: 77.0812,
  },
  { 
    id: 'DL-1-BP-550-F', 
    busNumber: 'DL 1PD 5542',
    route: '550', 
    occ: 0, 
    driver: '—', 
    status: 'Maintenance', 
    location: 'Dwarka Depot', 
    speed: 0, 
    type: 'Non-AC',
    from: 'Noida Sec 18',
    to: 'Connaught Place',
    nextStop: 'Under Repair',
    etaMinutes: 0,
    speedKmH: 0,
    occupancy: 0,
    lat: 28.5721,
    lng: 77.0501,
  },
  { 
    id: 'DL-1-BP-302-G', 
    busNumber: 'DL 1PD 3381',
    route: '302', 
    occ: 71, 
    driver: 'Manoj Tiwari', 
    status: 'Active', 
    location: 'Dilshad Garden', 
    speed: 35, 
    type: 'Non-AC',
    from: 'Dilshad Garden',
    to: 'Kashmere Gate ISBT',
    nextStop: 'Mansarovar Park',
    etaMinutes: 5,
    speedKmH: 35,
    occupancy: 71,
    lat: 28.6782,
    lng: 77.3012,
  },
  { 
    id: 'DL-1-BP-900-H', 
    busNumber: 'DL 1PD 1009',
    route: '—', 
    occ: 0, 
    driver: '—', 
    status: 'Depot', 
    location: 'Connaught Place Depot', 
    speed: 0, 
    type: 'AC Low Floor',
    from: 'Depot Reserve',
    to: 'Standby',
    nextStop: 'Depot Bay 4',
    etaMinutes: 0,
    speedKmH: 0,
    occupancy: 0,
    lat: 28.6315,
    lng: 77.2167,
  },
]

const statusColor: Record<string, string> = {
  Active: '#10B981',
  Delayed: '#F59E0B',
  Maintenance: '#EF4444',
  Depot: '#2D89EF',
}

export default function FleetManagement() {
  const [buses, setBuses] = useState<Bus[]>(() => {
    try {
      const saved = localStorage.getItem('admin_fleet_buses')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((b: any) => ({
            ...b,
            status: b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1).toLowerCase() : 'Active',
            occ: b.occ ?? b.occupancy ?? 0,
            speed: b.speed ?? b.speedKmH ?? 0,
            busNumber: b.busNumber || b.id,
          }))
        }
      }
      return initialBuses
    } catch {
      return initialBuses
    }
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [actionType, setActionType] = useState<'reassign' | 'alert' | 'details' | null>(null)
  const [busToDelete, setBusToDelete] = useState<Bus | null>(null)
  const [alertSuccess, setAlertSuccess] = useState(false)

  const [newBus, setNewBus] = useState({
    id: 'DL-1-BP-',
    route: '764',
    driver: '',
    type: 'AC Low Floor',
    location: 'Central Depot',
    status: 'Active' as Bus['status'],
  })

  const [reassignData, setReassignData] = useState({
    route: '',
    status: 'Active' as Bus['status'],
    location: '',
  })

  // Synchronize master fleet and broadcast storage event
  useEffect(() => {
    const normalized = buses.map(b => ({
      ...b,
      busNumber: b.busNumber || b.id,
      from: b.from || (b.route === '764' ? 'Dwarka Sec-21' : 'Kashmere Gate'),
      to: b.to || b.location || 'Connaught Place',
      nextStop: b.nextStop || b.location || 'En Route',
      etaMinutes: b.etaMinutes ?? (b.status === 'Active' ? 5 : b.status === 'Delayed' ? 14 : 0),
      speedKmH: b.speed,
      occupancy: b.occ,
      status: b.status.toLowerCase(),
      lat: b.lat || 28.6139,
      lng: b.lng || 77.2090,
    }))

    localStorage.setItem('admin_fleet_buses', JSON.stringify(normalized))
    window.dispatchEvent(new Event('storage'))
  }, [buses])

  const countActive = buses.filter(b => b.status === 'Active').length
  const countDelayed = buses.filter(b => b.status === 'Delayed').length
  const countMaintenance = buses.filter(b => b.status === 'Maintenance').length
  const countDepot = buses.filter(b => b.status === 'Depot').length

  const filtered = buses.filter(b =>
    (statusFilter === 'All' || b.status === statusFilter) &&
    (b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.route.includes(search) ||
      b.driver.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAddBus = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBus.id.trim()) return

    const created: Bus = {
      id: newBus.id.trim(),
      busNumber: newBus.id.trim(),
      route: newBus.route.trim() || '—',
      driver: newBus.driver.trim() || 'Unassigned',
      occ: newBus.status === 'Active' ? 25 : 0,
      occupancy: newBus.status === 'Active' ? 25 : 0,
      status: newBus.status,
      location: newBus.location.trim() || 'Depot',
      speed: newBus.status === 'Active' ? 32 : 0,
      speedKmH: newBus.status === 'Active' ? 32 : 0,
      type: newBus.type,
      from: newBus.route === '764' ? 'Dwarka Sec-21' : 'Central Depot',
      to: 'Connaught Place',
      nextStop: newBus.location.trim() || 'Central Depot',
      etaMinutes: newBus.status === 'Active' ? 6 : 0,
      lat: 28.6139,
      lng: 77.2090,
    }

    setBuses(prev => [created, ...prev])
    setShowAddModal(false)
    setNewBus({
      id: 'DL-1-BP-',
      route: '764',
      driver: '',
      type: 'AC Low Floor',
      location: 'Central Depot',
      status: 'Active',
    })
  }

  const handleConfirmRemoveBus = () => {
    if (!busToDelete) return
    setBuses(prev => prev.filter(b => b.id !== busToDelete.id))
    setBusToDelete(null)
  }

  const handleOpenAction = (bus: Bus, type: 'reassign' | 'alert' | 'details') => {
    setSelectedBus(bus)
    setActionType(type)
    setAlertSuccess(false)
    if (type === 'reassign') {
      setReassignData({
        route: bus.route === '—' ? '' : bus.route,
        status: bus.status,
        location: bus.location,
      })
    }
  }

  const handleSaveReassign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBus) return

    setBuses(prev =>
      prev.map(b => {
        if (b.id === selectedBus.id) {
          const newStatus = reassignData.status
          return {
            ...b,
            route: reassignData.route.trim() || '—',
            status: newStatus,
            location: reassignData.location.trim() || b.location,
            speed: newStatus === 'Active' ? (b.speed > 0 ? b.speed : 35) : 0,
            speedKmH: newStatus === 'Active' ? (b.speed > 0 ? b.speed : 35) : 0,
            nextStop: reassignData.location.trim() || b.nextStop,
          }
        }
        return b
      })
    )
    setActionType(null)
    setSelectedBus(null)
  }

  const handleSendAlert = () => {
    setAlertSuccess(true)
    setTimeout(() => {
      setActionType(null)
      setSelectedBus(null)
      setAlertSuccess(false)
    }, 1200)
  }

  return (
    <div className="w-full space-y-6 text-zinc-100 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Fleet Management</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            {buses.length} tracked buses · Live transit telemetry & dispatch bridge
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] hover:to-[#227beb] text-white text-xs font-bold shadow-[0_4px_14px_rgba(45,137,239,0.3)] transition cursor-pointer active:scale-95"
        >
          <span>+ Add Bus</span>
        </button>
      </div>

      {/* Metric Cards: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Active', val: countActive, color: '#10B981' },
          { label: 'Delayed', val: countDelayed, color: '#F59E0B' },
          { label: 'Maintenance', val: countMaintenance, color: '#EF4444' },
          { label: 'Depot', val: countDepot, color: '#2D89EF' },
        ].map(s => (
          <div
            key={s.label}
            className="bg-white/4 border rounded-2xl p-4 flex items-center justify-between hover:border-white/15 transition"
            style={{ borderColor: `${s.color}25` }}
          >
            <div>
              <div className="text-[10px] sm:text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
                {s.label}
              </div>
              <div className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: s.color }}>
                {s.val}
              </div>
            </div>
            <div
              className="size-10 sm:size-11 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0"
              style={{ backgroundColor: `${s.color}15`, border: `1px solid ${s.color}30` }}
            >
              🚌
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search bus ID, route, driver, location…"
          className="w-full sm:max-w-xs px-3.5 py-2 rounded-xl border border-white/10 bg-white/4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-[#2D89EF] transition"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 pb-1 sm:pb-0">
          {['All', 'Active', 'Delayed', 'Maintenance', 'Depot'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                statusFilter === s
                  ? 'border font-bold'
                  : 'bg-white/3 border border-white/8 text-zinc-400 hover:text-white'
              }`}
              style={
                statusFilter === s
                  ? {
                      borderColor: statusColor[s] || '#2D89EF',
                      backgroundColor: `${statusColor[s] || '#2D89EF'}15`,
                      color: statusColor[s] || '#2D89EF',
                    }
                  : undefined
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Table with Horizontal Scroll Wrapper */}
      <div className="bg-white/3 border border-white/7 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[840px]">
            <thead>
              <tr className="border-b border-white/6 bg-white/2">
                {['Bus ID', 'Route', 'Occupancy', 'Driver', 'Type', 'Location', 'Speed', 'Status', 'Actions'].map(h => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-zinc-400 text-xs">
                    No vehicles found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(bus => (
                  <tr key={bus.id} className="hover:bg-white/2 transition">
                    <td className="p-3 sm:px-4 sm:py-3.5 font-mono text-[11px] sm:text-xs text-[#2D89EF] font-semibold whitespace-nowrap">
                      {bus.id}
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 whitespace-nowrap">
                      <span className="bg-[#2D89EF]/15 text-[#2D89EF] px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono">
                        {bus.route}
                      </span>
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${bus.occ}%`,
                              backgroundColor: bus.occ > 80 ? '#EF4444' : bus.occ > 60 ? '#F59E0B' : '#10B981',
                            }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400">{bus.occ}%</span>
                      </div>
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 text-zinc-300 font-medium whitespace-nowrap">
                      {bus.driver}
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 text-zinc-400 text-[11px] whitespace-nowrap">
                      {bus.type}
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 text-zinc-300 whitespace-nowrap">
                      {bus.location}
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {bus.speed > 0 ? `${bus.speed} km/h` : '—'}
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 whitespace-nowrap">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          backgroundColor: `${statusColor[bus.status]}15`,
                          color: statusColor[bus.status],
                          borderColor: `${statusColor[bus.status]}30`,
                        }}
                      >
                        {bus.status}
                      </span>
                    </td>
                    <td className="p-3 sm:px-4 sm:py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {(['Reassign', 'Alert', 'Details'] as const).map(action => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => handleOpenAction(bus, action.toLowerCase() as any)}
                            className="px-2 py-1 rounded-lg border border-white/10 hover:border-white/25 bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white text-[10px] font-semibold transition cursor-pointer"
                          >
                            {action}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setBusToDelete(bus)}
                          className="px-2 py-1 rounded-lg border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold transition cursor-pointer active:scale-95"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {busToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1628] border border-rose-500/30 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-2">Remove Bus from Fleet?</h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-5">
              Decommissioning <strong className="text-[#2D89EF] font-mono">{busToDelete.id}</strong> will remove it from passenger radar feeds immediately.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBusToDelete(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveBus}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#f85151] hover:to-[#eb3434] text-white text-xs font-bold transition cursor-pointer shadow-md"
              >
                Yes, Remove Bus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bus Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1628] border border-white/12 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-4">Register New Fleet Vehicle</h3>
            <form onSubmit={handleAddBus} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Bus Registration ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-1-BP-620-K"
                  value={newBus.id}
                  onChange={e => setNewBus({ ...newBus, id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-[#2D89EF] transition font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Assigned Route</label>
                  <input
                    type="text"
                    placeholder="e.g. 764"
                    value={newBus.route}
                    onChange={e => setNewBus({ ...newBus, route: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white outline-none focus:border-[#2D89EF] transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Bus Type</label>
                  <select
                    value={newBus.type}
                    onChange={e => setNewBus({ ...newBus, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/12 bg-[#0d1d36] text-xs sm:text-sm text-white outline-none focus:border-[#2D89EF] transition"
                  >
                    <option value="AC Low Floor">AC Low Floor</option>
                    <option value="Non-AC">Non-AC</option>
                    <option value="Electric (EV)">Electric (EV)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Assigned Driver</label>
                <input
                  type="text"
                  placeholder="e.g. Anil Kumar"
                  value={newBus.driver}
                  onChange={e => setNewBus({ ...newBus, driver: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-[#2D89EF] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Initial Location</label>
                  <input
                    type="text"
                    value={newBus.location}
                    onChange={e => setNewBus({ ...newBus, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white outline-none focus:border-[#2D89EF] transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Status</label>
                  <select
                    value={newBus.status}
                    onChange={e => setNewBus({ ...newBus, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-white/12 bg-[#0d1d36] text-xs sm:text-sm text-white outline-none focus:border-[#2D89EF] transition"
                  >
                    <option value="Active">Active</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Depot">Depot</option>
                  </select>
                </div>
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
                  Add to Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Modals (Reassign / Alert / Details) */}
      {actionType && selectedBus && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1628] border border-white/12 rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {actionType === 'reassign' && (
              <form onSubmit={handleSaveReassign} className="space-y-3.5">
                <h3 className="text-base font-bold text-white mb-1">Reassign Vehicle</h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Updating assignments for <span className="text-[#2D89EF] font-mono font-semibold">{selectedBus.id}</span>
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Route Code</label>
                  <input
                    type="text"
                    value={reassignData.route}
                    onChange={e => setReassignData({ ...reassignData, route: e.target.value })}
                    placeholder="e.g. 764"
                    className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white outline-none focus:border-[#2D89EF] transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Vehicle Status</label>
                  <select
                    value={reassignData.status}
                    onChange={e => setReassignData({ ...reassignData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-white/12 bg-[#0d1d36] text-xs sm:text-sm text-white outline-none focus:border-[#2D89EF] transition"
                  >
                    <option value="Active">Active</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Depot">Depot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Current / Destination Station</label>
                  <input
                    type="text"
                    value={reassignData.location}
                    onChange={e => setReassignData({ ...reassignData, location: e.target.value })}
                    placeholder="e.g. Dhaula Kuan"
                    className="w-full px-3 py-2 rounded-xl border border-white/12 bg-white/5 text-xs sm:text-sm text-white outline-none focus:border-[#2D89EF] transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => { setActionType(null); setSelectedBus(null) }}
                    className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] hover:to-[#227beb] text-white text-xs font-bold transition cursor-pointer shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {actionType === 'alert' && (
              <div>
                <h3 className="text-base font-bold text-white mb-2">Dispatch Operational Alert</h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
                  Send speed and route adjustment notice to <strong className="text-white">{selectedBus.driver}</strong> on bus <strong className="text-[#2D89EF] font-mono">{selectedBus.id}</strong>.
                </p>
                {alertSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold text-center mb-4">
                    ✓ Alert Dispatched to Driver Unit!
                  </div>
                )}
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setActionType(null); setSelectedBus(null) }}
                    className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSendAlert}
                    disabled={alertSuccess}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#f85151] hover:to-[#eb3434] text-white text-xs font-bold transition cursor-pointer shadow-md"
                  >
                    Send Alert Now
                  </button>
                </div>
              </div>
            )}

            {actionType === 'details' && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-base font-bold text-white">Vehicle Telemetry Sheet</h3>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                    style={{
                      backgroundColor: `${statusColor[selectedBus.status]}15`,
                      color: statusColor[selectedBus.status],
                      borderColor: `${statusColor[selectedBus.status]}30`,
                    }}
                  >
                    {selectedBus.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                  {[
                    { label: 'Vehicle ID', val: selectedBus.id },
                    { label: 'Route', val: `Route ${selectedBus.route}` },
                    { label: 'Driver', val: selectedBus.driver },
                    { label: 'Model Type', val: selectedBus.type },
                    { label: 'GPS Location', val: selectedBus.location },
                    { label: 'Current Speed', val: selectedBus.speed > 0 ? `${selectedBus.speed} km/h` : 'Stationary' },
                    { label: 'Live Occupancy', val: `${selectedBus.occ}%` },
                    { label: 'Telemetry Link', val: 'Connected (99.8% QoS)' },
                  ].map(spec => (
                    <div key={spec.label} className="bg-white/3 p-3 rounded-xl border border-white/5">
                      <div className="text-[10px] text-zinc-400 font-medium mb-1">{spec.label}</div>
                      <div className={`text-xs text-white font-semibold ${spec.label.includes('ID') ? 'font-mono' : ''}`}>
                        {spec.val}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setActionType(null); setSelectedBus(null) }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2D89EF] to-[#1a6fd4] hover:from-[#3a94ff] hover:to-[#227beb] text-white text-xs font-bold transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}