'use client'

import { useState, useEffect } from 'react'
import { useGymConfig } from '@/components/GymProvider'
import { updateGymConfig, getStaff, createStaff, deleteStaff, Staff } from '@/lib/firestore'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth/AuthProvider'
import { createUserWithEmailAndPassword } from 'firebase/auth'

export default function ConfiguracionPage() {
  const { gymId } = useAuth()
  const { config, refetchConfig, loading: configLoading } = useGymConfig()
  const [tab, setTab] = useState<'marca' | 'general' | 'staff'>('marca')
  
  // Estado local para Marca Blanca
  const [colores, setColores] = useState({
    primary: '#2563eb', secondary: '#475569', accent: '#f59e0b', sidebarBg: '#1e293b'
  })
  const [gymNombre, setGymNombre] = useState('Gimnasio Delta')

  // Estado local para General
  const [general, setGeneral] = useState({
    direccion: '', telefono: '', whatsapp: '', emailSoporte: ''
  })

  // Estado para Staff
  const [staff, setStaff] = useState<Staff[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [formStaff, setFormStaff] = useState({ nombre: '', email: '', clave: '', rol: 'recepcionista' })

  const [guardando, setGuardando] = useState(false)

  // Cargar datos al montar
  useEffect(() => {
    if (config) {
      setGymNombre(config.nombre)
      setColores(config.colores || colores)
      setGeneral({
        direccion: config.direccion || '',
        telefono: config.telefono || '',
        whatsapp: config.whatsapp || '',
        emailSoporte: config.emailSoporte || ''
      })
    }
  }, [config])

  useEffect(() => {
    if (tab === 'staff') {
      fetchStaff()
    }
  }, [tab, gymId])

  const fetchStaff = async () => {
    if (!gymId) return
    setLoadingStaff(true)
    const data = await getStaff(gymId)
    setStaff(data)
    setLoadingStaff(false)
  }

  const handleColorChange = (key: string, value: string) => {
    setColores({ ...colores, [key]: value })
    const map: Record<string, string> = { primary: '--primary', secondary: '--secondary', accent: '--accent', sidebarBg: '--sidebar-bg' }
    document.documentElement.style.setProperty(map[key], value)
  }

  const guardarConfig = async () => {
    if (!gymId) return
    setGuardando(true)
    try {
      await updateGymConfig(gymId, {
        nombre: gymNombre,
        colores: colores,
        direccion: general.direccion,
        telefono: general.telefono,
        whatsapp: general.whatsapp,
        emailSoporte: general.emailSoporte
      })
      await refetchConfig()
      alert('Configuración guardada correctamente')
    } catch (err) {
      alert(`Error al guardar: ${err}`)
    } finally {
      setGuardando(false)
    }
  }

  const handleCrearStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (staff.length >= 2) {
      alert('Límite de empleados alcanzado (Máx. 2)')
      return
    }
    setGuardando(true)
    try {
      // 1. Crear usuario en Firebase Auth
      // Nota: En un entorno de producción, esto desloguearía al admin. 
      // Por ser un MVP, creamos la cuenta y se requerirá que el admin vuelva a iniciar sesión,
      // o usaremos una Firebase App secundaria si es necesario (omitido aquí por simplicidad).
      await createUserWithEmailAndPassword(auth, formStaff.email, formStaff.clave)
      
      // 2. Guardar en Firestore
      await createStaff({
        nombre: formStaff.nombre,
        email: formStaff.email,
        rol: formStaff.rol as 'admin' | 'recepcionista',
        estado: 'activo',
        gymId: gymId || ''
      })
      
      alert('Empleado creado con éxito. Por favor vuelve a iniciar sesión si el sistema te desconectó.')
      setFormStaff({ nombre: '', email: '', clave: '', rol: 'recepcionista' })
      fetchStaff()
    } catch (err: any) {
      alert(`Error al crear empleado: ${err.message}`)
    } finally {
      setGuardando(false)
    }
  }

  const eliminarEmpleado = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este empleado? Ya no podrá acceder al sistema.')) {
      await deleteStaff(id)
      fetchStaff()
    }
  }

  if (configLoading) return <div className="p-8">Cargando configuración...</div>

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
        <p className="text-sm text-slate-500 mt-0.5">Administra la identidad y personal del gimnasio</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setTab('marca')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === 'marca' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Marca Blanca
        </button>
        <button
          onClick={() => setTab('general')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === 'general' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Datos de Contacto
        </button>
        <button
          onClick={() => setTab('staff')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === 'staff' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Gestión de Staff
        </button>
      </div>

      {/* Tab: Marca Blanca */}
      {tab === 'marca' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-semibold">Identidad Visual</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Gimnasio</label>
              <input
                type="text"
                value={gymNombre}
                onChange={(e) => setGymNombre(e.target.value)}
                className="w-full max-w-md px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <h2 className="font-semibold mb-4">Colores del Sistema</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'primary', label: 'Color Primario', desc: 'Botones y acentos principales' },
                  { key: 'secondary', label: 'Color Secundario', desc: 'Textos y fondos suaves' },
                  { key: 'accent', label: 'Color de Acento', desc: 'Alertas y notificaciones' },
                  { key: 'sidebarBg', label: 'Fondo del Sidebar', desc: 'Menú lateral' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center gap-3">
                    <input
                      type="color"
                      value={(colores as any)[key]}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <button onClick={guardarConfig} disabled={guardando} className="bg-primary text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 transition">
            {guardando ? 'Guardando...' : 'Guardar Apariencia'}
          </button>
        </div>
      )}

      {/* Tab: General */}
      {tab === 'general' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="font-semibold">Información del Local</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dirección Física</label>
                <input
                  type="text"
                  value={general.direccion}
                  onChange={(e) => setGeneral({ ...general, direccion: e.target.value })}
                  placeholder="Ej: Av. Providencia 1234"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email de Soporte/Contacto</label>
                <input
                  type="email"
                  value={general.emailSoporte}
                  onChange={(e) => setGeneral({ ...general, emailSoporte: e.target.value })}
                  placeholder="contacto@gimnasio.cl"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono Fijo / Celular</label>
                <input
                  type="text"
                  value={general.telefono}
                  onChange={(e) => setGeneral({ ...general, telefono: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp (Para notificaciones)</label>
                <input
                  type="text"
                  value={general.whatsapp}
                  onChange={(e) => setGeneral({ ...general, whatsapp: e.target.value })}
                  placeholder="56912345678"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white"
                />
                <p className="text-xs text-slate-400 mt-1">Ingresa el número con código de país (ej. 569...)</p>
              </div>
            </div>
          </div>

          <button onClick={guardarConfig} disabled={guardando} className="bg-primary text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 transition">
            {guardando ? 'Guardando...' : 'Guardar Información'}
          </button>
        </div>
      )}

      {/* Tab: Staff */}
      {tab === 'staff' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Formulario nuevo empleado */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="font-semibold mb-4">Crear Nuevo Empleado</h2>
            <form onSubmit={handleCrearStaff} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="lg:col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Nombre</label>
                <input required type="text" value={formStaff.nombre} onChange={e => setFormStaff({...formStaff, nombre: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white" />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Correo Electrónico</label>
                <input required type="email" value={formStaff.email} onChange={e => setFormStaff({...formStaff, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white" />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Contraseña Temporal</label>
                <input required type="text" value={formStaff.clave} onChange={e => setFormStaff({...formStaff, clave: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white" />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Rol</label>
                <select value={formStaff.rol} onChange={e => setFormStaff({...formStaff, rol: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 dark:text-white">
                  <option value="recepcionista">Recepcionista</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="lg:col-span-1">
                <button type="submit" disabled={guardando} className="w-full bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition">
                  {guardando ? 'Creando...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
            <p className="text-xs text-slate-400 mt-3">Límite: 2 cuentas de empleado por suscripción.</p>
          </div>

          {/* Listado */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Correo</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Rol</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loadingStaff ? (
                  <tr><td colSpan={4} className="p-4 text-center text-slate-500">Cargando staff...</td></tr>
                ) : staff.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-slate-500">No hay empleados registrados.</td></tr>
                ) : (
                  staff.map(s => (
                    <tr key={s.id}>
                      <td className="py-3 px-4 font-medium">{s.nombre}</td>
                      <td className="py-3 px-4 text-slate-500">{s.email}</td>
                      <td className="py-3 px-4 capitalize">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${s.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {s.rol}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => eliminarEmpleado(s.id!)} className="text-red-500 hover:text-red-700 text-xs font-medium underline">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
