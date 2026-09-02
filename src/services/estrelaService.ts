import { getTotalMinutosByFocoId } from '../repositories/focoRepository'

const HORAS_MINIMAS = 10
const MINUTOS_MINIMOS = HORAS_MINIMAS * 60 // 600 minutos

export interface ResultadoTentativaEstrela {
  permitido: boolean
  mensagem: string
  horasAcumuladas: number
  horasFaltantes: number
}

export async function tentarAtribuirEstrela(focoId: string): Promise<ResultadoTentativaEstrela> {
  const totalMinutos = await getTotalMinutosByFocoId(focoId)
  const horasAcumuladas = totalMinutos / 60

  if (totalMinutos >= MINUTOS_MINIMOS) {
    return {
      permitido: true,
      mensagem: 'Estrela Dourada liberada! Este Foco já provou constância suficiente.',
      horasAcumuladas,
      horasFaltantes: 0,
    }
  }

  const minutosFaltantes = MINUTOS_MINIMOS - totalMinutos
  const horasFaltantes = minutosFaltantes / 60

  return {
    permitido: false,
    mensagem: `Ainda não é possível atribuir a Estrela Dourada. Faltam ${horasFaltantes.toFixed(1)}h de foco registrado neste card.`,
    horasAcumuladas,
    horasFaltantes,
  }
}