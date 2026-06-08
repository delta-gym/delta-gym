export function cleanRut(rut: string): string {
  return typeof rut === 'string' ? rut.replace(/[^0-9kK]+/g, '').toUpperCase() : ''
}

export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut)
  if (!cleaned) return ''
  
  const dv = cleaned.slice(-1)
  const body = cleaned.slice(0, -1)
  
  if (!body) return dv
  
  return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv
}

export function validateRut(rut: string): boolean {
  const cleaned = cleanRut(rut)
  if (cleaned.length < 2) return false

  const dv = cleaned.slice(-1)
  const body = cleaned.slice(0, -1)

  let suma = 0
  let multiplo = 2

  for (let i = 1; i <= body.length; i++) {
    const index = multiplo * parseInt(body.charAt(body.length - i), 10)
    suma += index
    if (multiplo < 7) {
      multiplo += 1
    } else {
      multiplo = 2
    }
  }

  const dvEsperado = 11 - (suma % 11)
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString()

  return dv === dvCalculado
}
