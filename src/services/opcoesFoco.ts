export interface OpcaoMeta {
  label: string
  horas: number
}

export interface CorDaPaleta {
  nome: string
  hex: string | null
}

export const OPCOES_META: OpcaoMeta[] = [
  { label: '1 semana (7 dias)', horas: 168 },
  { label: '2 semanas (14 dias)', horas: 336 },
  { label: '1 mês (30 dias)', horas: 720 },
  { label: '3 meses (90 dias)', horas: 2160 },
  { label: '6 meses (180 dias)', horas: 4320 },
  { label: '1 ano (365 dias)', horas: 8760 },
]

export const COR_PADRAO_FOCO = '#008CFF'

export const PALETA_FOCO: CorDaPaleta[] = [
  { nome: 'Azul (padrão)', hex: null },
  { nome: 'Roxo', hex: '#9B5CFF' },
  { nome: 'Verde', hex: '#22C55E' },
  { nome: 'Ciano', hex: '#14B8A6' },
  { nome: 'Rosa', hex: '#EC4899' },
]

export function metaEhValida(horas: number): boolean {
  return OPCOES_META.some((opcao) => opcao.horas === horas)
}

export function corEhDaPaleta(hex: string | null): boolean {
  return PALETA_FOCO.some((cor) => cor.hex === hex)
}
