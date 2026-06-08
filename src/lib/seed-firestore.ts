/**
 * Script de seed para poblar Firestore con los datos de prueba.
 * 
 * USO: Pegar este código en la consola del navegador (F12)
 * mientras el app está corriendo en http://localhost:3000
 * 
 * O ejecutar desde cualquier página de Next.js como función temporal.
 */

import { db } from './firebase'
import { collection, doc, addDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const GYM_ID = 'gym-delta'

export async function seedFirestore() {
  console.log('🌱 Iniciando seed de Firestore...')

  // Config del gimnasio (marca blanca)
  await setDoc(doc(db, 'gyms', GYM_ID), {
    nombre: 'Gimnasio Delta',
    logoUrl: '',
    primaryColor: '#2563eb',
    secondaryColor: '#475569',
    accentColor: '#f59e0b',
    sidebarBg: '#1e293b',
  })
  console.log('✅ Config de gym creada')

  // Planes
  const planesData = [
    { nombre: 'Mensual', precio: 25000, duracion: 30, activo: true, gymId: GYM_ID },
    { nombre: 'Mensual Premium', precio: 35000, duracion: 30, activo: true, gymId: GYM_ID },
    { nombre: 'Trimestral', precio: 65000, duracion: 90, activo: true, gymId: GYM_ID },
    { nombre: 'Semestral', precio: 120000, duracion: 180, activo: true, gymId: GYM_ID },
    { nombre: 'Anual', precio: 220000, duracion: 365, activo: true, gymId: GYM_ID },
  ]
  for (const plan of planesData) {
    await addDoc(collection(db, 'planes'), plan)
  }
  console.log('✅ Planes creados')

  // Socios
  const sociosData = [
    {
      nombre: 'Valentina Rodríguez', rut: '12.345.678-9', telefono: '+56 9 1234 5678',
      email: 'valentina@email.com', foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Valentina',
      fechaIngreso: '2024-01-15', estado: 'activo', planActual: 'Mensual Premium',
      vencimiento: '2026-07-15', observacionesMedicas: 'Ninguna', qrCode: 'SOC-001',
      ultimoPago: '2026-06-15', montoPendiente: 0, gymId: GYM_ID, creadoEn: serverTimestamp(),
    },
    {
      nombre: 'Diego Fernández', rut: '13.456.789-0', telefono: '+56 9 2345 6789',
      email: 'diego@email.com', foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Diego',
      fechaIngreso: '2023-08-20', estado: 'moroso', planActual: 'Trimestral',
      vencimiento: '2026-06-08', observacionesMedicas: 'Lesión de rodilla derecha', qrCode: 'SOC-002',
      ultimoPago: '2026-03-08', montoPendiente: 45000, gymId: GYM_ID, creadoEn: serverTimestamp(),
    },
    {
      nombre: 'Catalina López', rut: '14.567.890-1', telefono: '+56 9 3456 7890',
      email: 'catalina@email.com', foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Catalina',
      fechaIngreso: '2025-02-01', estado: 'activo', planActual: 'Anual',
      vencimiento: '2027-02-01', observacionesMedicas: 'Ninguna', qrCode: 'SOC-003',
      ultimoPago: '2026-02-01', montoPendiente: 0, gymId: GYM_ID, creadoEn: serverTimestamp(),
    },
    {
      nombre: 'Matías González', rut: '15.678.901-2', telefono: '+56 9 4567 8901',
      email: 'matias@email.com', foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Matias',
      fechaIngreso: '2024-05-10', estado: 'inactivo', planActual: 'Mensual',
      vencimiento: '2026-05-10', observacionesMedicas: 'Hipertensión controlada', qrCode: 'SOC-004',
      ultimoPago: '2026-05-10', montoPendiente: 0, gymId: GYM_ID, creadoEn: serverTimestamp(),
    },
    {
      nombre: 'Sofía Morales', rut: '16.789.012-3', telefono: '+56 9 5678 9012',
      email: 'sofia@email.com', foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sofia',
      fechaIngreso: '2025-11-01', estado: 'activo', planActual: 'Mensual Premium',
      vencimiento: '2026-07-10', observacionesMedicas: 'Ninguna', qrCode: 'SOC-005',
      ultimoPago: '2026-06-10', montoPendiente: 0, gymId: GYM_ID, creadoEn: serverTimestamp(),
    },
    {
      nombre: 'Ignacio Castillo', rut: '17.890.123-4', telefono: '+56 9 6789 0123',
      email: 'ignacio@email.com', foto: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ignacio',
      fechaIngreso: '2024-09-01', estado: 'moroso', planActual: 'Trimestral',
      vencimiento: '2026-06-09', observacionesMedicas: 'Ninguna', qrCode: 'SOC-006',
      ultimoPago: '2026-03-09', montoPendiente: 30000, gymId: GYM_ID, creadoEn: serverTimestamp(),
    },
  ]
  for (const socio of sociosData) {
    await addDoc(collection(db, 'socios'), socio)
  }
  console.log('✅ Socios creados')

  // Pagos
  const pagosData = [
    { socioNombre: 'Valentina Rodríguez', monto: 35000, metodo: 'Transferencia', fecha: '2026-06-15', responsable: 'Admin', plan: 'Mensual Premium', gymId: GYM_ID, creadoEn: serverTimestamp() },
    { socioNombre: 'Catalina López', monto: 220000, metodo: 'Efectivo', fecha: '2026-06-01', responsable: 'Admin', plan: 'Anual', gymId: GYM_ID, creadoEn: serverTimestamp() },
    { socioNombre: 'Sofía Morales', monto: 35000, metodo: 'Tarjeta', fecha: '2026-06-10', responsable: 'Admin', plan: 'Mensual Premium', gymId: GYM_ID, creadoEn: serverTimestamp() },
    { socioNombre: 'Diego Fernández', monto: 65000, metodo: 'Efectivo', fecha: '2026-03-08', responsable: 'Admin', plan: 'Trimestral', gymId: GYM_ID, creadoEn: serverTimestamp() },
    { socioNombre: 'Ignacio Castillo', monto: 65000, metodo: 'Transferencia', fecha: '2026-03-09', responsable: 'Admin', plan: 'Trimestral', gymId: GYM_ID, creadoEn: serverTimestamp() },
  ]
  for (const pago of pagosData) {
    await addDoc(collection(db, 'pagos'), pago)
  }
  console.log('✅ Pagos creados')

  console.log('🎉 ¡Seed completado! Firestore está listo.')
}
