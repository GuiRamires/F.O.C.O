import { describe, it, expect } from 'vitest'
import { calcularForcaSenha, validarSenha } from './validarSenha'

const NOME = 'Guilherme Ramires'
const EMAIL = 'gui.teste@email.com'

const valida = (senha: string, nome = NOME, email = EMAIL) => validarSenha(senha, nome, email).valida
const erros = (senha: string) => validarSenha(senha, NOME, EMAIL).erros
const comTamanho = (tamanho: number) => 'Fo1' + 'x'.repeat(tamanho - 3)

describe('política de senha (RNF02)', () => {
  it('aceita uma senha que cumpre todas as regras', () => {
    expect(valida('Foco2026x')).toBe(true)
  })

  it('exige de 8 a 20 caracteres (limites exatos)', () => {
    expect(valida(comTamanho(7))).toBe(false)
    expect(valida(comTamanho(8))).toBe(true)
    expect(valida(comTamanho(20))).toBe(true)
    expect(valida(comTamanho(21))).toBe(false)
  })

  it('exige letra minúscula, letra maiúscula e número', () => {
    expect(erros('FOCO2026X')).toContain('A senha deve conter ao menos uma letra minúscula.')
    expect(erros('foco2026x')).toContain('A senha deve conter ao menos uma letra maiúscula.')
    expect(erros('FocoFocoX')).toContain('A senha deve conter ao menos um número.')
  })

  it('recusa "Abcd1234" por conter sequência (CA01.2)', () => {
    expect(valida('Abcd1234')).toBe(false)
  })

  it('recusa sequências decrescentes', () => {
    expect(valida('Foco9876x')).toBe(false)
    expect(valida('Dcba2026x')).toBe(false)
  })

  it('aceita sequência de 3, porque o limite é 4', () => {
    expect(valida('123Estudar@')).toBe(true)
  })

  it('aceita caracteres alternados que não formam sequência na senha', () => {
    expect(valida('A1b2c3d4')).toBe(true)
  })

  it('recusa senha com uma parte do nome', () => {
    expect(valida('Guilherme26')).toBe(false)
  })

  it('ignora partes curtas do nome e do e-mail', () => {
    expect(valida('Gudados2026', 'Ana da Silva', 'gu@email.com')).toBe(true)
  })

  it('recusa senha com o usuário do e-mail', () => {
    expect(valida('Gui.teste99')).toBe(false)
  })

  it('o indicador nunca mostra "excelente" para uma senha recusada (RNF02)', () => {
    expect(calcularForcaSenha('Abcd1234!', NOME, EMAIL)).not.toBe('excelente')
    expect(calcularForcaSenha('Foco2026x!', NOME, EMAIL)).toBe('excelente')
    expect(calcularForcaSenha('Foco2026x', NOME, EMAIL)).toBe('boa')
  })
})