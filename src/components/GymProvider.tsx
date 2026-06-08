'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getGymConfig, GymConfig } from '@/lib/firestore'

interface GymContextType {
  config: GymConfig | null
  loading: boolean
  refetchConfig: () => Promise<void>
}

const GymContext = createContext<GymContextType>({
  config: null,
  loading: true,
  refetchConfig: async () => {},
})

const defaultConfig: GymConfig = {
  nombre: 'Gimnasio Delta',
  logo: '',
  direccion: '',
  telefono: '',
  whatsapp: '',
  emailSoporte: '',
  colores: {
    primary: '#2563eb',
    secondary: '#475569',
    accent: '#f59e0b',
    sidebarBg: '#1e293b',
  }
}

export function GymProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<GymConfig | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchConfig = async () => {
    try {
      const data = await getGymConfig()
      const finalConfig = data || defaultConfig
      setConfig(finalConfig)

      // Inyectar variables CSS globales
      if (finalConfig.colores) {
        document.documentElement.style.setProperty('--primary', finalConfig.colores.primary)
        document.documentElement.style.setProperty('--secondary', finalConfig.colores.secondary)
        document.documentElement.style.setProperty('--accent', finalConfig.colores.accent)
        document.documentElement.style.setProperty('--sidebar-bg', finalConfig.colores.sidebarBg)
      }
    } catch (err) {
      console.error('Error loading GymConfig:', err)
      setConfig(defaultConfig)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  return (
    <GymContext.Provider value={{ config, loading, refetchConfig: fetchConfig }}>
      {children}
    </GymContext.Provider>
  )
}

export const useGymConfig = () => useContext(GymContext)
