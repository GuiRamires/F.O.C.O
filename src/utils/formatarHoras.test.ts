import { describe, expect, it } from 'vitest'
import { descreverMinutos } from './formatarHoras'

describe('descrever o tempo estudado', () => {
  it('mostra horas e minutos sem arredondar para cima', () => {
    expect(descreverMinutos(599)).toBe('9 h 59 min')
    expect(descreverMinutos(750)).toBe('12 h 30 min')
  })

  it('omite a parte que for zero', () => {
    expect(descreverMinutos(600)).toBe('10 h')
    expect(descreverMinutos(45)).toBe('45 min')
    expect(descreverMinutos(0)).toBe('0 min')
  })

  it('descarta frações de minuto em vez de arredondar', () => {
    expect(descreverMinutos(599.9)).toBe('9 h 59 min')
  })
})