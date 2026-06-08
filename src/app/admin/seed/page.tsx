'use client'

import { useState } from 'react'
import { seedFirestore } from '@/lib/seed-firestore'

export default function SeedPage() {
  const [estado, setEstado] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [log, setLog] = useState<string[]>([])

  const handleSeed = async () => {
    setEstado('running')
    setLog([])

    // Override console.log para capturar mensajes
    const originalLog = console.log
    console.log = (...args: unknown[]) => {
      setLog((prev) => [...prev, args.join(' ')])
      originalLog(...args)
    }

    try {
      await seedFirestore()
      setEstado('done')
    } catch (err) {
      setLog((prev) => [...prev, `❌ Error: ${err}`])
      setEstado('error')
    } finally {
      console.log = originalLog
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inicializar Base de Datos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ejecuta este proceso <strong>una sola vez</strong> para poblar Firestore con los datos de prueba.
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
        ⚠️ Asegúrate de haber completado el archivo <code className="font-mono bg-amber-100 dark:bg-amber-800 px-1 rounded">.env.local</code> con las credenciales de Firebase antes de continuar.
      </div>

      <button
        onClick={handleSeed}
        disabled={estado === 'running' || estado === 'done'}
        className={`w-full py-3 rounded-xl font-semibold transition text-white shadow-md ${
          estado === 'done' ? 'bg-emerald-500 cursor-not-allowed' :
          estado === 'running' ? 'bg-slate-400 cursor-not-allowed' :
          estado === 'error' ? 'bg-red-500 hover:bg-red-600' :
          'bg-primary hover:bg-primary/90'
        }`}
      >
        {estado === 'idle' && '🌱 Ejecutar Seed'}
        {estado === 'running' && '⏳ Cargando datos...'}
        {estado === 'done' && '✅ Datos cargados exitosamente'}
        {estado === 'error' && '❌ Error — Revisar credenciales'}
      </button>

      {log.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm space-y-1 text-slate-300">
          {log.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {estado === 'done' && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-sm text-emerald-800 dark:text-emerald-300">
          🎉 <strong>¡Listo!</strong> Ya puedes eliminar esta página (<code>/admin/seed</code>) o dejarla protegida. Los datos están en Firestore.
        </div>
      )}
    </div>
  )
}
