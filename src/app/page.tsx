'use client'

import Link from 'next/link'
import { useSocios, usePagos } from '@/lib/hooks'

export default function DashboardPage() {
  const { socios } = useSocios()
  const { pagos } = usePagos()
  
  const hoy = new Date()
  const activos = socios.filter((s) => s.estado === 'activo').length
  const morosos = socios.filter((s) => s.estado === 'moroso').length
  
  // Ingresos mes actual vs anterior
  const mesActualStr = hoy.toISOString().slice(0, 7) // "YYYY-MM"
  const mesAnteriorDate = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
  const mesAnteriorStr = mesAnteriorDate.toISOString().slice(0, 7)

  const ingresosMesActual = pagos.filter(p => p.fecha.startsWith(mesActualStr)).reduce((a, p) => a + p.monto, 0)
  const ingresosMesAnterior = pagos.filter(p => p.fecha.startsWith(mesAnteriorStr)).reduce((a, p) => a + p.monto, 0)

  let porcentajeCrecimiento = 0
  if (ingresosMesAnterior > 0) {
    porcentajeCrecimiento = Math.round(((ingresosMesActual - ingresosMesAnterior) / ingresosMesAnterior) * 100)
  } else if (ingresosMesActual > 0) {
    porcentajeCrecimiento = 100 // Si antes no había y ahora sí
  }

  // Nuevos socios
  const nuevosSocios = socios.filter(s => s.fechaIngreso.startsWith(mesActualStr)).length

  // Vencimientos
  const proximosVencer = socios.filter((s) => {
    const diff = new Date(s.vencimiento).getTime() - hoy.getTime()
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return dias <= 7 && dias >= 0
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {hoy.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          {morosos > 0 && (
            <Link href="/socios" className="inline-flex items-center gap-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 px-4 py-2.5 rounded-lg shadow-sm transition font-medium text-sm animate-pulse">
              ⚠️ {morosos} Pagos Vencidos
            </Link>
          )}
          <Link
            href="/socios/nuevo"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg shadow-md transition font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Socio
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span className="text-sm text-slate-500 font-medium">Socios Activos</span>
          </div>
          <div className="text-3xl font-bold">{activos}</div>
          <div className="text-xs text-slate-400 mt-1">de {socios.length} totales</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <span className="text-sm text-slate-500 font-medium">Nuevos Este Mes</span>
          </div>
          <div className="text-3xl font-bold text-primary">{nuevosSocios}</div>
          <div className="text-xs text-slate-400 mt-1">inscritos recientemente</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span className="text-sm text-slate-500 font-medium">Ingresos (Mes)</span>
          </div>
          <div className="text-3xl font-bold text-indigo-600">${(ingresosMesActual / 1000).toFixed(0)}K</div>
          <div className={`text-xs mt-1 ${porcentajeCrecimiento >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {porcentajeCrecimiento >= 0 ? '↑' : '↓'} {Math.abs(porcentajeCrecimiento)}% vs mes anterior
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <span className="text-sm text-slate-500 font-medium">Próx. a Vencer</span>
          </div>
          <div className="text-3xl font-bold text-accent">{proximosVencer.length}</div>
          <div className="text-xs text-slate-400 mt-1">en los próximos 7 días</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de vencimiento */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Vencimientos Próximos (7 días)</h2>
            <Link href="/reportes" className="text-xs text-primary hover:underline">Ver métricas →</Link>
          </div>
          <div className="space-y-3">
            {proximosVencer.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Ningún vencimiento próximo 🎉</p>
            ) : (
              proximosVencer.map((s) => {
                const dias = Math.ceil((new Date(s.vencimiento).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
                const phone = s.telefono.replace(/\D/g, '')
                const msg = `Hola ${s.nombre}, te recordamos que tu plan ${s.planActual} en Gimnasio Delta vence en ${dias} días. ¡Te esperamos para renovar!`
                const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
                return (
                  <div key={s.id} className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                    <img src={s.foto} alt={s.nombre} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{s.nombre}</p>
                      <p className="text-xs text-slate-400">{s.planActual}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-sm font-bold text-accent">En {dias}d</p>
                      <a 
                        href={waLink}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-1 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900 mt-1 flex items-center gap-1 font-medium transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 9.8 19.79 19.79 0 0 1 1 1.18A2 2 0 0 1 2.96 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.3a16 16 0 0 0 5.61 5.61l1.37-1.17a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Morosos rápidos */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-red-600">Alerta de Pagos Pendientes</h2>
            <Link href="/socios" className="text-xs text-primary hover:underline">Ver todos →</Link>
          </div>
          <div className="space-y-3">
            {socios.filter((s) => s.estado === 'moroso').length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Sin deudas registradas 🎉</p>
            ) : (
              socios.filter((s) => s.estado === 'moroso').slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                  <img src={s.foto} alt={s.nombre} className="w-10 h-10 rounded-full grayscale opacity-80" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-700 dark:text-slate-200">{s.nombre}</p>
                    <p className="text-xs font-mono text-slate-500">{s.rut}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-500">Debe ${s.montoPendiente.toLocaleString()}</p>
                    <Link href={`/socios/${s.id}`} className="text-xs font-medium text-primary hover:underline mt-0.5 inline-block">Ver ficha</Link>
                  </div>
                </div>
              ))
            )}
            {socios.filter((s) => s.estado === 'moroso').length > 5 && (
              <p className="text-xs text-center text-slate-500 mt-2">
                Y otros {socios.filter((s) => s.estado === 'moroso').length - 5} morosos más...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/socios/nuevo', label: 'Nuevo Socio', icon: '👤', color: 'bg-primary/10 hover:bg-primary/20 text-primary' },
          { href: '/caja?tab=registro', label: 'Registrar Pago', icon: '💳', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
          { href: '/reportes', label: 'Reportes', icon: '📊', color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400' },
          { href: '/configuracion', label: 'Personalizar', icon: '🎨', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className={`p-4 rounded-xl flex flex-col items-center gap-2 transition font-medium text-sm text-center ${item.color}`}>
            <span className="text-2xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
