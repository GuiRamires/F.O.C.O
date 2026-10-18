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

export const DURACAO_MINIMA_MINUTOS = 5
export const DURACAO_MAXIMA_MINUTOS = 180
export const ATALHOS_DURACAO_MINUTOS = [25, 50, 90]

export type ResultadoDuracao =
  | { valida: true; minutos: number }
  | { valida: false; mensagem: string }

export function converterHorasMinutos(texto: string): number | null {
  const partes = texto.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!partes) return null
  const horas = Number(partes[1])
  const minutos = Number(partes[2])
  if (minutos > 59) return null
  return horas * 60 + minutos
}

export function descreverDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (horas === 0) return `${resto} min`
  if (resto === 0) return `${horas} h`
  return `${horas} h ${resto} min`
}

export function validarDuracao(minutos: number): ResultadoDuracao {
  if (!Number.isInteger(minutos) || minutos < DURACAO_MINIMA_MINUTOS) {
    return {
      valida: false,
      mensagem: `A sessão precisa ter pelo menos ${DURACAO_MINIMA_MINUTOS} minutos.`,
    }
  }
  if (minutos > DURACAO_MAXIMA_MINUTOS) {
    return {
      valida: false,
      mensagem: `Sessões de até ${descreverDuracao(DURACAO_MAXIMA_MINUTOS)}. Para estudar mais, faça uma nova sessão depois de uma pausa.`,
    }
  }
  return { valida: true, minutos }
}

export function formatarHorasMinutos(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return `${String(horas).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
}

export function mascararHorasMinutos(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(-4).padStart(4, '0')
  return `${digitos.slice(0, 2)}:${digitos.slice(2)}`
}

export function validarTextoDuracao(texto: string): ResultadoDuracao {
  const minutos = converterHorasMinutos(texto)
  if (minutos === null) {
   return { valida: false, mensagem: 'Use HH:MM, com os minutos até 59. Exemplo: 01:30.' }
  }
  return validarDuracao(minutos)
}