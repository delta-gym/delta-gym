'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlanes } from '@/lib/hooks'
import { createSocio } from '@/lib/firestore'
import { useAuth } from '@/components/auth/AuthProvider'
import { formatRut, validateRut } from '@/lib/rut'

export default function NuevoSocioPage() {
  const router = useRouter()
  const { gymId } = useAuth()
  const { planes } = usePlanes()
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    rut: '',
    telefono: '',
    email: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    planId: '',
    sexo: '',
    fechaNacimiento: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let value = e.target.value
    if (e.target.name === 'rut') {
      value = formatRut(value)
    }
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateRut(form.rut)) {
      alert('El RUT ingresado no es válido. Por favor verifícalo.')
      return
    }

    if (!gymId) {
      alert('Error: No se pudo identificar el gimnasio actual.')
      return
    }

    setGuardando(true)
    try {
      const planSeleccionado = planes.find((p) => p.id === form.planId)
      const fechaVencimiento = planSeleccionado
        ? new Date(new Date(form.fechaIngreso).getTime() + planSeleccionado.duracion * 86400000)
            .toISOString().split('T')[0]
        : form.fechaIngreso
      await createSocio({
        nombre: form.nombre,
        rut: form.rut,
        telefono: form.telefono,
        email: form.email,
        foto: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(form.nombre)}`,
        fechaIngreso: form.fechaIngreso,
        estado: 'activo',
        planActual: planSeleccionado?.nombre ?? '',
        vencimiento: fechaVencimiento,
        qrCode: `SOC-${Date.now()}`,
        ultimoPago: '',
        montoPendiente: 0,
        gymId: gymId,
        sexo: form.sexo as 'M' | 'F' | 'Otro' | undefined,
        fechaNacimiento: form.fechaNacimiento || undefined,
      })
      router.push('/socios')
    } catch (err) {
      alert(`Error al registrar socio: ${err}`)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Socio</h1>
          <p className="text-sm text-slate-500">Completa los datos para registrar un socio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
        {/* Foto placeholder */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <button type="button" className="text-sm text-primary hover:underline font-medium">Subir foto</button>
            <p className="text-xs text-slate-400 mt-0.5">JPG, PNG. Máx 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Completo *</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez González"
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">RUT *</label>
            <input
              type="text"
              name="rut"
              value={form.rut}
              onChange={handleChange}
              required
              placeholder="12.345.678-9"
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="+56 9 1234 5678"
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="socio@email.com"
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sexo</label>
            <select
              name="sexo"
              value={form.sexo}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">No especificar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha de Nacimiento</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha de Ingreso *</label>
            <input
              type="date"
              name="fechaIngreso"
              value={form.fechaIngreso}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan Inicial</label>
            <select
              name="planId"
              value={form.planId}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Sin plan asignado</option>
              {planes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — ${p.precio.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="px-6 py-2.5 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg shadow-md transition font-medium disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Registrar Socio'}
          </button>
        </div>
      </form>
    </div>
  )
}
