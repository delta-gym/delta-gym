import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type EstadoSocio = 'activo' | 'inactivo' | 'moroso'

export interface Socio {
  id?: string
  nombre: string
  rut: string
  telefono: string
  email: string
  foto: string
  fechaIngreso: string
  estado: EstadoSocio
  planActual: string
  vencimiento: string
  qrCode: string
  ultimoPago: string
  montoPendiente: number
  gymId: string
  sexo?: 'M' | 'F' | 'Otro'
  fechaNacimiento?: string
  creadoEn?: Timestamp
}

export interface GymConfig {
  id?: string
  nombre: string
  logo?: string
  direccion?: string
  telefono?: string
  whatsapp?: string
  emailSoporte?: string
  colores: {
    primary: string
    secondary: string
    accent: string
    sidebarBg: string
  }
}

export interface Staff {
  id?: string
  nombre: string
  email: string
  rol: 'admin' | 'recepcionista'
  estado: 'activo' | 'inactivo'
  gymId: string
  creadoEn?: Timestamp
}
export interface Plan {
  id?: string
  nombre: string
  precio: number
  duracion: number
  activo: boolean
  gymId: string
}

export interface Pago {
  id?: string
  socioId: string
  socioNombre: string
  monto: number
  metodo: 'Efectivo' | 'Transferencia' | 'Tarjeta'
  fecha: string
  responsable: string
  plan: string
  gymId: string
  notas?: string
  creadoEn?: Timestamp
}

export interface Acceso {
  id?: string
  socioId: string
  socioNombre: string
  foto: string
  timestamp: string
  estadoMembresia: EstadoSocio
  gymId: string
}

export interface Gasto {
  id?: string
  descripcion: string
  monto: number
  fecha: string
  responsable: string
  gymId: string
  creadoEn?: Timestamp
}

export interface CajaSesion {
  id?: string
  fechaApertura: string
  montoInicial: number
  fechaCierre?: string
  montoFinal?: number
  diferencia?: number
  responsableApertura: string
  responsableCierre?: string
  estado: 'abierta' | 'cerrada'
  gymId: string
}

// ─── Notas: Ya no hay GYM_ID global hardcodeado. Todas las funciones exigen gymId. ───

// ─── Socios ───────────────────────────────────────────────────────────────────

export async function getSocios(gymId: string): Promise<Socio[]> {
  const q = query(collection(db, 'socios'), where('gymId', '==', gymId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Socio))
}

export async function getSocio(id: string): Promise<Socio | null> {
  const snap = await getDoc(doc(db, 'socios', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Socio
}

export async function createSocio(data: Omit<Socio, 'id' | 'creadoEn'>): Promise<string> {
  const ref = await addDoc(collection(db, 'socios'), {
    ...data,
    creadoEn: serverTimestamp(),
  })
  return ref.id
}

export async function updateSocio(id: string, data: Partial<Socio>): Promise<void> {
  await updateDoc(doc(db, 'socios', id), data)
}

export async function deleteSocio(id: string): Promise<void> {
  await deleteDoc(doc(db, 'socios', id))
}

// ─── Planes ───────────────────────────────────────────────────────────────────

export async function getPlanes(gymId: string): Promise<Plan[]> {
  const q = query(collection(db, 'planes'), where('gymId', '==', gymId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Plan))
}

export async function createPlan(data: Omit<Plan, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'planes'), data)
  return ref.id
}

export async function updatePlan(id: string, data: Partial<Plan>): Promise<void> {
  await updateDoc(doc(db, 'planes', id), data)
}

// ─── Pagos ────────────────────────────────────────────────────────────────────

export async function getPagos(gymId: string): Promise<Pago[]> {
  const q = query(collection(db, 'pagos'), where('gymId', '==', gymId), orderBy('fecha', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Pago))
}

export async function createPago(data: Omit<Pago, 'id' | 'creadoEn'>): Promise<string> {
  const ref = await addDoc(collection(db, 'pagos'), {
    ...data,
    creadoEn: serverTimestamp(),
  })
  return ref.id
}

// ─── Caja y Gastos ────────────────────────────────────────────────────────────

export async function getGastos(gymId: string): Promise<Gasto[]> {
  const q = query(collection(db, 'gastos'), where('gymId', '==', gymId), orderBy('fecha', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Gasto))
}

export async function createGasto(data: Omit<Gasto, 'id' | 'creadoEn'>): Promise<string> {
  const ref = await addDoc(collection(db, 'gastos'), {
    ...data,
    creadoEn: serverTimestamp(),
  })
  return ref.id
}

export async function getCajaSesionAbierta(gymId: string): Promise<CajaSesion | null> {
  const q = query(collection(db, 'caja_sesiones'), where('gymId', '==', gymId), where('estado', '==', 'abierta'))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as CajaSesion
}

export async function abrirCaja(data: Omit<CajaSesion, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'caja_sesiones'), data)
  return ref.id
}

export async function cerrarCaja(id: string, data: Partial<CajaSesion>): Promise<void> {
  await updateDoc(doc(db, 'caja_sesiones', id), data)
}

// ─── Accesos ──────────────────────────────────────────────────────────────────
export async function getAccesosHoy(gymId: string): Promise<Acceso[]> {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const q = query(
    collection(db, 'accesos'),
    where('gymId', '==', gymId),
    where('timestamp', '>=', hoy.toISOString()),
    orderBy('timestamp', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Acceso))
}

export async function registrarAcceso(data: Omit<Acceso, 'id'>): Promise<void> {
  await addDoc(collection(db, 'accesos'), data)
}

// ─── Configuración y Marca Blanca ─────────────────────────────────────────────
export async function getGymConfig(gymId: string): Promise<GymConfig | null> {
  const snap = await getDoc(doc(db, 'gyms', gymId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as GymConfig
}

export async function updateGymConfig(gymId: string, data: Partial<GymConfig>): Promise<void> {
  await updateDoc(doc(db, 'gyms', gymId), data)
}

// ─── Staff ──────────────────────────────────────────────────────────────────
export async function getStaff(gymId: string): Promise<Staff[]> {
  const q = query(collection(db, 'staff'), where('gymId', '==', gymId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Staff))
}

export async function createStaff(data: Omit<Staff, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'staff'), {
    ...data,
    creadoEn: serverTimestamp(),
  })
  return ref.id
}

export async function updateStaff(id: string, data: Partial<Staff>): Promise<void> {
  await updateDoc(doc(db, 'staff', id), data)
}

export async function deleteStaff(id: string): Promise<void> {
  await deleteDoc(doc(db, 'staff', id))
}
