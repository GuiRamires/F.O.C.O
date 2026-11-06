const PASSOS_EM_HORAS = [1, 2, 5, 10, 20, 50, 100]
const MAXIMO_DE_MARCAS = 5

export function descreverMinutos(minutos: number): string {
  const total = Math.max(0, Math.floor(minutos))
  const horas = Math.floor(total / 60)
  const resto = total % 60
  if (horas === 0) return `${resto} min`
  if (resto === 0) return `${horas} h`
  return `${horas} h ${resto} min`
}

export function marcasEmHoras(maximoMinutos: number): number[] {
  const maximoHoras = Math.max(1, Math.ceil(maximoMinutos / 60))
  const passo = PASSOS_EM_HORAS.find((candidato) => maximoHoras / candidato <= MAXIMO_DE_MARCAS) ?? maximoHoras
  const topo = Math.ceil(maximoHoras / passo) * passo
  const marcas: number[] = []
  for (let horas = 0; horas <= topo; horas += passo) {
    marcas.push(horas * 60)
  }
  return marcas
}
