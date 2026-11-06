import { describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/estatisticasRepository', () => ({
  getSessoesComFocoDoUsuario: vi.fn(),
}))

import {
  calcularConstancia,
  calcularEstatisticas,
  listarAprendizados,
  montarPainel,
  nivelDeConstancia,
  SEMANAS_NA_CONSTANCIA,
  SEMANAS_NO_GRAFICO,
  type SessaoComFoco,
} from './estatisticasService'
import { descreverMinutos } from '../utils/formatarHoras'

const QUARTA_04_11 = new Date(2026, 10, 4, 12)

let proximoId = 0

function sessao(focoId: string, minutos: number, data: Date, aprendizado: string | null = null): SessaoComFoco {
  proximoId++
  return {
    id: `sessao-${proximoId}`,
    focoId,
    tituloFoco: `Foco ${focoId}`,
    duracaoMinutos: minutos,
    aprendizado,
    criadaEm: data.toISOString(),
  }
}

function dia(mes: number, numero: number, hora = 10): Date {
  return new Date(2026, mes - 1, numero, hora)
}

describe('estatísticas de estudo', () => {
  it('soma as sessões de um Foco: 25 + 50 + 45 min = 2 h (CA23.1)', () => {
    const resultado = calcularEstatisticas(
      [sessao('a', 25, dia(11, 3)), sessao('a', 50, dia(11, 3)), sessao('a', 45, dia(11, 3))],
      QUARTA_04_11
    )

    expect(resultado.porFoco).toEqual([{ focoId: 'a', titulo: 'Foco a', minutos: 120 }])
    expect(descreverMinutos(resultado.porFoco[0].minutos)).toBe('2 h')
  })

  it('sem sessões, todos os indicadores ficam zerados (CA23.2)', () => {
    const resultado = calcularEstatisticas([], QUARTA_04_11)

    expect(resultado.totalMinutos).toBe(0)
    expect(resultado.totalSessoes).toBe(0)
    expect(resultado.mediaMinutosPorSessao).toBe(0)
    expect(resultado.minutosNaSemanaAtual).toBe(0)
    expect(resultado.porFoco).toEqual([])
    expect(resultado.porSemana).toHaveLength(SEMANAS_NO_GRAFICO)
    expect(resultado.porSemana.every((semana) => semana.minutos === 0)).toBe(true)
  })

  it('separa as horas de semanas diferentes (CA23.3)', () => {
    const resultado = calcularEstatisticas([sessao('a', 60, dia(11, 3)), sessao('a', 30, dia(10, 28))], QUARTA_04_11)

    expect(resultado.porSemana.slice(-2)).toEqual([
      { inicio: '2026-10-26', rotulo: '26/10', minutos: 30, sessoes: 1 },
      { inicio: '2026-11-02', rotulo: '02/11', minutos: 60, sessoes: 1 },
    ])
    expect(resultado.minutosNaSemanaAtual).toBe(60)
  })

  it('a semana soma várias sessões: quatro de 90 min dão 6 h na mesma semana', () => {
    const resultado = calcularEstatisticas(
      [
        sessao('a', 90, dia(11, 2)),
        sessao('a', 90, dia(11, 3)),
        sessao('a', 90, dia(11, 3, 20)),
        sessao('a', 90, dia(11, 4, 8)),
      ],
      QUARTA_04_11
    )

    expect(resultado.porSemana[resultado.porSemana.length - 1]).toMatchObject({ minutos: 360, sessoes: 4 })
  })

  it('a semana começa na segunda-feira: domingo fica na semana anterior', () => {
    const resultado = calcularEstatisticas([sessao('a', 40, dia(11, 1, 22)), sessao('a', 20, dia(11, 2, 8))], QUARTA_04_11)

    expect(resultado.porSemana.slice(-2).map((semana) => semana.minutos)).toEqual([40, 20])
  })

  it('ordena os Focos do que tem mais horas para o que tem menos', () => {
    const resultado = calcularEstatisticas(
      [sessao('a', 30, dia(11, 3)), sessao('b', 90, dia(11, 3)), sessao('c', 60, dia(11, 3))],
      QUARTA_04_11
    )

    expect(resultado.porFoco.map((foco) => foco.focoId)).toEqual(['b', 'c', 'a'])
  })

  it('calcula o total, a quantidade e a média de sessões', () => {
    const resultado = calcularEstatisticas(
      [sessao('a', 25, dia(11, 3)), sessao('b', 50, dia(11, 3)), sessao('a', 50, dia(11, 3))],
      QUARTA_04_11
    )

    expect(resultado.totalMinutos).toBe(125)
    expect(resultado.totalSessoes).toBe(3)
    expect(resultado.mediaMinutosPorSessao).toBe(41)
  })

  it('sessões antigas entram no total, mas não no gráfico das últimas semanas', () => {
    const resultado = calcularEstatisticas([sessao('a', 120, dia(7, 1))], QUARTA_04_11)

    expect(resultado.totalMinutos).toBe(120)
    expect(resultado.porSemana.every((semana) => semana.minutos === 0)).toBe(true)
  })
})

