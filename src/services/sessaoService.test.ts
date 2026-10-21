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
  converterHorasMinutos,
  descreverDuracao,
  validarDuracao,
  ATALHOS_DURACAO_MINUTOS,
  formatarHorasMinutos,
  mascararHorasMinutos,
  validarTextoDuracao,
  sessaoAoReabrir,

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

describe('duração da sessão', () => {
  it('converte HH:MM em minutos', () => {
    expect(converterHorasMinutos('00:50')).toBe(50)
    expect(converterHorasMinutos('1:30')).toBe(90)
    expect(converterHorasMinutos(' 02:00 ')).toBe(120)
  })

  it('recusa textos fora do formato', () => {
    expect(converterHorasMinutos('01:75')).toBeNull()
    expect(converterHorasMinutos('abc')).toBeNull()
    expect(converterHorasMinutos('')).toBeNull()
    expect(converterHorasMinutos('1:5')).toBeNull()
  })

  it('aceita os limites exatos de 5 e 180 minutos', () => {
    expect(validarDuracao(5).valida).toBe(true)
    expect(validarDuracao(180).valida).toBe(true)
  })

  it('recusa menos de 5 minutos', () => {
    const resultado = validarDuracao(4)
    expect(resultado.valida).toBe(false)
  })

  it('recusa mais de 3 horas com a mensagem de pausa', () => {
    const resultado = validarDuracao(181)
    expect(resultado.valida).toBe(false)
    if (!resultado.valida) {
      expect(resultado.mensagem).toContain('até 3 h')
    }
  })

  it('todos os atalhos são durações válidas', () => {
    for (const minutos of ATALHOS_DURACAO_MINUTOS) {
      expect(validarDuracao(minutos).valida).toBe(true)
    }
  })

  it('descreve a duração de forma legível', () => {
    expect(descreverDuracao(50)).toBe('50 min')
    expect(descreverDuracao(60)).toBe('1 h')
    expect(descreverDuracao(90)).toBe('1 h 30 min')
  })

  

  it('formata minutos como HH:MM', () => {
  expect(formatarHorasMinutos(25)).toBe('00:25')
  expect(formatarHorasMinutos(90)).toBe('01:30')
  expect(formatarHorasMinutos(180)).toBe('03:00')
})

it('formatar e converter fazem o caminho de ida e volta', () => {
  for (const minutos of ATALHOS_DURACAO_MINUTOS) {
    expect(converterHorasMinutos(formatarHorasMinutos(minutos))).toBe(minutos)
  }
})

it('a máscara funciona como um timer: os dígitos entram pela direita', () => {
  expect(mascararHorasMinutos('5')).toBe('00:05')
  expect(mascararHorasMinutos('130')).toBe('01:30')
  expect(mascararHorasMinutos('01:305')).toBe('13:05')
  expect(mascararHorasMinutos('01:3')).toBe('00:13')
  expect(mascararHorasMinutos('')).toBe('00:00')
})

it('valida o texto digitado: formato errado, fora do limite e válido', () => {
  expect(validarTextoDuracao('1h30').valida).toBe(false)
  expect(validarTextoDuracao('00:04').valida).toBe(false)
  expect(validarTextoDuracao('01:30')).toEqual({ valida: true, minutos: 90 })
})
  
})



describe('reabertura do app', () => {
  it('pausa a sessão no último sinal: o tempo com o app fechado não conta', () => {
    const sessao = iniciarSessao('foco-1', 25, INICIO)
    const reaberta = sessaoAoReabrir(sessao, INICIO + minutos(10))

    expect(estadoDaSessao(reaberta, INICIO + minutos(60))).toBe('pausada')
    expect(tempoDecorridoMs(reaberta, INICIO + minutos(60))).toBe(minutos(10))
  })

  it('mantém como está uma sessão que já estava pausada', () => {
    let sessao = iniciarSessao('foco-1', 25, INICIO)
    sessao = pausarSessao(sessao, INICIO + minutos(5))

    expect(sessaoAoReabrir(sessao, INICIO + minutos(30))).toEqual(sessao)
  })

  it('uma sessão que terminou antes de fechar continua concluída', () => {
    const sessao = iniciarSessao('foco-1', 25, INICIO)
    const reaberta = sessaoAoReabrir(sessao, INICIO + minutos(26))

    expect(estadoDaSessao(reaberta, INICIO + minutos(90))).toBe('concluida')
  })
})