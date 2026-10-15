import { describe, it, expect } from 'vitest'
import {
  iniciarSessao,
  pausarSessao,
  retomarSessao,
  tempoDecorridoMs,
  tempoRestanteMs,
  progressoSessao,
  estadoDaSessao,
  formatarTempo,
} from './sessaoService'

const minutos = (n: number) => n * 60 * 1000
const INICIO = 1_000_000

describe('sessaoService', () => {
  it('converte a duração de minutos para milissegundos', () => {
    const sessao = iniciarSessao('foco-1', 25, INICIO)
    expect(sessao.duracaoMs).toBe(minutos(25))
  })

  it('calcula o tempo restante pelo relógio', () => {
    const sessao = iniciarSessao('foco-1', 25, INICIO)
    expect(tempoRestanteMs(sessao, INICIO + minutos(10))).toBe(minutos(15))
  })

  it('congela o tempo enquanto a sessão está pausada', () => {
    const sessao = iniciarSessao('foco-1', 25, INICIO)
    const pausada = pausarSessao(sessao, INICIO + minutos(10))
    expect(tempoRestanteMs(pausada, INICIO + minutos(18))).toBe(minutos(15))
  })

  it('não conta o tempo pausado: 25 min com 5 de pausa terminam em 30 min reais (CA20.3)', () => {
    let sessao = iniciarSessao('foco-1', 25, INICIO)
    sessao = pausarSessao(sessao, INICIO + minutos(10))
    sessao = retomarSessao(sessao, INICIO + minutos(15))

    expect(estadoDaSessao(sessao, INICIO + minutos(29))).toBe('rodando')
    expect(estadoDaSessao(sessao, INICIO + minutos(30))).toBe('concluida')
    expect(tempoDecorridoMs(sessao, INICIO + minutos(30))).toBe(minutos(25))
  })

  it('pausar duas vezes não altera a primeira pausa', () => {
    const sessao = iniciarSessao('foco-1', 25, INICIO)
    const pausada = pausarSessao(sessao, INICIO + minutos(5))
    const pausadaDeNovo = pausarSessao(pausada, INICIO + minutos(8))
    expect(pausadaDeNovo.pausadaEm).toBe(INICIO + minutos(5))
  })

  it('identifica os três estados da sessão', () => {
    const sessao = iniciarSessao('foco-1', 25, INICIO)
    expect(estadoDaSessao(sessao, INICIO + minutos(1))).toBe('rodando')
    expect(estadoDaSessao(pausarSessao(sessao, INICIO + minutos(1)), INICIO + minutos(2))).toBe('pausada')
    expect(estadoDaSessao(sessao, INICIO + minutos(25))).toBe('concluida')
  })

  it('nunca mostra tempo restante negativo', () => {
    const sessao = iniciarSessao('foco-1', 25, INICIO)
    expect(tempoRestanteMs(sessao, INICIO + minutos(40))).toBe(0)
  })

  it('calcula o progresso entre 0 e 1', () => {
    const sessao = iniciarSessao('foco-1', 20, INICIO)
    expect(progressoSessao(sessao, INICIO + minutos(5))).toBe(0.25)
    expect(progressoSessao(sessao, INICIO + minutos(60))).toBe(1)
  })

  it('formata o tempo como HH:MM:SS', () => {
    expect(formatarTempo(0)).toBe('00:00:00')
    expect(formatarTempo(minutos(25))).toBe('00:25:00')
    expect(formatarTempo(3_725_000)).toBe('01:02:05')
    expect(formatarTempo(400)).toBe('00:00:01')
  })
})