import { getFocosByUserId, getTotalMinutosByFocoId, criarFoco } from '../repositories/focoRepository'
import type { Foco, NovoFoco } from '../repositories/focoRepository'
import { registrarLog } from './logService'

export interface FocoComProgresso extends Foco {
  horasAcumuladas: number
  porcentagem: number
}

export async function listarFocosComProgresso(userId: string): Promise<FocoComProgresso[]> {
  const focos = await getFocosByUserId(userId)

  const focosComProgresso = await Promise.all(
    focos.map(async (foco) => {
      const totalMinutos = await getTotalMinutosByFocoId(foco.id)
      const horasAcumuladas = totalMinutos / 60
      const porcentagem = foco.meta_horas > 0
        ? Math.min((horasAcumuladas / foco.meta_horas) * 100, 100)
        : 0

      return {
        ...foco,
        horasAcumuladas,
        porcentagem,
      }
    })
  )

  return focosComProgresso
}

export async function criarNovoFoco(userId: string, foco: NovoFoco): Promise<void> {
  await criarFoco(userId, foco)
  await registrarLog(userId, 'criar_foco', { titulo: foco.titulo })
}