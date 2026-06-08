'use client'

import { useState, useRef } from 'react'
import { useSocios, useAccesosHoy } from '@/lib/hooks'
import { registrarAcceso } from '@/lib/firestore'
import { useAuth } from '@/components/auth/AuthProvider'

export default function QRPage() {
  const { gymId } = useAuth()
  const { socios } = useSocios()
  const { accesos } = useAccesosHoy()
  const [qrInput, setQrInput] = useState('')
  const [resultado, setResultado] = useState<null | { tipo: 'ok' | 'error' | 'vencido'; socio?: typeof socios[0]; mensaje: string }>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validarQR = async (codigo: string) => {
    const socio = socios.find((s) => s.qrCode === codigo.trim().toUpperCase())
    if (!socio) {
      setResultado({ tipo: 'error', mensaje: 'Código QR no encontrado en el sistema' })
      return
    }
    if (socio.estado === 'inactivo') {
      setResultado({ tipo: 'vencido', socio, mensaje: 'Membresía vencida — No autorizado' })
      return
    }
    if (socio.estado === 'moroso') {
      setResultado({ tipo: 'vencido', socio, mensaje: 'Socio moroso — Pago pendiente requerido' })
      return
    }
    // Registrar acceso en Firestore
    await registrarAcceso({
      socioId: socio.id!,
      socioNombre: socio.nombre,
      foto: socio.foto,
      timestamp: new Date().toISOString(),
      estadoMembresia: socio.estado,
      gymId: gymId || '',
    })
    setResultado({ tipo: 'ok', socio, mensaje: '✓ Acceso autorizado' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (qrInput.trim()) {
      await validarQR(qrInput)
      setQrInput('')
      setTimeout(() => {
        setResultado(null)
        inputRef.current?.focus()
      }, 4000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Control de Acceso por QR</h1>
        <p className="text-sm text-slate-500 mt-0.5">Escanea o ingresa el código QR del socio para validar su acceso</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-semibold">Lector de Código</h2>
            <p className="text-sm text-slate-500">Conecta un lector de código de barras o escribe el código manualmente. Los códigos de prueba son: SOC-001, SOC-002, SOC-003, SOC-004, SOC-005, SOC-006</p>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Escanear o tipear código QR..."
                autoFocus
                className="flex-1 px-3 py-3 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
              />
              <button type="submit" className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </button>
            </form>

            {/* Resultado */}
            {resultado && (
              <div className={`rounded-xl p-4 border-2 transition-all ${
                resultado.tipo === 'ok' ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-600' :
                resultado.tipo === 'vencido' ? 'bg-amber-50 border-amber-400 dark:bg-amber-900/30 dark:border-amber-600' :
                'bg-red-50 border-red-400 dark:bg-red-900/30 dark:border-red-600'
              }`}>
                {resultado.socio && (
                  <div className="flex items-center gap-3 mb-3">
                    <img src={resultado.socio.foto} alt={resultado.socio.nombre} className="w-12 h-12 rounded-full" />
                    <div>
                      <p className="font-bold">{resultado.socio.nombre}</p>
                      <p className="text-xs opacity-70">{resultado.socio.planActual} — vence {resultado.socio.vencimiento}</p>
                    </div>
                  </div>
                )}
                <p className={`font-semibold text-sm ${
                  resultado.tipo === 'ok' ? 'text-emerald-700 dark:text-emerald-400' :
                  resultado.tipo === 'vencido' ? 'text-amber-700 dark:text-amber-400' :
                  'text-red-700 dark:text-red-400'
                }`}>
                  {resultado.mensaje}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Log de accesos recientes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="font-semibold">Últimos Accesos del Día</h2>
          <div className="space-y-3">
            {accesos.map((acceso) => {
              const hace = Math.floor((Date.now() - new Date(acceso.timestamp).getTime()) / 60000)
              return (
                <div key={acceso.id} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <img src={acceso.foto} alt={acceso.socioNombre} className="w-9 h-9 rounded-full" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{acceso.socioNombre}</p>
                    <p className="text-xs text-slate-400">Hace {hace} minutos</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full font-medium">✓ OK</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
