'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export type GymRole = 'admin' | 'recepcionista'

type AuthContextType = {
  user: User | null
  gymId: string | null
  rol: GymRole | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  gymId: null,
  rol: null,
  loading: true,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [gymId, setGymId] = useState<string | null>(null)
  const [rol, setRol] = useState<GymRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid)
          const userSnap = await getDoc(userDocRef)
          
          if (userSnap.exists()) {
            const data = userSnap.data()
            setGymId(data.gymId)
            setRol(data.rol as GymRole)
          } else {
            // Usuario nuevo (Google Login) -> Asumir que es Admin de un nuevo gimnasio
            const newGymId = currentUser.uid // Su propio UID será el ID de su gimnasio
            await setDoc(userDocRef, {
              email: currentUser.email,
              gymId: newGymId,
              rol: 'admin'
            })
            // También creamos el config por defecto del gimnasio
            const gymRef = doc(db, 'gyms', newGymId)
            await setDoc(gymRef, {
              nombre: 'Mi Gimnasio',
              colores: {
                primary: '#2563eb',
                secondary: '#475569',
                accent: '#f59e0b',
                sidebarBg: '#1e293b',
              }
            }, { merge: true })

            setGymId(newGymId)
            setRol('admin')
          }
        } catch (error) {
          console.error("Error al obtener la información del usuario:", error)
          setGymId(null)
          setRol(null)
        }
      } else {
        setGymId(null)
        setRol(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const logout = async () => {
    try {
      await firebaseSignOut(auth)
      setGymId(null)
      setRol(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, gymId, rol, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
