'use client'

import { useState } from 'react'
import { usePlanes, useSocios } from '@/lib/hooks'
import { createPlan, updatePlan, GYM_ID } from '@/lib/firestore'
import type { Plan } from '@/lib/firestore'

export default function PlanesPage() {
  const { planes, refetch: refetchPlanes } = usePlanes()
  const { socios } = useSocios()
  const [tab, setTab] = useState<'planes' | 'membresias'>('planes')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [form, setForm] = useState({ nombre: '', precio: 0, duracion: 30, activo: true })
  const [guardando, setGuardando] = useState(false)

  const sociosConPlan = socios.filter((s) => s.planActual)
  const hoy = new Date()

  const diasHastaVencimiento = (vencimiento: string) => {
    const diff = new Date(vencimiento).getTime() - hoy.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan)
      setForm({ nombre: plan.nombre, precio: plan.precio, duracion: plan.duracion, activo: plan.activo })
    } else {
      setEditingPlan(null)
      setForm({ nombre: '', precio: 0, duracion: 30, activo: true })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      if (editingPlan && editingPlan.id) {
        await updatePlan(editingPlan.id, { ...form })
      } else {
        await createPlan({ ...form, gymId: GYM_ID })
      }
      await refetchPlanes()
      setModalOpen(false)
    } catch (err) {
      alert('Error al guardar plan')
      console.error(err)
    } finally {
      setGuardando(false)
    }
  }

  const toggleStatus = async (plan: Plan) => {
    if (!plan.id) return
    if (confirm(`¿Seguro que deseas ${plan.activo ? 'desactivar' : 'activar'} este plan?`)) {
      try {
        await updatePlan(plan.id, { activo: !plan.activo })
        await refetchPlanes()
      } catch (err) {
        alert('Error al cambiar el estado del plan')
      }
    }
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Planes y Membresías</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona los planes disponibles y asigna membresías</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg shadow-md transition font-medium text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Plan
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
        <button
          onClick={() => setTab('planes')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition ${tab === 'planes' ? 'bg-white dark:bg-slate-700 shadow text-foreground' : 'text-slate-500 hover:text-foreground'}`}
        >
          Planes disponibles
        </button>
        <button
          onClick={() => setTab('membresias')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition ${tab === 'membresias' ? 'bg-white dark:bg-slate-700 shadow text-foreground' : 'text-slate-500 hover:text-foreground'}`}
        >
          Membresías activas
        </button>
      </div>

      {tab === 'planes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {planes.map((plan) => (
            <div key={plan.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-base">{plan.nombre}</h3>
                  <p className="text-sm text-slate-500">{plan.duracion} días</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${plan.activo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'}`}>
                  {plan.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="text-2xl font-bold text-primary">
                ${plan.precio.toLocaleString()} <span className="text-sm font-normal text-slate-400">CLP</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => openModal(plan)}
                  className="flex-1 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
                >
                  Editar
                </button>
                <button 
                  onClick={() => toggleStatus(plan)}
                  className={`flex-1 py-2 text-sm rounded-lg transition font-medium border ${plan.activo ? 'text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/30 dark:hover:bg-emerald-900/20'}`}
                >
                  {plan.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
          <button 
            onClick={() => openModal()}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary transition min-h-[160px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span className="text-sm font-medium">Crear nuevo plan</span>
          </button>
        </div>
      )}

      {tab === 'membresias' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Socio</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Vencimiento</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {sociosConPlan.map((socio) => {
                  const dias = diasHastaVencimiento(socio.vencimiento)
                  const urgente = dias <= 7 && dias > 0
                  const vencido = dias <= 0
                  return (
                    <tr key={socio.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={socio.foto} alt={socio.nombre} className="w-8 h-8 rounded-full" />
                          <span className="font-medium">{socio.nombre}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{socio.planActual}</td>
                      <td className="py-3 px-4">
                        <span className={urgente || vencido ? 'font-semibold text-red-500' : 'text-slate-600 dark:text-slate-300'}>
                          {socio.vencimiento}
                          {urgente && <span className="ml-2 text-xs">({dias}d)</span>}
                          {vencido && <span className="ml-2 text-xs">(vencido)</span>}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          socio.estado === 'activo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          socio.estado === 'moroso' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {socio.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition font-medium">Renovar</button>
                          <button className="text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">Congelar</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Crear/Editar Plan */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Plan</label>
                <input 
                  type="text" 
                  required 
                  value={form.nombre}
                  onChange={(e) => setForm({...form, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary/50 dark:bg-slate-700" 
                  placeholder="Ej: Pase Mensual"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio (CLP)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  value={form.precio}
                  onChange={(e) => setForm({...form, precio: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary/50 dark:bg-slate-700" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duración (Días)</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={form.duracion}
                  onChange={(e) => setForm({...form, duracion: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary/50 dark:bg-slate-700" 
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="activo"
                  checked={form.activo}
                  onChange={(e) => setForm({...form, activo: e.target.checked})}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="activo" className="text-sm font-medium">Plan activo (visible al registrar)</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={guardando}
                  className="flex-1 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg shadow-md transition font-medium disabled:opacity-60"
                >
                  {guardando ? 'Guardando...' : 'Guardar Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
