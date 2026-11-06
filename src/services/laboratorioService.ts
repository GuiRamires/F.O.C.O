import {
  arquivarFocoNoLaboratorio,
  excluirFocoDoLaboratorio,
  resgatarFocoDoLaboratorio,
} from '../repositories/focoRepository'
import { confirmacaoConfere, mascararFrase } from './confirmacaoReflexiva'
import { registrarLog } from './logService'

export const STATUS_ATIVO = 'ativo'
export const STATUS_LABORATORIO = 'laboratorio_sonhos'
export const PALAVRA_EXCLUIR_FOCO = 'DESISTIR'

export interface FocoDoLaboratorio {
  id: string
  titulo: string
  status: string
  tem_estrela: boolean
}

export type AvaliacaoLaboratorio = { permitido: true } | { permitido: false; mensagem: string }

export interface ResultadoLaboratorio {
  sucesso: boolean
  mensagem: string
}

export interface ResultadoResgate extends ResultadoLaboratorio {
  posicao: number | null
}

const PERMITIDO: AvaliacaoLaboratorio = { permitido: true }

export function avaliarArquivamento(foco: FocoDoLaboratorio): AvaliacaoLaboratorio {
  if (foco.status !== STATUS_ATIVO) {
    return { permitido: false, mensagem: 'Este Foco já está no Laboratório de Sonhos.' }
  }

  if (foco.tem_estrela) {
    return {
      permitido: false,
      mensagem: 'Para arquivar este Foco, retire a Estrela Dourada antes.',
    }
  }

  return PERMITIDO
}

export function avaliarResgate(foco: FocoDoLaboratorio): AvaliacaoLaboratorio {
  if (foco.status !== STATUS_LABORATORIO) {
    return { permitido: false, mensagem: 'Este Foco já está na sua pilha.' }
  }

  return PERMITIDO
}

export function avaliarExclusao(foco: FocoDoLaboratorio): AvaliacaoLaboratorio {
  if (foco.status !== STATUS_LABORATORIO) {
    return {
      permitido: false,
      mensagem: 'Só Focos do Laboratório de Sonhos podem ser excluídos. Arquive o Foco antes.',
    }
  }

  return PERMITIDO
}

export function aguardaPraticaAposResgate(
  foco: { status: string; resgatado_em: string | null },
  praticadoAposResgate: boolean
): boolean {
  return foco.status === STATUS_ATIVO && foco.resgatado_em !== null && !praticadoAposResgate
}

export function mascararPalavraExcluir(texto: string): string {
  return mascararFrase(texto, PALAVRA_EXCLUIR_FOCO.length)
}

export function palavraExcluirConfere(texto: string): boolean {
  return confirmacaoConfere(texto, PALAVRA_EXCLUIR_FOCO)
}

export async function arquivarFoco(foco: FocoDoLaboratorio, userId: string): Promise<ResultadoLaboratorio> {
  const avaliacao = avaliarArquivamento(foco)

  if (!avaliacao.permitido) {
    return { sucesso: false, mensagem: avaliacao.mensagem }
  }

  await arquivarFocoNoLaboratorio(foco.id)
  await registrarLog(userId, 'arquivar_foco', { foco_id: foco.id, titulo: foco.titulo })

  return { sucesso: true, mensagem: 'O Foco foi para o Laboratório de Sonhos. As horas dele continuam guardadas.' }
}

export async function resgatarFoco(foco: FocoDoLaboratorio, userId: string): Promise<ResultadoResgate> {
  const avaliacao = avaliarResgate(foco)

  if (!avaliacao.permitido) {
    return { sucesso: false, mensagem: avaliacao.mensagem, posicao: null }
  }

  const posicao = await resgatarFocoDoLaboratorio(foco.id)
  await registrarLog(userId, 'resgatar_foco', { foco_id: foco.id, titulo: foco.titulo, posicao })

  return { sucesso: true, mensagem: `O Foco voltou para a sua pilha, na ${posicao}ª posição.`, posicao }
}

export async function excluirFoco(
  foco: FocoDoLaboratorio,
  userId: string,
  palavraDigitada: string
): Promise<ResultadoLaboratorio> {
  const avaliacao = avaliarExclusao(foco)

  if (!avaliacao.permitido) {
    return { sucesso: false, mensagem: avaliacao.mensagem }
  }

  if (!palavraExcluirConfere(palavraDigitada)) {
    return { sucesso: false, mensagem: 'A palavra digitada não confere.' }
  }

  const excluido = await excluirFocoDoLaboratorio(foco.id)

  if (!excluido) {
    return { sucesso: false, mensagem: 'Este Foco não está mais no Laboratório de Sonhos. Atualize a página.' }
  }

  await registrarLog(userId, 'excluir_foco', { foco_id: foco.id, titulo: foco.titulo })

  return { sucesso: true, mensagem: 'O Foco foi excluído.' }
}
