import {
  getFocosByUserId,
  getTotalMinutosByFocoId,
  getUltimaSessaoByFocoId,
  existeSessaoDesde,
  criarFoco,
} from '../repositories/focoRepository'
import type { Foco, NovoFoco } from '../repositories/focoRepository'
import { aguardaPraticaAposResgate, STATUS_ATIVO } from './laboratorioService'
import { metaEhValida } from './opcoesFoco'
import { validarTextosDoFoco } from './textoFoco'
import { registrarLog } from './logService'
import { calcularInatividade, type SituacaoInatividade } from './inatividadeService'

export interface FocoComProgresso extends Foco {
  horasAcumuladas: number
  porcentagem: number
  aguardandoPratica: boolean
  inatividade: SituacaoInatividade
}

async function verificarPraticaAposResgate(foco: Foco): Promise<boolean> {
  if (foco.status !== STATUS_ATIVO || !foco.resgatado_em) return true
  return existeSessaoDesde(foco.id, foco.resgatado_em)
}

export async function listarFocosComProgresso(userId: string, agora = Date.now()): Promise<FocoComProgresso[]> {
  const focos = await getFocosByUserId(userId)
  const focosComProgresso = await Promise.all(
    focos.map(async (foco) => {
      const [totalMinutos, praticadoAposResgate, ultimaSessaoEm] = await Promise.all([
        getTotalMinutosByFocoId(foco.id),
        verificarPraticaAposResgate(foco),
        getUltimaSessaoByFocoId(foco.id),
      ])
      const horasAcumuladas = totalMinutos / 60
      const porcentagem = foco.meta_horas > 0 ? Math.min((horasAcumuladas / foco.meta_horas) * 100, 100) : 0
      const aguardandoPratica = aguardaPraticaAposResgate(foco, praticadoAposResgate)
      const inatividade = calcularInatividade(foco, ultimaSessaoEm, agora)
      return { ...foco, horasAcumuladas, porcentagem, aguardandoPratica, inatividade }
    })
  )
  return focosComProgresso
}

export function validarNovoFoco(foco: NovoFoco): string | null {
  const erroDeTexto = validarTextosDoFoco(foco.titulo, foco.observacoes)
  if (erroDeTexto) return erroDeTexto
  if (!metaEhValida(foco.meta_horas)) return 'Escolha uma das metas disponíveis.'
  return null
}

export async function criarNovoFoco(userId: string, foco: NovoFoco): Promise<void> {
  const erro = validarNovoFoco(foco)

  if (erro) {
    throw new Error(erro)
  }

  const titulo = foco.titulo.trim()
  const focoId = await criarFoco(userId, { titulo, meta_horas: foco.meta_horas, observacoes: foco.observacoes.trim() })
  await registrarLog(userId, 'criar_foco', { foco_id: focoId })
}
