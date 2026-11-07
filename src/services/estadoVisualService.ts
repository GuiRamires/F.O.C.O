import { COR_PADRAO_FOCO } from './opcoesFoco'
import { estaNoTop3 } from './estrelaService'
import { STATUS_LABORATORIO } from './laboratorioService'

export type EstadoVisual = 'estrela' | 'top' | 'neutro' | 'laboratorio'

export interface FocoParaExibir {
  status: string
  tem_estrela: boolean
  posicao: number | null
  cor_hex: string | null
}

export function estadoVisualDoFoco(foco: FocoParaExibir): EstadoVisual {
  if (foco.status === STATUS_LABORATORIO) return 'laboratorio'
  if (foco.tem_estrela) return 'estrela'
  if (estaNoTop3(foco.posicao)) return 'top'
  return 'neutro'
}

export function corDoFocoNaPilha(foco: FocoParaExibir): string | null {
  if (estadoVisualDoFoco(foco) !== 'top') return null
  return foco.cor_hex ?? COR_PADRAO_FOCO
}
