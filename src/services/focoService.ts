import { getFocosByUserId, getTotalMinutosByFocoId, existeSessaoDesde, criarFoco } from '../repositories/focoRepository'
import type { Foco, NovoFoco } from '../repositories/focoRepository'
import { aguardaPraticaAposResgate, STATUS_ATIVO } from './laboratorioService'
import { registrarLog } from './logService'

export interface FocoComProgresso extends Foco {
  horasAcumuladas: number
  porcentagem: number
  aguardandoPratica: boolean
}

async function verificarPraticaAposResgate(foco: Foco): Promise<boolean> {
  if (foco.status !== STATUS_ATIVO || !foco.resgatado_em) return true
  return existeSessaoDesde(foco.id, foco.resgatado_em)
}

export async function listarFocosComProgresso(userId: string): Promise<FocoComProgresso[]> {
  const focos = await getFocosByUserId(userId)
  const focosComProgresso = await Promise.all(
    focos.map(async (foco) => {
      const [totalMinutos, praticadoAposResgate] = await Promise.all([
        getTotalMinutosByFocoId(foco.id),
        verificarPraticaAposResgate(foco),
      ])
      const horasAcumuladas = totalMinutos / 60
      const porcentagem = foco.meta_horas > 0 ? Math.min((horasAcumuladas / foco.meta_horas) * 100, 100) : 0
      const aguardandoPratica = aguardaPraticaAposResgate(foco, praticadoAposResgate)
      return { ...foco, horasAcumuladas, porcentagem, aguardandoPratica }
    })
  )
  return focosComProgresso
}

export async function criarNovoFoco(userId: string, foco: NovoFoco): Promise<void> {
  await criarFoco(userId, foco)
  await registrarLog(userId, 'criar_foco', { titulo: foco.titulo })
}
