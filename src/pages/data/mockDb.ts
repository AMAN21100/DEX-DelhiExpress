// ==========================================
// 1. MAIN DEX TRANSIT (Passenger & Admin)
// ==========================================

export type DexRole = 'admin' | 'passenger'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: DexRole
  phone?: string
  avatar?: string
}

export const MOCK_USERS: User[] = [
  {
    id: 'admin',
    name: 'Admin Officer',
    email: 'admin@123',
    password: '123',
    role: 'admin',
    phone: '+91 98765 43210',
  },
  {
    id: 'usr_pass_01',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    password: 'pass123',
    role: 'passenger',
    phone: '+91 98111 22334',
  },
  {
    id: 'usr_pass_02',
    name: 'Aman Yadav',
    email: 'aman@123',
    password: '123',
    role: 'passenger',
    phone: '+91 98999 88776',
  },
]

// ==========================================
// 2. DEDICATED DEX CARGO FLEET & LOGISTICS
// ==========================================

export type CargoRole =
  | 'Merchant / Shipper'
  | 'Depot Handler'
  | 'Fleet Operator / DTC Admin'
  | 'Commuter PUDO Pickup'

export interface CargoUser {
  id: string
  name: string
  email: string
  password: string
  cargoRole: CargoRole
  terminalNode?: string
  phone?: string
}

export const MOCK_CARGO_USERS: CargoUser[] = [
  {
    id: 'crg_merch',
    name: 'Delhi Retail Freight Consortium',
    email: 'merchant@123',
    password: '123',
    cargoRole: 'Merchant / Shipper',
    terminalNode: 'Sanjay Gandhi Transport Nagar',
    phone: '+91 98100 11223',
  },
  {
    id: 'crg_depot_01',
    name: 'Kashmere Gate Depot Dock Master',
    email: 'depot@123',
    password: '123',
    cargoRole: 'Depot Handler',
    terminalNode: 'Kashmere Gate Hub',
    phone: '+91 98200 44556',
  },
  {
    id: 'crg_fleet_01',
    name: 'DTC Electric Freight Operations',
    email: 'fleet@123',
    password: '123',
    cargoRole: 'Fleet Operator / DTC Admin',
    terminalNode: 'Central DTC SCADA',
    phone: '+91 98300 77889',
  },
  {
    id: 'crg_pudo_01',
    name: 'Smart Shelter PUDO Station Agent',
    email: 'pudo@123',
    password: '123',
    cargoRole: 'Commuter PUDO Pickup',
    terminalNode: 'Ring Road Shelter Bay A07',
    phone: '+91 98400 99001',
  },
]