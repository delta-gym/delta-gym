'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSocios, getPlanes, getPagos, getAccesosHoy, getGastos, getCajaSesionAbierta } from './firestore'
import type { Socio, Plan, Pago, Acceso, Gasto, CajaSesion } from './firestore'
import { useAuth } from '@/components/auth/AuthProvider'

// ─── Hook: Socios ─────────────────────────────────────────────────────────────
export function useSocios() {
  const [socios, setSocios] = useState<Socio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { gymId, loading: authLoading } = useAuth()

  const fetch = useCallback(async () => {
    if (!gymId) return
    setLoading(true)
    try {
      const data = await getSocios(gymId)
      setSocios(data)
    } catch (e) {
      setError('Error al cargar socios. Revisa las credenciales de Firebase.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [gymId])

  useEffect(() => { 
    if (!authLoading) fetch() 
  }, [fetch, authLoading])
  
  return { socios, loading, error, refetch: fetch }
}

// ─── Hook: Planes ─────────────────────────────────────────────────────────────
export function usePlanes() {
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { gymId, loading: authLoading } = useAuth()

  const fetch = useCallback(async () => {
    if (!gymId) return
    setLoading(true)
    try {
      const data = await getPlanes(gymId)
      setPlanes(data)
    } catch (e) {
      setError('Error al cargar planes')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [gymId])

  useEffect(() => { 
    if (!authLoading) fetch() 
  }, [fetch, authLoading])
  
  return { planes, loading, error, refetch: fetch }
}

// ─── Hook: Pagos ──────────────────────────────────────────────────────────────
export function usePagos() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { gymId, loading: authLoading } = useAuth()

  const fetch = useCallback(async () => {
    if (!gymId) return
    setLoading(true)
    try {
      const data = await getPagos(gymId)
      setPagos(data)
    } catch (e) {
      setError('Error al cargar pagos')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [gymId])

  useEffect(() => { 
    if (!authLoading) fetch() 
  }, [fetch, authLoading])
  
  return { pagos, loading, error, refetch: fetch }
}

// ─── Hook: Accesos de hoy ─────────────────────────────────────────────────────
export function useAccesosHoy() {
  const [accesos, setAccesos] = useState<Acceso[]>([])
  const [loading, setLoading] = useState(true)
  const { gymId, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && gymId) {
      setLoading(true)
      getAccesosHoy(gymId)
        .then(setAccesos)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [gymId, authLoading])

  return { accesos, loading }
}

// ─── Hook: Gastos ─────────────────────────────────────────────────────────────
export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { gymId, loading: authLoading } = useAuth()

  const fetch = useCallback(async () => {
    if (!gymId) return
    setLoading(true)
    try {
      const data = await getGastos(gymId)
      setGastos(data)
    } catch (e) {
      setError('Error al cargar gastos')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [gymId])

  useEffect(() => { 
    if (!authLoading) fetch() 
  }, [fetch, authLoading])
  
  return { gastos, loading, error, refetch: fetch }
}

// ─── Hook: Caja Sesión ────────────────────────────────────────────────────────
export function useCajaSesion() {
  const [sesion, setSesion] = useState<CajaSesion | null>(null)
  const [loading, setLoading] = useState(true)
  const { gymId, loading: authLoading } = useAuth()

  const fetch = useCallback(async () => {
    if (!gymId) return
    setLoading(true)
    try {
      const data = await getCajaSesionAbierta(gymId)
      setSesion(data)
    } catch (e) {
      console.error('Error fetching caja sesion', e)
    } finally {
      setLoading(false)
    }
  }, [gymId])

  useEffect(() => { 
    if (!authLoading) fetch() 
  }, [fetch, authLoading])
  
  return { sesion, loading, refetch: fetch }
}
