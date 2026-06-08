// Mock data for socios
export type EstadoSocio = 'activo' | 'inactivo' | 'moroso'

export interface Socio {
  id: string
  nombre: string
  rut: string
  telefono: string
  email: string
  foto: string
  fechaIngreso: string
  estado: EstadoSocio
  planActual: string
  vencimiento: string
  observacionesMedicas: string
  qrCode: string
  ultimoPago: string
  montoPendiente: number
}

export const socios: Socio[] = [
  {
    id: '1',
    nombre: 'Valentina Rodríguez',
    rut: '12.345.678-9',
    telefono: '+56 9 1234 5678',
    email: 'valentina@email.com',
    foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Valentina',
    fechaIngreso: '2024-01-15',
    estado: 'activo',
    planActual: 'Mensual Premium',
    vencimiento: '2026-07-15',
    observacionesMedicas: 'Ninguna',
    qrCode: 'SOC-001',
    ultimoPago: '2026-06-15',
    montoPendiente: 0,
  },
  {
    id: '2',
    nombre: 'Diego Fernández',
    rut: '13.456.789-0',
    telefono: '+56 9 2345 6789',
    email: 'diego@email.com',
    foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Diego',
    fechaIngreso: '2023-08-20',
    estado: 'moroso',
    planActual: 'Trimestral',
    vencimiento: '2026-06-08',
    observacionesMedicas: 'Lesión de rodilla derecha',
    qrCode: 'SOC-002',
    ultimoPago: '2026-03-08',
    montoPendiente: 45000,
  },
  {
    id: '3',
    nombre: 'Catalina López',
    rut: '14.567.890-1',
    telefono: '+56 9 3456 7890',
    email: 'catalina@email.com',
    foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Catalina',
    fechaIngreso: '2025-02-01',
    estado: 'activo',
    planActual: 'Anual',
    vencimiento: '2027-02-01',
    observacionesMedicas: 'Ninguna',
    qrCode: 'SOC-003',
    ultimoPago: '2026-02-01',
    montoPendiente: 0,
  },
  {
    id: '4',
    nombre: 'Matías González',
    rut: '15.678.901-2',
    telefono: '+56 9 4567 8901',
    email: 'matias@email.com',
    foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Matias',
    fechaIngreso: '2024-05-10',
    estado: 'inactivo',
    planActual: 'Mensual',
    vencimiento: '2026-05-10',
    observacionesMedicas: 'Hipertensión controlada',
    qrCode: 'SOC-004',
    ultimoPago: '2026-05-10',
    montoPendiente: 0,
  },
  {
    id: '5',
    nombre: 'Sofía Morales',
    rut: '16.789.012-3',
    telefono: '+56 9 5678 9012',
    email: 'sofia@email.com',
    foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sofia',
    fechaIngreso: '2025-11-01',
    estado: 'activo',
    planActual: 'Mensual Premium',
    vencimiento: '2026-07-10',
    observacionesMedicas: 'Ninguna',
    qrCode: 'SOC-005',
    ultimoPago: '2026-06-10',
    montoPendiente: 0,
  },
  {
    id: '6',
    nombre: 'Ignacio Castillo',
    rut: '17.890.123-4',
    telefono: '+56 9 6789 0123',
    email: 'ignacio@email.com',
    foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ignacio',
    fechaIngreso: '2024-09-01',
    estado: 'moroso',
    planActual: 'Trimestral',
    vencimiento: '2026-06-09',
    observacionesMedicas: 'Ninguna',
    qrCode: 'SOC-006',
    ultimoPago: '2026-03-09',
    montoPendiente: 30000,
  },
]

export const planes = [
  { id: '1', nombre: 'Mensual', precio: 25000, duracion: 30, activo: true },
  { id: '2', nombre: 'Mensual Premium', precio: 35000, duracion: 30, activo: true },
  { id: '3', nombre: 'Trimestral', precio: 65000, duracion: 90, activo: true },
  { id: '4', nombre: 'Semestral', precio: 120000, duracion: 180, activo: true },
  { id: '5', nombre: 'Anual', precio: 220000, duracion: 365, activo: true },
]

export const pagos = [
  { id: '1', socioId: '1', socioNombre: 'Valentina Rodríguez', monto: 35000, metodo: 'Transferencia', fecha: '2026-06-15', responsable: 'Admin', plan: 'Mensual Premium' },
  { id: '2', socioId: '3', socioNombre: 'Catalina López', monto: 220000, metodo: 'Efectivo', fecha: '2026-06-01', responsable: 'Admin', plan: 'Anual' },
  { id: '3', socioId: '5', socioNombre: 'Sofía Morales', monto: 35000, metodo: 'Tarjeta', fecha: '2026-06-10', responsable: 'Admin', plan: 'Mensual Premium' },
  { id: '4', socioId: '2', socioNombre: 'Diego Fernández', monto: 65000, metodo: 'Efectivo', fecha: '2026-03-08', responsable: 'Admin', plan: 'Trimestral' },
  { id: '5', socioId: '6', socioNombre: 'Ignacio Castillo', monto: 65000, metodo: 'Transferencia', fecha: '2026-03-09', responsable: 'Admin', plan: 'Trimestral' },
]

export const accesos = [
  { id: '1', socioId: '1', socioNombre: 'Valentina Rodríguez', foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Valentina', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), estadoMembresia: 'activo' },
  { id: '2', socioId: '3', socioNombre: 'Catalina López', foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Catalina', timestamp: new Date(Date.now() - 25 * 60000).toISOString(), estadoMembresia: 'activo' },
  { id: '3', socioId: '5', socioNombre: 'Sofía Morales', foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sofia', timestamp: new Date(Date.now() - 40 * 60000).toISOString(), estadoMembresia: 'activo' },
]
