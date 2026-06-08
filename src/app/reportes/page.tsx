'use client'

import { useSocios, usePagos } from '@/lib/hooks'

export default function ReportesPage() {
  const { socios } = useSocios()
  const { pagos } = usePagos()

  // 1. Estadísticas de Estados
  const activos = socios.filter((s) => s.estado === 'activo').length
  const morosos = socios.filter((s) => s.estado === 'moroso').length
  const inactivos = socios.filter((s) => s.estado === 'inactivo').length
  const totalSocios = socios.length

  // 2. Distribución de Planes
  const planesCount: Record<string, number> = {}
  socios.forEach((s) => {
    if (s.planActual) {
      planesCount[s.planActual] = (planesCount[s.planActual] || 0) + 1
    }
  })
  
  const planesData = Object.entries(planesCount).sort((a, b) => b[1] - a[1])
  const maxPlan = planesData.length > 0 ? planesData[0][1] : 1

  // 3. Ingresos Mensuales
  const ingresosPorMes: Record<string, number> = {}
  pagos.forEach((p) => {
    const mes = p.fecha.slice(0, 7) // YYYY-MM
    ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + p.monto
  })

  // Obtener los últimos 6 meses (para el gráfico)
  const meses = Object.keys(ingresosPorMes).sort().slice(-6)
  const maxIngreso = Math.max(...meses.map((m) => ingresosPorMes[m]), 1)

  const printReporte = () => {
    window.print()
  }

  // 4. Demografía
  const genderCount: Record<string, number> = { 'M': 0, 'F': 0, 'Otro': 0, 'No especificado': 0 }
  const ageRanges: Record<string, number> = { '< 18': 0, '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '55+': 0 }
  
  socios.forEach((s) => {
    // Género
    if (s.sexo) {
      genderCount[s.sexo] = (genderCount[s.sexo] || 0) + 1
    } else {
      genderCount['No especificado']++
    }
    // Edad
    if (s.fechaNacimiento) {
      const birth = new Date(s.fechaNacimiento)
      const now = new Date()
      let edad = now.getFullYear() - birth.getFullYear()
      if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
        edad--
      }
      if (edad < 18) ageRanges['< 18']++
      else if (edad <= 25) ageRanges['18-25']++
      else if (edad <= 35) ageRanges['26-35']++
      else if (edad <= 45) ageRanges['36-45']++
      else if (edad <= 55) ageRanges['46-55']++
      else ageRanges['55+']++
    }
  })

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Reportes y Estadísticas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Analiza el rendimiento de tu gimnasio</p>
        </div>
        <button 
          onClick={printReporte}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600 px-4 py-2.5 rounded-lg shadow-md transition font-medium text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
          Imprimir / Guardar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Distribución de Estados */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 print:border-none print:p-0">
          <h2 className="font-semibold text-lg mb-4">Estado de Socios</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-emerald-600">Activos ({activos})</span>
                <span className="text-slate-500">{Math.round((activos / (totalSocios || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${(activos / (totalSocios || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-red-500">Morosos ({morosos})</span>
                <span className="text-slate-500">{Math.round((morosos / (totalSocios || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(morosos / (totalSocios || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-500">Inactivos ({inactivos})</span>
                <span className="text-slate-500">{Math.round((inactivos / (totalSocios || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-slate-400 h-2.5 rounded-full" style={{ width: `${(inactivos / (totalSocios || 1)) * 100}%` }}></div>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-500">Total en base de datos: <span className="font-bold text-slate-800 dark:text-slate-200">{totalSocios}</span></p>
            </div>
          </div>
        </div>

        {/* Distribución de Planes (Bar Chart CSS) */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 print:border-none print:p-0">
          <h2 className="font-semibold text-lg mb-4">Distribución por Plan</h2>
          <div className="space-y-4">
            {planesData.map(([plan, count]) => {
              const porcentaje = Math.round((count / (maxPlan || 1)) * 100)
              return (
                <div key={plan} className="group relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium truncate pr-4">{plan}</span>
                    <span className="text-slate-500 shrink-0">{count} socios</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-r-lg h-6 overflow-hidden flex items-center relative">
                    <div 
                      className="bg-primary h-full transition-all duration-1000 ease-out" 
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute left-2 text-xs font-medium text-white mix-blend-difference transition-opacity">
                      {Math.round((count / totalSocios) * 100)}% del total
                    </div>
                  </div>
                </div>
              )
            })}
            {planesData.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">No hay planes registrados aún.</p>
            )}
          </div>
        </div>

        {/* Ingresos Históricos (Bar Chart CSS) */}
        <div className="md:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mt-2 print:border-none print:p-0 print:mt-8">
          <h2 className="font-semibold text-lg mb-6">Ingresos (Últimos 6 meses)</h2>
          
          <div className="flex items-end gap-2 sm:gap-6 h-64 border-b border-slate-200 dark:border-slate-700 pb-2">
            {meses.map((mes) => {
              const ingreso = ingresosPorMes[mes]
              const altura = Math.max((ingreso / maxIngreso) * 100, 1)
              
              // Formatear mes: "2024-05" -> "May"
              const dateObj = new Date(mes + '-02')
              const nombreMes = dateObj.toLocaleDateString('es-CL', { month: 'short' }).replace('.', '')

              return (
                <div key={mes} className="flex-1 flex flex-col justify-end items-center group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded transition-opacity whitespace-nowrap pointer-events-none z-10">
                    ${ingreso.toLocaleString()}
                  </div>
                  
                  <div 
                    className="w-full bg-indigo-500 hover:bg-indigo-400 rounded-t-sm transition-all duration-500"
                    style={{ height: `${altura}%`, minHeight: '4px' }}
                  ></div>
                  <span className="text-xs text-slate-500 mt-2 font-medium capitalize">{nombreMes}</span>
                </div>
              )
            })}
            
            {meses.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                No hay ingresos registrados para mostrar.
              </div>
            )}
          </div>
        </div>

        {/* Demografía: Género */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 print:border-none print:p-0">
          <h2 className="font-semibold text-lg mb-4">Distribución por Sexo</h2>
          <div className="space-y-4">
            {[
              { label: 'Masculino', count: genderCount['M'], color: 'bg-blue-500' },
              { label: 'Femenino', count: genderCount['F'], color: 'bg-pink-500' },
              { label: 'Otro / N/E', count: genderCount['Otro'] + genderCount['No especificado'], color: 'bg-slate-400' }
            ].map(g => (
              <div key={g.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{g.label} ({g.count})</span>
                  <span className="text-slate-500">{Math.round((g.count / (totalSocios || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                  <div className={`${g.color} h-2.5 rounded-full`} style={{ width: `${(g.count / (totalSocios || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demografía: Rango Etario */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 print:border-none print:p-0">
          <h2 className="font-semibold text-lg mb-4">Rango Etario</h2>
          <div className="flex items-end gap-2 h-40 border-b border-slate-200 dark:border-slate-700 pb-2">
            {Object.entries(ageRanges).map(([rango, count]) => {
              const maxAgeCount = Math.max(...Object.values(ageRanges), 1)
              const altura = Math.max((count / maxAgeCount) * 100, 1)
              
              return (
                <div key={rango} className="flex-1 flex flex-col justify-end items-center group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {count} socios
                  </div>
                  
                  <div 
                    className="w-full bg-orange-400 hover:bg-orange-300 rounded-t-sm transition-all duration-500"
                    style={{ height: `${altura}%`, minHeight: '4px' }}
                  ></div>
                  <span className="text-xs text-slate-500 mt-2 font-medium">{rango}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
