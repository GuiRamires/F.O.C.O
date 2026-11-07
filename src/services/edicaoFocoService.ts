import { atualizarFoco } from '../repositories/focoRepository'
import { STATUS_ATIVO } from './laboratorioService'
import { corEhDaPaleta, metaEhValida } from './opcoesFoco'
import { registrarLog } from './logService'

export interface FocoParaEditar {
  id: string
  titulo: string
  status: string
  meta_horas: number
  observacoes: string | null
  cor_hex: string | null
}

export interface DadosDaEdicao {
  titulo: string
  meta_horas: number
  observacoes: string
  cor_hex: string | null
}

export type AvaliacaoEdicao = { permitido: true } | { permitido: false; mensagem: string }

export interface ResultadoEdicao {
  sucesso: boolean
  mensagem: string
}

type CampoEditavel = 'titulo' | 'meta_horas' | 'observacoes' | 'cor_hex'

export function podeEditar(foco: FocoParaEditar): boolean {
  return foco.status === STATUS_ATIVO
}

export function normalizarEdicao(dados: DadosDaEdicao): DadosDaEdicao {
  return {
    titulo: dados.titulo.trim(),
    meta_horas: dados.meta_horas,
    observacoes: dados.observacoes.trim(),
    cor_hex: dados.cor_hex,
  }
}

export function camposAlterados(foco: FocoParaEditar, dados: DadosDaEdicao): CampoEditavel[] {
  const novos = normalizarEdicao(dados)
  const campos: CampoEditavel[] = []
  if (novos.titulo !== foco.titulo) campos.push('titulo')
  if (novos.meta_horas !== foco.meta_horas) campos.push('meta_horas')
  if (novos.observacoes !== (foco.observacoes ?? '')) campos.push('observacoes')
  if (novos.cor_hex !== foco.cor_hex) campos.push('cor_hex')
  return campos
}

export function avaliarEdicao(foco: FocoParaEditar, dados: DadosDaEdicao): AvaliacaoEdicao {
  if (!podeEditar(foco)) {
    return {
      permitido: false,
      mensagem: 'Focos do Laboratório de Sonhos não podem ser editados. Resgate o Foco antes.',
    }
  }

  const novos = normalizarEdicao(dados)

  if (!novos.titulo) {
    return { permitido: false, mensagem: 'O nome do F.O.C.O é obrigatório.' }
  }

  if (!metaEhValida(novos.meta_horas) && novos.meta_horas !== foco.meta_horas) {
    return { permitido: false, mensagem: 'Escolha uma das metas disponíveis.' }
  }

  if (!corEhDaPaleta(novos.cor_hex)) {
    return { permitido: false, mensagem: 'Escolha uma das cores da paleta.' }
  }

  return { permitido: true }
}

export async function editarFoco(foco: FocoParaEditar, dados: DadosDaEdicao, userId: string): Promise<ResultadoEdicao> {
  const avaliacao = avaliarEdicao(foco, dados)

  if (!avaliacao.permitido) {
    return { sucesso: false, mensagem: avaliacao.mensagem }
  }

  const alterados = camposAlterados(foco, dados)

  if (alterados.length === 0) {
    return { sucesso: true, mensagem: 'Nenhuma alteração para salvar.' }
  }

  const novos = normalizarEdicao(dados)
  const atualizado = await atualizarFoco(foco.id, {
    titulo: novos.titulo,
    meta_horas: novos.meta_horas,
    observacoes: novos.observacoes || null,
    cor_hex: novos.cor_hex,
  })

  if (!atualizado) {
    return { sucesso: false, mensagem: 'Este Foco não está mais na sua pilha. Atualize a página.' }
  }

  await registrarLog(userId, 'editar_foco', { foco_id: foco.id, titulo: novos.titulo, alteracoes: alterados })

  return { sucesso: true, mensagem: 'Foco atualizado.' }
}
