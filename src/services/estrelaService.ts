import {
  atribuirEstrelaAoFoco,
  existeFocoComEstrela,
  existeSessaoDesde,
  getTotalMinutosByFocoId,
  removerEstrelaDoFoco,
} from '../repositories/focoRepository'
import { confirmacaoConfere, mascararFrase } from './confirmacaoReflexiva'
import { registrarLog } from './logService'
import { descreverMinutos } from '../utils/formatarHoras'

export const HORAS_MINIMAS_ESTRELA = 10
export const MINUTOS_MINIMOS_ESTRELA = HORAS_MINIMAS_ESTRELA * 60
export const TAMANHO_TOP = 3
export const POSICAO_APOS_REMOVER_ESTRELA = TAMANHO_TOP + 1
export const FRASE_REMOVER_ESTRELA = 'EU ESCOLHO MUDAR MINHA PRIORIDADE'

export interface FocoParaEstrela {
  id: string
  posicao: number | null
  resgatado_em: string | null
}

export interface CondicoesEstrela {
  posicao: number | null
  minutosAcumulados: number
  existeOutraEstrela: boolean
  praticadoAposResgate: boolean
}

export type AvaliacaoEstrela = { permitido: true } | { permitido: false; mensagem: string }

export interface ResultadoAcaoEstrela {
  sucesso: boolean
  mensagem: string
}

export function estaNoTop3(posicao: number | null): boolean {
  return posicao !== null && posicao >= 1 && posicao <= TAMANHO_TOP
}

export function avaliarAtribuicaoEstrela(condicoes: CondicoesEstrela): AvaliacaoEstrela {
  if (condicoes.existeOutraEstrela) {
    return {
      permitido: false,
      mensagem: 'Você já tem um Foco com a Estrela Dourada. Retire a Estrela dele antes de escolher outro.',
    }
  }

  if (!estaNoTop3(condicoes.posicao)) {
    return {
      permitido: false,
      mensagem: 'A Estrela Dourada só pode ir para um Foco entre os três primeiros da pilha.',
    }
  }

  if (condicoes.minutosAcumulados < MINUTOS_MINIMOS_ESTRELA) {
    const faltam = Math.ceil(MINUTOS_MINIMOS_ESTRELA - condicoes.minutosAcumulados)
    return {
      permitido: false,
      mensagem: `A Estrela Dourada exige ${HORAS_MINIMAS_ESTRELA} horas de foco. Faltam ${descreverMinutos(faltam)}.`,
    }
  }

  if (!condicoes.praticadoAposResgate) {
    return {
      permitido: false,
      mensagem: 'Este Foco voltou do Laboratório de Sonhos. Conclua uma sessão com ele antes de dar a Estrela.',
    }
  }

  return { permitido: true }
}

export function posicaoAposRemoverEstrela(totalAtivos: number): number {
  return Math.max(1, Math.min(POSICAO_APOS_REMOVER_ESTRELA, totalAtivos))
}

export function mascararFraseEstrela(texto: string): string {
  return mascararFrase(texto, FRASE_REMOVER_ESTRELA.length)
}

export function fraseRemoverEstrelaConfere(texto: string): boolean {
  return confirmacaoConfere(texto, FRASE_REMOVER_ESTRELA)
}

export async function verificarAtribuicaoEstrela(
  foco: FocoParaEstrela,
  userId: string
): Promise<AvaliacaoEstrela> {
  const [existeOutraEstrela, minutosAcumulados, praticadoAposResgate] = await Promise.all([
    existeFocoComEstrela(userId),
    getTotalMinutosByFocoId(foco.id),
    foco.resgatado_em ? existeSessaoDesde(foco.id, foco.resgatado_em) : Promise.resolve(true),
  ])

  return avaliarAtribuicaoEstrela({
    posicao: foco.posicao,
    minutosAcumulados,
    existeOutraEstrela,
    praticadoAposResgate,
  })
}

export async function atribuirEstrela(
  foco: FocoParaEstrela,
  userId: string
): Promise<ResultadoAcaoEstrela> {
  const avaliacao = await verificarAtribuicaoEstrela(foco, userId)

  if (!avaliacao.permitido) {
    return { sucesso: false, mensagem: avaliacao.mensagem }
  }

  await atribuirEstrelaAoFoco(foco.id)
  await registrarLog(userId, 'atribuir_estrela', { foco_id: foco.id })

  return { sucesso: true, mensagem: 'Este Foco agora é a sua prioridade.' }
}

export async function removerEstrela(
  focoId: string,
  userId: string,
  fraseDigitada: string,
  totalAtivos: number
): Promise<ResultadoAcaoEstrela> {
  if (!fraseRemoverEstrelaConfere(fraseDigitada)) {
    return { sucesso: false, mensagem: 'A frase digitada não confere.' }
  }

  const novaPosicao = posicaoAposRemoverEstrela(totalAtivos)

  await removerEstrelaDoFoco(focoId, novaPosicao)
  await registrarLog(userId, 'remover_estrela', { foco_id: focoId, nova_posicao: novaPosicao })

  return { sucesso: true, mensagem: 'A Estrela foi retirada. O Foco continua na sua pilha.' }
}