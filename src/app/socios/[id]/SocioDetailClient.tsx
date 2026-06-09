'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Socio } from '@/lib/firestore'
import { updateSocio, createPago } from '@/lib/firestore'
import { usePlanes } from '@/lib/hooks'
import { useAuth } from '@/components/auth/AuthProvider'
import SeguimientoFisico from '@/components/socios/SeguimientoFisico'

const estadoConfig = {
  activo: { label: 'Activo', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  inactivo: { label: 'Inactivo', class: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
  moroso: { label: 'Moroso', class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
}

export default function SocioDetailClient({ socio }: { socio: Socio }) {
  const router = useRouter()
  const cfg = estadoConfig[socio.estado]
  const { gymId } = useAuth()
  
  const { planes } = usePlanes()
  const [modalRenovar, setModalRenovar] = useState(false)
  const [modalCongelar, setModalCongelar] = useState(false)
  const [planId, setPlanId] = useState('')
  const [metodoPago, setMetodoPago] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo')
  const [montoAbonar, setMontoAbonar] = useState<number | ''>('')
  const [diasCongelar, setDiasCongelar] = useState(7)
  const [guardando, setGuardando] = useState(false)
  const [activeTab, setActiveTab] = useState<'resumen' | 'fisico'>('resumen')

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setPlanId(id)
    const p = planes.find(x => x.id === id)
    if (p) setMontoAbonar(p.precio)
  }

  const handleRenovar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planId || !socio.id) return
    setGuardando(true)
    
    try {
      const plan = planes.find(p => p.id === planId)
      if (!plan) throw new Error('Plan no encontrado')

      const hoy = new Date().getTime()
      const currentVencimiento = new Date(socio.vencimiento).getTime()
      // Si ya está vencido, renueva desde hoy. Si no, suma a la fecha actual.
      const baseDate = currentVencimiento > hoy ? currentVencimiento : hoy
      const nuevaFecha = new Date(baseDate + plan.duracion * 86400000).toISOString().split('T')[0]
      const fechaPago = new Date().toISOString().split('T')[0]

      const abono = Number(montoAbonar) || 0
      const nuevaDeuda = socio.montoPendiente + plan.precio - abono

      await updateSocio(socio.id, {
        planActual: plan.nombre,
        vencimiento: nuevaFecha,
        estado: nuevaDeuda > 0 ? 'moroso' : 'activo',
        ultimoPago: abono > 0 ? fechaPago : socio.ultimoPago,
        montoPendiente: nuevaDeuda
      })

      if (abono > 0) {
        await createPago({
          socioId: socio.id,
          socioNombre: socio.nombre,
          monto: abono,
          metodo: metodoPago,
          fecha: fechaPago,
          responsable: 'Admin',
          plan: plan.nombre,
          gymId: gymId || '',
          notas: abono < plan.precio ? `Pago parcial. Valor del plan: $${plan.precio}` : ''
        })
      }

      setModalRenovar(false)
      router.refresh()
    } catch (err) {
      alert('Error al renovar: ' + err)
    } finally {
      setGuardando(false)
    }
  }

  const handleCongelar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!socio.id) return
    setGuardando(true)

    try {
      const currentVencimiento = new Date(socio.vencimiento).getTime()
      const nuevaFecha = new Date(currentVencimiento + diasCongelar * 86400000).toISOString().split('T')[0]
      
      await updateSocio(socio.id, { vencimiento: nuevaFecha })
      setModalCongelar(false)
      router.refresh()
    } catch (err) {
      alert('Error al congelar: ' + err)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Volver
      </button>
      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'resumen' 
              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('fisico')}
          className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'fisico' 
              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Seguimiento Físico
        </button>
      </div>

      {activeTab === 'resumen' ? (
        <>
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <img
              src={socio.foto}
              alt={socio.nombre}
              className="w-24 h-24 rounded-2xl bg-slate-100 shrink-0"
            />
            <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold">{socio.nombre}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.class}`}>{cfg.label}</span>
            </div>
            <p className="text-sm text-slate-500 font-mono">{socio.rut}</p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 9.8 19.79 19.79 0 0 1 1 1.18A2 2 0 0 1 2.96 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.3a16 16 0 0 0 5.61 5.61l1.37-1.17a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {socio.telefono}
              </span>
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {socio.email}
              </span>
              {socio.fechaNacimiento && (
                <span className="flex items-center gap-1.5" title="Fecha de nacimiento">
                  🎂 {new Date(socio.fechaNacimiento).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              )}
              {socio.sexo && (
                <span className="flex items-center gap-1.5" title="Sexo">
                  {socio.sexo === 'M' ? '♂️ Masculino' : socio.sexo === 'F' ? '♀️ Femenino' : '⚧ Otro'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Ingresó el {new Date(socio.fechaIngreso).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Membresía */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-slate-500">Membresía Actual</h2>
            <button 
              onClick={() => setModalCongelar(true)}
              className="text-xs text-slate-500 hover:text-primary transition underline"
            >
              Congelar Plan
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Plan</span>
              <span className="font-semibold">{socio.planActual}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vencimiento</span>
              <span className={`font-semibold ${socio.estado === 'moroso' ? 'text-red-500' : ''}`}>{socio.vencimiento}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Último Pago</span>
              <span className="font-medium">{socio.ultimoPago}</span>
            </div>
            {socio.montoPendiente > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Deuda pendiente</span>
                <span className="font-bold">${socio.montoPendiente.toLocaleString()}</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setModalRenovar(true)}
            className="w-full mt-2 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition font-medium"
          >
            Renovar Membresía
          </button>
        </div>

        {/* QR */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3 flex flex-col items-center opacity-50 pointer-events-none">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-slate-500 self-start">Código QR Personal</h2>
          <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-xs text-slate-400">
            <div className="text-center space-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto opacity-40"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
              <p>Próximamente</p>
            </div>
          </div>
          <button className="w-full py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium">
            Descargar QR
          </button>
        </div>
      </div>
      </>
      ) : (
        <SeguimientoFisico socioId={socio.id!} socioNombre={socio.nombre} />
      )}

      {/* Modal Renovar */}
      {modalRenovar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold">Renovar Membresía</h2>
              <button onClick={() => setModalRenovar(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleRenovar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Seleccionar Plan</label>
                <select 
                  required
                  value={planId}
                  onChange={handlePlanChange}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary/50 dark:bg-slate-700"
                >
                  <option value="">Selecciona un plan...</option>
                  {planes.filter(p => p.activo).map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} — ${p.precio.toLocaleString()} ({p.duracion} días)</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto a abonar hoy</label>
                  <input 
                    type="number"
                    min="0"
                    value={montoAbonar}
                    onChange={(e) => setMontoAbonar(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary/50 dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Método de Pago</label>
                  <select 
                    required
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary/50 dark:bg-slate-700"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalRenovar(false)} className="flex-1 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="flex-1 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg shadow-md font-medium disabled:opacity-60">
                  {guardando ? 'Guardando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Congelar */}
      {modalCongelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold">Congelar Plan</h2>
              <button onClick={() => setModalCongelar(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleCongelar} className="p-6 space-y-4">
              <p className="text-sm text-slate-500">El vencimiento actual es el <strong>{socio.vencimiento}</strong>. Al congelar, se sumarán los días indicados a esta fecha.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Días a congelar (extender)</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  max="365"
                  value={diasCongelar}
                  onChange={(e) => setDiasCongelar(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary/50 dark:bg-slate-700" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalCongelar(false)} className="flex-1 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="flex-1 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg shadow-md font-medium disabled:opacity-60">
                  {guardando ? 'Guardando...' : 'Aplicar congelamiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
