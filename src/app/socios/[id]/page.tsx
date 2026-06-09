import SocioDetailClient from './SocioDetailClient'

export default async function SocioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SocioDetailClient socioId={id} />
}
