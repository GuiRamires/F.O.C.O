export const DIAS_PARA_AVISO = 14
export const DIAS_PARA_ARQUIVAMENTO = 30

const UM_DIA_MS = 24 * 60 * 60 * 1000

export interface FocoParaInatividade {
  status: string
  tem_estrela: boolean
  created_at: string
  resgatado_em: string | null
}

export interface SituacaoInatividade {
  diasInativo: number
  diasRestantes: number
  emAviso: boolean
}

export function inicioDaInatividade(foco: FocoParaInatividade, ultimaSessaoEm: string | null): number {
  return Math.max(
    Date.parse(foco.created_at),
    foco.resgatado_em ? Date.parse(foco.resgatado_em) : 0,
    ultimaSessaoEm ? Date.parse(ultimaSessaoEm) : 0,
  )
}

export function calcularInatividade(
  foco: FocoParaInatividade,
  ultimaSessaoEm: string | null,
  agora: number,
): SituacaoInatividade {
  const diasInativo = Math.max(Math.floor((agora - inicioDaInatividade(foco, ultimaSessaoEm)) / UM_DIA_MS), 0)
  const diasRestantes = Math.max(DIAS_PARA_ARQUIVAMENTO - diasInativo, 0)
  const sujeitoAoArquivamento = foco.status === 'ativo' && !foco.tem_estrela
  return { diasInativo, diasRestantes, emAviso: sujeitoAoArquivamento && diasInativo >= DIAS_PARA_AVISO }
}

export function textoDoAviso(situacao: SituacaoInatividade): string {
  if (situacao.diasRestantes === 0) {
    return `Sem prática há ${situacao.diasInativo} dias. Este Foco vai para o Laboratório de Sonhos na próxima verificação.`
  }
  const dias = situacao.diasRestantes === 1 ? '1 dia' : `${situacao.diasRestantes} dias`
  return `Sem prática há ${situacao.diasInativo} dias. Faça uma sessão para mantê-lo na pilha: faltam ${dias} para ir ao Laboratório de Sonhos.`
}
