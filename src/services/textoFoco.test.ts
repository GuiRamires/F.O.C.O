import { describe, expect, it } from 'vitest'
import {
  LIMITE_OBSERVACOES,
  LIMITE_TITULO,
  mascararObservacoes,
  mascararTitulo,
  validarObservacoes,
  validarTextosDoFoco,
  validarTitulo,
} from './textoFoco'

describe('texto do nome do Foco', () => {
  it('mantém letras com acento, números, espaços e hífen', () => {
    expect(mascararTitulo('Inglês B2 - Conversação 2026')).toBe('Inglês B2 - Conversação 2026')
  })

  it('remove caracteres especiais, links e código', () => {
    expect(mascararTitulo('<script>alert(1)</script>')).toBe('scriptalert1script')
    expect(mascararTitulo('https://site.com')).toBe('httpssitecom')
    expect(mascararTitulo('TCC @#$%&*!? 🚀')).toBe('TCC ')
  })

  it('junta espaços repetidos e corta no limite', () => {
    expect(mascararTitulo('TCC     Web')).toBe('TCC Web')
    expect(mascararTitulo('a'.repeat(60))).toHaveLength(LIMITE_TITULO)
  })

  it('valida obrigatório, limite e caracteres permitidos', () => {
    expect(validarTitulo('   ')).toBe('O nome do F.O.C.O é obrigatório.')
    expect(validarTitulo('a'.repeat(LIMITE_TITULO + 1))).toContain(`até ${LIMITE_TITULO}`)
    expect(validarTitulo('TCC <b>')).toContain('só letras')
    expect(validarTitulo('  Programação Web  ')).toBeNull()
  })
})

describe('texto das observações do Foco', () => {
  it('mantém pontuação simples e quebra de linha', () => {
    const texto = 'Meta: passar na prova (dezembro).\nRevisar capítulos 1, 2 e 3; fazer exercícios!'
    expect(mascararObservacoes(texto)).toBe(texto)
  })

  it('remove o que forma links, tags e código', () => {
    expect(mascararObservacoes('veja https://x.com/a?b=1 <img src=x>')).toBe('veja https:x.coma?b1 img srcx')
    expect(mascararObservacoes('"aspas" e \'apóstrofo\' {chaves} [colchetes] `crase`')).toBe(
      'aspas e apóstrofo chaves colchetes crase'
    )
  })

  it('corta no limite e valida', () => {
    expect(mascararObservacoes('b'.repeat(300))).toHaveLength(LIMITE_OBSERVACOES)
    expect(validarObservacoes('b'.repeat(LIMITE_OBSERVACOES + 1))).toContain(`até ${LIMITE_OBSERVACOES}`)
    expect(validarObservacoes('<b>')).toContain('pontuação')
    expect(validarObservacoes('')).toBeNull()
  })

  it('valida nome e observações juntos, mostrando o primeiro problema', () => {
    expect(validarTextosDoFoco('', '<b>')).toBe('O nome do F.O.C.O é obrigatório.')
    expect(validarTextosDoFoco('TCC', '<b>')).toContain('pontuação')
    expect(validarTextosDoFoco('TCC', 'tudo certo')).toBeNull()
  })
})
