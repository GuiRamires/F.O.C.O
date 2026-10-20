import { describe, it, expect } from 'vitest'
import { confirmacaoConfere } from './confirmacaoReflexiva'

describe('confirmação reflexiva', () => {
  it('aceita a palavra exata', () => {
    expect(confirmacaoConfere('DESCARTAR', 'DESCARTAR')).toBe(true)
  })

  it('ignora maiúsculas e minúsculas', () => {
    expect(confirmacaoConfere('descartar', 'DESCARTAR')).toBe(true)
    expect(confirmacaoConfere('Descartar', 'DESCARTAR')).toBe(true)
  })

  it('ignora espaços nas pontas e espaços repetidos no meio', () => {
    expect(confirmacaoConfere('  descartar  ', 'DESCARTAR')).toBe(true)
    expect(confirmacaoConfere('frase   com  espaços', 'Frase com espaços')).toBe(true)
  })

  it('recusa uma palavra parecida (CA19.3)', () => {
    expect(confirmacaoConfere('DESISTO', 'DESISTIR')).toBe(false)
    expect(confirmacaoConfere('DESCARTA', 'DESCARTAR')).toBe(false)
  })

  it('recusa texto vazio', () => {
    expect(confirmacaoConfere('', 'DESCARTAR')).toBe(false)
    expect(confirmacaoConfere('   ', 'DESCARTAR')).toBe(false)
  })
})