describe('constância', () => {
  it('classifica o dia em níveis de 0 a 4 por tempo estudado', () => {
    expect([0, 5, 29, 30, 59, 60, 119, 120, 300].map(nivelDeConstancia)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4])
  })

  it('conta a sequência de dias seguidos até hoje', () => {
    const resultado = calcularConstancia(
      [sessao('a', 25, dia(11, 2)), sessao('a', 25, dia(11, 3)), sessao('a', 25, dia(11, 4, 9))],
      QUARTA_04_11
    )

    expect(resultado.sequenciaAtual).toBe(3)
  })

  it('a sequência continua viva se o aluno ainda não estudou hoje, mas estudou ontem', () => {
    const resultado = calcularConstancia([sessao('a', 25, dia(11, 2)), sessao('a', 25, dia(11, 3))], QUARTA_04_11)

    expect(resultado.sequenciaAtual).toBe(2)
  })

  it('um dia sem estudo quebra a sequência, mas o recorde fica guardado', () => {
    const resultado = calcularConstancia(
      [
        sessao('a', 25, dia(10, 20)),
        sessao('a', 25, dia(10, 21)),
        sessao('a', 25, dia(10, 22)),
        sessao('a', 25, dia(10, 23)),
        sessao('a', 25, dia(11, 1)),
        sessao('a', 25, dia(11, 3)),
      ],
      QUARTA_04_11
    )

    expect(resultado.sequenciaAtual).toBe(1)
    expect(resultado.maiorSequencia).toBe(4)
  })

  it('monta a grade de semanas com segunda a domingo e marca os dias futuros', () => {
    const resultado = calcularConstancia([sessao('a', 70, dia(11, 3))], QUARTA_04_11)
    const semanaAtual = resultado.semanas[resultado.semanas.length - 1]

    expect(resultado.semanas).toHaveLength(SEMANAS_NA_CONSTANCIA)
    expect(resultado.semanas.every((semana) => semana.length === 7)).toBe(true)
    expect(semanaAtual[0].chave).toBe('2026-11-02')
    expect(semanaAtual[1]).toMatchObject({ chave: '2026-11-03', minutos: 70, nivel: 3, futuro: false })
    expect(semanaAtual[2].futuro).toBe(false)
    expect(semanaAtual[3].futuro).toBe(true)
    expect(resultado.diasEstudados).toBe(1)
  })
})

describe('registros de aprendizado', () => {
  it('mostra os mais recentes primeiro e ignora sessões sem texto', () => {
    const resultado = listarAprendizados([
      sessao('a', 25, dia(11, 1), 'Primeiro'),
      sessao('a', 25, dia(11, 2), null),
      sessao('a', 25, dia(11, 3), '   '),
      sessao('b', 50, dia(11, 4), '  Último  '),
    ])

    expect(resultado.map((item) => item.texto)).toEqual(['Último', 'Primeiro'])
    expect(resultado[0]).toMatchObject({ tituloFoco: 'Foco b', rotuloData: '04/11', minutos: 50 })
  })

  it('respeita o limite de registros exibidos', () => {
    const sessoes = Array.from({ length: 10 }, (_, indice) => sessao('a', 25, dia(10, indice + 1), `Registro ${indice}`))

    expect(listarAprendizados(sessoes, 3)).toHaveLength(3)
  })
})

describe('painel por Foco', () => {
  it('ao escolher um Foco, todos os números consideram só as sessões dele', () => {
    const sessoes = [
      sessao('a', 60, dia(11, 3), 'Do A'),
      sessao('b', 30, dia(11, 3), 'Do B'),
      sessao('a', 25, dia(11, 4, 9)),
    ]

    const geral = montarPainel(sessoes, null, QUARTA_04_11)
    const soDoA = montarPainel(sessoes, 'a', QUARTA_04_11)

    expect(geral.estatisticas.totalMinutos).toBe(115)
    expect(soDoA.estatisticas.totalMinutos).toBe(85)
    expect(soDoA.estatisticas.totalSessoes).toBe(2)
    expect(soDoA.aprendizados.map((item) => item.texto)).toEqual(['Do A'])
    expect(soDoA.constancia.sequenciaAtual).toBe(2)
  })
})
