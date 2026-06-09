'use client'

import { useState } from 'react'
import { useMediciones } from '@/lib/hooks'
import { createMedicion, deleteMedicion, Medicion } from '@/lib/firestore'
import { useAuth } from '@/components/auth/AuthProvider'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function SeguimientoFisico({ socioId, socioNombre }: { socioId: string; socioNombre: string }) {
  const { gymId } = useAuth()
  const { mediciones, refetch, loading } = useMediciones(socioId)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [guardando, setGuardando] = useState(false)
  
  const [form, setForm] = useState<Partial<Medicion>>({
    fecha: new Date().toISOString().split('T')[0],
    peso: 0,
    altura: 0,
    imc: 0,
    porcentajeGrasa: 0,
    pecho: 0,
    cintura: 0,
    cadera: 0,
    bicepsRelajado: 0,
    bicepsContraido: 0,
    muslo: 0,
    pantorrilla: 0
  })

  // Autofill altura based on last measurement
  const handleOpenModal = () => {
    let lastAltura = 0
    if (mediciones.length > 0) {
      lastAltura = mediciones[mediciones.length - 1].altura
    }
    setForm({
      fecha: new Date().toISOString().split('T')[0],
      peso: 0,
      altura: lastAltura,
      imc: 0,
      porcentajeGrasa: 0,
      pecho: 0,
      cintura: 0,
      cadera: 0,
      bicepsRelajado: 0,
      bicepsContraido: 0,
      muslo: 0,
      pantorrilla: 0
    })
    setModalOpen(true)
  }

  // Calculate IMC dynamically
  const handleChange = (field: keyof Medicion, value: number | string) => {
    const updated = { ...form, [field]: value }
    if (field === 'peso' || field === 'altura') {
      const p = Number(updated.peso)
      const a = Number(updated.altura)
      if (p > 0 && a > 0) {
        // Altura is expected in meters or cm? Let's assume cm for ease of input.
        const aMeters = a > 3 ? a / 100 : a // if > 3, it's probably cm
        updated.imc = Number((p / (aMeters * aMeters)).toFixed(2))
      } else {
        updated.imc = 0
      }
    }
    setForm(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gymId) return
    setGuardando(true)
    try {
      await createMedicion({
        ...form as Omit<Medicion, 'id' | 'creadoEn'>,
        socioId,
        gymId
      })
      await refetch()
      setModalOpen(false)
    } catch (err) {
      alert('Error al guardar medición')
      console.error(err)
    } finally {
      setGuardando(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta medición?')) return
    try {
      await deleteMedicion(id)
      await refetch()
    } catch (e) {
      alert('Error al eliminar')
    }
  }

  if (loading) return <div className="text-sm text-slate-500 p-5">Cargando mediciones...</div>

  // Prepare data for chart
  const chartData = mediciones.map(m => ({
    name: new Date(m.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    peso: m.peso,
    imc: m.imc
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Progreso de {socioNombre}</h2>
        <button
          onClick={handleOpenModal}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition shadow-sm"
        >
          + Nueva Medición
        </button>
      </div>

      {mediciones.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-500 mb-4">No hay mediciones registradas aún.</p>
          <button onClick={handleOpenModal} className="text-primary hover:underline font-medium">Registrar la primera medición</button>
        </div>
      ) : (
        <>
          {/* Chart Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-6">Evolución de Peso (kg)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="peso" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Peso</th>
                    <th className="px-4 py-3">IMC</th>
                    <th className="px-4 py-3">% Grasa</th>
                    <th className="px-4 py-3">Medidas (Pe-Ci-Ca)</th>
                    <th className="px-4 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {mediciones.map((m, idx) => {
                    const prev = idx > 0 ? mediciones[idx - 1] : null;
                    const diff = prev ? (m.peso - prev.peso).toFixed(1) : 0;
                    const isDown = Number(diff) < 0;
                    return (
                      <tr key={m.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-medium">{m.fecha}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span>{m.peso} kg</span>
                            {prev && Number(diff) !== 0 && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isDown ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {isDown ? '' : '+'}{diff}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{m.imc}</td>
                        <td className="px-4 py-3">{m.porcentajeGrasa ? `${m.porcentajeGrasa}%` : '-'}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {m.pecho || '-'}/{m.cintura || '-'}/{m.cadera || '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDelete(m.id!)} className="text-red-500 hover:text-red-700 text-xs font-medium">Borrar</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Nueva Medición */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Registrar Medición</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
                  <input type="date" required value={form.fecha} onChange={e => handleChange('fecha', e.target.value)} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm dark:bg-slate-900 dark:border-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-4 border border-slate-100 dark:border-slate-800">
                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Datos Principales</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Peso (kg)</label>
                    <input type="number" step="0.1" required value={form.peso || ''} onChange={e => handleChange('peso', e.target.value)} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm dark:bg-slate-900 dark:border-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Altura (cm)</label>
                    <input type="number" required value={form.altura || ''} onChange={e => handleChange('altura', e.target.value)} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm dark:bg-slate-900 dark:border-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-primary">IMC (Auto)</label>
                    <input type="number" disabled value={form.imc || ''} className="w-full rounded-lg border border-primary/30 bg-primary/5 p-2.5 text-sm font-bold text-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">% Grasa</label>
                    <input type="number" step="0.1" value={form.porcentajeGrasa || ''} onChange={e => handleChange('porcentajeGrasa', e.target.value)} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm dark:bg-slate-900 dark:border-slate-700" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-4 border border-slate-100 dark:border-slate-800">
                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Perímetros (cm)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Pecho</label>
                    <input type="number" step="0.1" value={form.pecho || ''} onChange={e => handleChange('pecho', e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:bg-slate-900 dark:border-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Cintura</label>
                    <input type="number" step="0.1" value={form.cintura || ''} onChange={e => handleChange('cintura', e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:bg-slate-900 dark:border-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Cadera</label>
                    <input type="number" step="0.1" value={form.cadera || ''} onChange={e => handleChange('cadera', e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:bg-slate-900 dark:border-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Bíceps (Relajado)</label>
                    <input type="number" step="0.1" value={form.bicepsRelajado || ''} onChange={e => handleChange('bicepsRelajado', e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:bg-slate-900 dark:border-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Bíceps (Contraído)</label>
                    <input type="number" step="0.1" value={form.bicepsContraido || ''} onChange={e => handleChange('bicepsContraido', e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:bg-slate-900 dark:border-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Muslo</label>
                    <input type="number" step="0.1" value={form.muslo || ''} onChange={e => handleChange('muslo', e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:bg-slate-900 dark:border-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Pantorrilla</label>
                    <input type="number" step="0.1" value={form.pantorrilla || ''} onChange={e => handleChange('pantorrilla', e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:bg-slate-900 dark:border-slate-700" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition disabled:opacity-50">
                  {guardando ? 'Guardando...' : 'Guardar Medición'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
