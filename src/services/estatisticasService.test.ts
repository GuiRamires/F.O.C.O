import { describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/estatisticasRepository', () => ({
  getSessoesComFocoDoUsuario: vi.fn(),
}))

import type { SessaoComFoco } from '../repositories/estatisticasRepository'
import { calcularEstatisticas, SEMANAS_NO_GRAFICO } from './estatisticasService'
import { descreverMinutos } from '../utils/formatarHoras'

const QUARTA_04_11 = new Date(2026, 10, 4, 12)

function sessao(focoId: string, minutos: number, data: Date): SessaoComFoco {
  return { focoId, tituloFoco: `Foco ${focoId}`, duracaoMinutos: minutos, criadaEm: data.toISOString() }
}

describe('estatísticas de estudo', () => {
  it('soma as sessões de um Foco: 25 + 50 + 45 min = 2 h (CA23.1)', () => {
    const dia = new Date(2026, 10, 3, 10)
    const resultado = calcularEstatisticas([sessao('a', 25, dia), sessao('a', 50, dia), sessao('a', 45, dia)], QUARTA_04_11)

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
    const resultado = calcularEstatisticas(
      [sessao('a', 60, new Date(2026, 10, 3, 10)), sessao('a', 30, new Date(2026, 9, 28, 10))],
      QUARTA_04_11
    )
    const ultimas = resultado.porSemana.slice(-2)

    expect(ultimas).toEqual([
      { inicio: '2026-10-26', rotulo: '26/10', minutos: 30 },
      { inicio: '2026-11-02', rotulo: '02/11', minutos: 60 },
    ])
    expect(resultado.minutosNaSemanaAtual).toBe(60)
  })

  it('a semana começa na segunda-feira: domingo fica na semana anterior', () => {
    const resultado = calcularEstatisticas(
      [sessao('a', 40, new Date(2026, 10, 1, 22)), sessao('a', 20, new Date(2026, 10, 2, 8))],
      QUARTA_04_11
    )
    const ultimas = resultado.porSemana.slice(-2).map((semana) => semana.minutos)

    expect(ultimas).toEqual([40, 20])
  })

  it('ordena os Focos do que tem mais horas para o que tem menos', () => {
    const dia = new Date(2026, 10, 3, 10)
    const resultado = calcularEstatisticas([sessao('a', 30, dia), sessao('b', 90, dia), sessao('c', 60, dia)], QUARTA_04_11)

    expect(resultado.porFoco.map((foco) => foco.focoId)).toEqual(['b', 'c', 'a'])
  })

  it('calcula o total, a quantidade e a média de sessões', () => {
    const dia = new Date(2026, 10, 3, 10)
    const resultado = calcularEstatisticas([sessao('a', 25, dia), sessao('b', 50, dia), sessao('a', 50, dia)], QUARTA_04_11)

    expect(resultado.totalMinutos).toBe(125)
    expect(resultado.totalSessoes).toBe(3)
    expect(resultado.mediaMinutosPorSessao).toBe(41)
  })

  it('sessões antigas entram no total, mas não no gráfico das últimas semanas', () => {
    const resultado = calcularEstatisticas([sessao('a', 120, new Date(2026, 6, 1, 10))], QUARTA_04_11)

    expect(resultado.totalMinutos).toBe(120)
    expect(resultado.porSemana.every((semana) => semana.minutos === 0)).toBe(true)
  })
})