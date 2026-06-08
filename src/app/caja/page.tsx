'use client'

import { useState } from 'react'
import { useSocios, usePagos, useGastos, useCajaSesion } from '@/lib/hooks'
import { createPago, createGasto, abrirCaja, cerrarCaja, GYM_ID, updateSocio } from '@/lib/firestore'

const metodos = ['Efectivo', 'Transferencia', 'Tarjeta']

export default function CajaPage() {
  const { socios, refetch: refetchSocios } = useSocios()
  const { pagos, refetch: refetchPagos } = usePagos()
  const { gastos, refetch: refetchGastos } = useGastos()
  const { sesion, refetch: refetchSesion } = useCajaSesion()

  const [tab, setTab] = useState<'caja' | 'registro' | 'egresos' | 'historial'>('caja')
  const [guardando, setGuardando] = useState(false)

  // Formularios
  const [formPago, setFormPago] = useState({ socioId: '', monto: '', metodo: 'Efectivo', notas: '' })
  const [formGasto, setFormGasto] = useState({ descripcion: '', monto: '', responsable: 'Admin' })
  const [formApertura, setFormApertura] = useState({ montoInicial: '0' })
  const [formCierre, setFormCierre] = useState({ montoFinal: '' })

  const handleAbrirCaja = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await abrirCaja({
        fechaApertura: new Date().toISOString(),
        montoInicial: Number(formApertura.montoInicial),
        responsableApertura: 'Admin',
        estado: 'abierta',
        gymId: GYM_ID
      })
      refetchSesion()
      alert('Caja abierta con éxito')
    } catch (err) {
      alert('Error al abrir caja: ' + err)
    } finally {
      setGuardando(false)
    }
  }

  const handleCerrarCaja = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sesion || !sesion.id) return
    setGuardando(true)
    try {
      // Calcular dinero teórico en caja
      const hoy = new Date().toISOString().split('T')[0]
      const ingresosEfectivo = pagos.filter(p => p.fecha === hoy && p.metodo === 'Efectivo').reduce((a, p) => a + p.monto, 0)
      const gastosEfectivo = gastos.filter(g => g.fecha === hoy).reduce((a, g) => a + g.monto, 0)
      const totalTeorico = sesion.montoInicial + ingresosEfectivo - gastosEfectivo
      const diferencia = Number(formCierre.montoFinal) - totalTeorico

      await cerrarCaja(sesion.id, {
        fechaCierre: new Date().toISOString(),
        montoFinal: Number(formCierre.montoFinal),
        diferencia,
        responsableCierre: 'Admin',
        estado: 'cerrada'
      })
      refetchSesion()
      alert(`Caja cerrada. Diferencia: $${diferencia}`)
    } catch (err) {
      alert('Error al cerrar caja: ' + err)
    } finally {
      setGuardando(false)
    }
  }

  const handleRegistrarPago = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sesion) {
      alert('Debes abrir la caja primero')
      return
    }
    const socio = socios.find((s) => s.id === formPago.socioId)
    if (!socio) return
    setGuardando(true)
    try {
      const monto = Number(formPago.monto)
      await createPago({
        socioId: socio.id!,
        socioNombre: socio.nombre,
        monto: monto,
        metodo: formPago.metodo as any,
        fecha: new Date().toISOString().split('T')[0],
        responsable: 'Admin',
        plan: socio.planActual,
        gymId: GYM_ID,
        notas: formPago.notas,
      })

      // Update debt if payment is less than debt
      if (socio.montoPendiente > 0) {
        const nuevaDeuda = Math.max(0, socio.montoPendiente - monto)
        await updateSocio(socio.id!, { montoPendiente: nuevaDeuda })
        refetchSocios()
      }

      alert('✅ Pago registrado')
      setFormPago({ socioId: '', monto: '', metodo: 'Efectivo', notas: '' })
      refetchPagos()
    } catch (err) {
      alert(`Error: ${err}`)
    } finally {
      setGuardando(false)
    }
  }

  const handleRegistrarGasto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sesion) {
      alert('Debes abrir la caja primero')
      return
    }
    setGuardando(true)
    try {
      await createGasto({
        descripcion: formGasto.descripcion,
        monto: Number(formGasto.monto),
        fecha: new Date().toISOString().split('T')[0],
        responsable: formGasto.responsable,
        gymId: GYM_ID
      })
      alert('✅ Gasto registrado')
      setFormGasto({ descripcion: '', monto: '', responsable: 'Admin' })
      refetchGastos()
    } catch (err) {
      alert(`Error: ${err}`)
    } finally {
      setGuardando(false)
    }
  }

  const exportarCSV = () => {
    const header = "Fecha;Socio;Plan;Método;Monto\n"
    const rows = pagos.map(p => `${p.fecha};"${p.socioNombre}";"${p.plan}";${p.metodo};${p.monto}`).join("\n")
    const csvContent = "\uFEFF" + header + rows // \uFEFF is the BOM for UTF-8 so Excel reads accents correctly
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `pagos_delta_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const imprimirBoleta = (pago: any) => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Recibo</title>
          <style>
            @page { size: letter; margin: 2cm; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; max-width: 800px; margin: auto; color: #333; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h2 { margin: 0; font-size: 28px; color: #1e293b; }
            .header p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
            .line { border-bottom: 2px solid #e2e8f0; margin: 30px 0; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .details p { margin: 10px 0; font-size: 16px; }
            .details strong { color: #475569; display: inline-block; width: 80px; }
            .total-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 30px; border-radius: 8px; text-align: center; }
            .total-box h3 { margin: 0; font-size: 32px; color: #0f172a; }
            .total-box p { margin: 10px 0 0 0; color: #64748b; font-size: 14px; }
            .footer { text-align: center; margin-top: 60px; color: #94a3b8; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Gimnasio Delta</h2>
            <p>Recibo Oficial de Pago</p>
          </div>
          
          <div class="details">
            <div>
              <p><strong>Fecha:</strong> ${pago.fecha}</p>
              <p><strong>Socio:</strong> ${pago.socioNombre}</p>
            </div>
            <div>
              <p><strong>Plan:</strong> ${pago.plan}</p>
              <p><strong>Método:</strong> ${pago.metodo}</p>
            </div>
          </div>

          <div class="total-box">
            <h3>Total Pagado: $${pago.monto.toLocaleString()}</h3>
            <p>Este comprobante certifica el pago de la membresía.</p>
          </div>

          <div class="footer">
            <p>¡Gracias por tu preferencia!</p>
            <p>Gimnasio Delta - Tu mejor versión empieza aquí.</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  const hoy = new Date().toISOString().split('T')[0]
  const ingresosHoy = pagos.filter((p) => p.fecha === hoy).reduce((acc, p) => acc + p.monto, 0)
  const egresosHoy = gastos.filter((g) => g.fecha === hoy).reduce((acc, g) => acc + g.monto, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cobros y Caja</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestión financiera y control diario</p>
        </div>
        {sesion ? (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Caja Abierta
          </span>
        ) : (
          <span className="px-3 py-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold flex items-center gap-2">
            Caja Cerrada
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit flex-wrap">
        {[
          { key: 'caja', label: 'Resumen y Caja' },
          { key: 'registro', label: 'Ingresos' },
          { key: 'egresos', label: 'Gastos' },
          { key: 'historial', label: 'Historial' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${tab === t.key ? 'bg-white dark:bg-slate-700 shadow text-foreground' : 'text-slate-500 hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'caja' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Apertura / Cierre */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="font-semibold mb-4 text-lg">Estado de Caja</h2>
              {!sesion ? (
                <form onSubmit={handleAbrirCaja} className="space-y-4">
                  <p className="text-sm text-slate-500">Para registrar ingresos y egresos, debes abrir la caja del día.</p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto Inicial (Sencillo)</label>
                    <input
                      type="number" required min="0" value={formApertura.montoInicial} onChange={e => setFormApertura({montoInicial: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700"
                    />
                  </div>
                  <button type="submit" disabled={guardando} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition disabled:opacity-50">
                    Abrir Caja
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCerrarCaja} className="space-y-4">
                  <div className="space-y-2 text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex justify-between"><span className="text-slate-500">Monto Inicial:</span> <span className="font-medium">${sesion.montoInicial.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-emerald-600">Ingresos Hoy:</span> <span className="font-medium">${ingresosHoy.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-red-500">Egresos Hoy:</span> <span className="font-medium">-${egresosHoy.toLocaleString()}</span></div>
                    <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold">
                      <span>Total Teórico en Caja:</span>
                      <span>${(sesion.montoInicial + ingresosHoy - egresosHoy).toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto Físico Real (Conteo)</label>
                    <input
                      type="number" required min="0" value={formCierre.montoFinal} onChange={e => setFormCierre({montoFinal: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-lg font-bold"
                    />
                  </div>
                  <button type="submit" disabled={guardando} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition disabled:opacity-50">
                    Cerrar Caja
                  </button>
                </form>
              )}
            </div>

            {/* Deudores */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col h-full">
              <h2 className="font-semibold mb-4 text-lg">Socios Morosos</h2>
              <div className="space-y-3 overflow-y-auto flex-1 max-h-64 pr-2">
                {socios.filter((s) => s.montoPendiente > 0).map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <img src={s.foto} alt={s.nombre} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-medium text-sm">{s.nombre}</p>
                        <p className="text-xs text-slate-400">Deuda: ${s.montoPendiente.toLocaleString()}</p>
                      </div>
                    </div>
                    <button onClick={() => { setTab('registro'); setFormPago(prev => ({...prev, socioId: s.id!, monto: String(s.montoPendiente) })) }} className="text-xs font-semibold text-primary hover:underline px-2 py-1 bg-primary/10 rounded">
                      Cobrar
                    </button>
                  </div>
                ))}
                {socios.filter((s) => s.montoPendiente > 0).length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No hay deudas pendientes 🎉</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'registro' && (
        <div className="max-w-xl">
          {!sesion && (
            <div className="bg-amber-100 text-amber-800 p-4 rounded-lg mb-4 text-sm font-medium">
              ⚠️ Debes abrir la caja antes de registrar pagos.
            </div>
          )}
          <form onSubmit={handleRegistrarPago} className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 ${!sesion ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="font-semibold text-base">Registrar Ingreso / Pago</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Socio *</label>
              <select
                name="socioId" value={formPago.socioId} onChange={e => setFormPago({...formPago, socioId: e.target.value})} required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Seleccionar socio...</option>
                {socios.map((s) => <option key={s.id} value={s.id}>{s.nombre} {s.montoPendiente > 0 ? `(Debe $${s.montoPendiente})` : ''}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto (CLP) *</label>
                <input
                  type="number" value={formPago.monto} onChange={e => setFormPago({...formPago, monto: e.target.value})} required min="1"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Método *</label>
                <select
                  value={formPago.metodo} onChange={e => setFormPago({...formPago, metodo: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {metodos.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas (opcional)</label>
              <textarea
                value={formPago.notas} onChange={e => setFormPago({...formPago, notas: e.target.value})} rows={2}
                placeholder="Ej: Pago parcial..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <button type="submit" disabled={guardando} className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition font-medium text-sm shadow-md disabled:opacity-50">
              Registrar Pago
            </button>
          </form>
        </div>
      )}

      {tab === 'egresos' && (
        <div className="max-w-xl">
          {!sesion && (
            <div className="bg-amber-100 text-amber-800 p-4 rounded-lg mb-4 text-sm font-medium">
              ⚠️ Debes abrir la caja antes de registrar gastos.
            </div>
          )}
          <form onSubmit={handleRegistrarGasto} className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 ${!sesion ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="font-semibold text-base text-red-600">Registrar Egreso (Gasto)</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción *</label>
              <input
                type="text" value={formGasto.descripcion} onChange={e => setFormGasto({...formGasto, descripcion: e.target.value})} required placeholder="Ej: Compra de agua, artículos de aseo..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto (CLP) *</label>
                <input
                  type="number" value={formGasto.monto} onChange={e => setFormGasto({...formGasto, monto: e.target.value})} required min="1"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsable</label>
                <input
                  type="text" value={formGasto.responsable} disabled
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-100 dark:bg-slate-600 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <button type="submit" disabled={guardando} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium text-sm shadow-md disabled:opacity-50">
              Registrar Gasto
            </button>
          </form>

          {gastos.filter(g => g.fecha === hoy).length > 0 && (
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-sm mb-3">Gastos de Hoy</h3>
              <div className="space-y-2">
                {gastos.filter(g => g.fecha === hoy).map(g => (
                  <div key={g.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <span>{g.descripcion}</span>
                    <span className="font-semibold text-red-500">-${g.monto.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'historial' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold">Historial de Pagos</h2>
            <button onClick={exportarCSV} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Socio</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Método</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Monto</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <td className="py-3 px-4 text-slate-500 text-xs">{pago.fecha}</td>
                    <td className="py-3 px-4 font-medium">{pago.socioNombre}</td>
                    <td className="py-3 px-4 text-slate-500">{pago.plan}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        pago.metodo === 'Efectivo' ? 'bg-green-100 text-green-700' :
                        pago.metodo === 'Transferencia' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {pago.metodo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">${pago.monto.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => imprimirBoleta(pago)} className="text-slate-500 hover:text-primary transition p-1" title="Imprimir Recibo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
