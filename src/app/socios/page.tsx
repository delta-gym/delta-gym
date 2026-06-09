'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSocios } from '@/lib/hooks'
import type { EstadoSocio } from '@/lib/firestore'

const estadoBadge: Record<EstadoSocio, string> = {
  activo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  inactivo: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  moroso: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      ))}
    </div>
  )
}

export default function SociosPage() {
  const { socios, loading, error } = useSocios()
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoSocio | 'todos'>('todos')

  const sociosFiltrados = socios.filter((s) => {
    const coincideBusqueda =
      s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.rut.includes(busqueda) ||
      s.qrCode.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === 'todos' || s.estado === filtroEstado
    return coincideBusqueda && coincideEstado
  })

  const exportarCSV = () => {
    const header = "Nombre;RUT;Email;Teléfono;Plan;Vencimiento;Estado;Deuda\n"
    const rows = sociosFiltrados.map(s => `"${s.nombre}";"${s.rut}";"${s.email}";"${s.telefono}";"${s.planActual}";${s.vencimiento};${s.estado};${s.montoPendiente}`).join("\n")
    const csvContent = "\uFEFF" + header + rows
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `socios_delta_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Socios</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Cargando...' : `${socios.length} socios registrados`}
          </p>
        </div>
        <Link
          href="/socios/nuevo"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg shadow-md transition font-medium text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Socio
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
          ⚠️ {error} —{' '}
          <Link href="/admin/seed" className="underline font-medium">
            ¿Faltan credenciales? Configura Firebase aquí
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Buscar por nombre, RUT o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-white"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoSocio | 'todos')}
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="moroso">Moroso</option>
        </select>
        <button onClick={exportarCSV} className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-6"><LoadingSkeleton /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Socio</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">RUT</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Vencimiento</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {sociosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      {error ? 'Error cargando socios' : 'No se encontraron socios'}
                    </td>
                  </tr>
                ) : (
                  sociosFiltrados.map((socio) => (
                    <tr key={socio.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{socio.nombre}</p>
                            <p className="text-xs text-slate-400">{socio.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{socio.rut}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{socio.planActual}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{socio.vencimiento}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${estadoBadge[socio.estado]}`}>
                          {socio.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/socios/${socio.id}`}
                            className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition"
                            title="Ver ficha"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </Link>
                          {socio.montoPendiente > 0 && (
                            <span className="text-xs text-red-500 font-medium">
                              Debe ${socio.montoPendiente.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
