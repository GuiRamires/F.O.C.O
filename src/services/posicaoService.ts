import { reordenarFocoNaPilha } from '../repositories/focoRepository'
import { STATUS_ATIVO } from './laboratorioService'
import { registrarLog } from './logService'

export interface FocoParaReordenar {
  id: string
  titulo: string
  status: string
  tem_estrela: boolean
  posicao: number | null
  aguardandoPratica: boolean
}

export interface SituacaoDaPilha {
  totalAtivos: number
  existeEstrela: boolean
}

export type AvaliacaoPosicao = { permitido: true } | { permitido: false; mensagem: string }

export interface ResultadoPosicao {
  sucesso: boolean
  mensagem: string
}

export const MENSAGEM_PRATICA_PENDENTE =
  'Este Foco voltou do Laboratório de Sonhos. Conclua uma sessão com ele para poder mudá-lo de posição.'

export function primeiraPosicaoLivre(pilha: SituacaoDaPilha): number {
  return pilha.existeEstrela ? 2 : 1
}

export function posicoesDaPilha(pilha: SituacaoDaPilha): number[] {
  return Array.from({ length: pilha.totalAtivos }, (_, indice) => indice + 1)
}

export function podeMudarDePosicao(foco: FocoParaReordenar, pilha: SituacaoDaPilha): boolean {
  if (foco.status !== STATUS_ATIVO || foco.tem_estrela) return false
  return pilha.totalAtivos - primeiraPosicaoLivre(pilha) + 1 >= 2
}

export function avaliarNovaPosicao(
  foco: FocoParaReordenar,
  novaPosicao: number,
  pilha: SituacaoDaPilha
): AvaliacaoPosicao {
  if (foco.status !== STATUS_ATIVO) {
    return { permitido: false, mensagem: 'Só Focos da pilha podem mudar de posição.' }
  }

  if (foco.tem_estrela) {
    return { permitido: false, mensagem: 'O Foco com a Estrela Dourada fica fixo na 1ª posição.' }
  }

  if (foco.aguardandoPratica) {
    return { permitido: false, mensagem: MENSAGEM_PRATICA_PENDENTE }
  }

  if (!Number.isInteger(novaPosicao) || novaPosicao < 1 || novaPosicao > pilha.totalAtivos) {
    return { permitido: false, mensagem: 'Escolha uma posição da sua pilha.' }
  }

  if (novaPosicao < primeiraPosicaoLivre(pilha)) {
    return { permitido: false, mensagem: 'A 1ª posição é do Foco com a Estrela Dourada.' }
  }

  if (novaPosicao === foco.posicao) {
    return { permitido: false, mensagem: 'O Foco já está nessa posição.' }
  }

  return { permitido: true }
}

export async function mudarPosicao(
  foco: FocoParaReordenar,
  novaPosicao: number,
  pilha: SituacaoDaPilha,
  userId: string
): Promise<ResultadoPosicao> {
  const avaliacao = avaliarNovaPosicao(foco, novaPosicao, pilha)

  if (!avaliacao.permitido) {
    return { sucesso: false, mensagem: avaliacao.mensagem }
  }

  await reordenarFocoNaPilha(foco.id, novaPosicao)
  await registrarLog(userId, 'reordenar_foco', {
    foco_id: foco.id,
    titulo: foco.titulo,
    de: foco.posicao,
    para: novaPosicao,
  })

  return { sucesso: true, mensagem: `O Foco foi para a ${novaPosicao}ª posição.` }
}
