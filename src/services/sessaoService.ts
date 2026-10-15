export type EstadoSessao = 'rodando' | 'pausada' | 'concluida'

export interface Sessao {
  focoId: string
  duracaoMs: number
  inicioEm: number
  pausadaEm: number | null
  tempoPausadoMs: number
}

export function iniciarSessao(focoId: string, duracaoMinutos: number, agora: number): Sessao {
  return {
    focoId,
    duracaoMs: duracaoMinutos * 60 * 1000,
    inicioEm: agora,
    pausadaEm: null,
    tempoPausadoMs: 0,
  }
}

export function pausarSessao(sessao: Sessao, agora: number): Sessao {
  if (sessao.pausadaEm !== null) return sessao
  return { ...sessao, pausadaEm: agora }
}

export function retomarSessao(sessao: Sessao, agora: number): Sessao {
  if (sessao.pausadaEm === null) return sessao
  return {
    ...sessao,
    tempoPausadoMs: sessao.tempoPausadoMs + (agora - sessao.pausadaEm),
    pausadaEm: null,
  }
}

export function tempoDecorridoMs(sessao: Sessao, agora: number): number {
  const referencia = sessao.pausadaEm ?? agora
  return referencia - sessao.inicioEm - sessao.tempoPausadoMs
}

export function tempoRestanteMs(sessao: Sessao, agora: number): number {
  return Math.max(0, sessao.duracaoMs - tempoDecorridoMs(sessao, agora))
}

export function progressoSessao(sessao: Sessao, agora: number): number {
  return Math.min(1, tempoDecorridoMs(sessao, agora) / sessao.duracaoMs)
}

export function estadoDaSessao(sessao: Sessao, agora: number): EstadoSessao {
  if (tempoRestanteMs(sessao, agora) === 0) return 'concluida'
  if (sessao.pausadaEm !== null) return 'pausada'
  return 'rodando'
}

export function formatarTempo(ms: number): string {
  const totalSegundos = Math.ceil(ms / 1000)
  const horas = Math.floor(totalSegundos / 3600)
  const minutos = Math.floor((totalSegundos % 3600) / 60)
  const segundos = totalSegundos % 60
  return [horas, minutos, segundos].map((n) => String(n).padStart(2, '0')).join(':')
}