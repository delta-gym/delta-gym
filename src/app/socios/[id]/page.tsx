import { getSocio } from '@/lib/firestore'
import { notFound } from 'next/navigation'
import SocioDetailClient from './SocioDetailClient'

export default async function SocioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const socio = await getSocio(id)
  if (!socio) notFound()
  return <SocioDetailClient socio={socio} />
}
