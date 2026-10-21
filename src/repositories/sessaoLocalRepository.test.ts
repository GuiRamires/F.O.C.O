import { describe, it, expect } from 'vitest'
import { ehSessaoGuardadaValida } from './sessaoLocalRepository'

const valida = {
  usuarioId: 'usuario-1',
  tituloFoco: 'Aprender Inglês',
  porcentagemFoco: 25,
  ultimoSinal: 1_000_000,
  sessao: {
    focoId: 'foco-1',
    duracaoMs: 1_500_000,
    inicioEm: 1_000_000,
    pausadaEm: null,
    tempoPausadoMs: 0,
  },
}

describe('sessão guardada no navegador', () => {
  it('aceita uma sessão guardada completa', () => {
    expect(ehSessaoGuardadaValida(valida)).toBe(true)
  })

  it('aceita uma sessão pausada', () => {
    const pausada = { ...valida, sessao: { ...valida.sessao, pausadaEm: 1_200_000 } }
    expect(ehSessaoGuardadaValida(pausada)).toBe(true)
  })

  it('recusa dados incompletos', () => {
    expect(ehSessaoGuardadaValida({ ...valida, usuarioId: undefined })).toBe(false)
    expect(ehSessaoGuardadaValida({ ...valida, sessao: null })).toBe(false)
  })

  it('recusa lixo e formato errado', () => {
    expect(ehSessaoGuardadaValida(null)).toBe(false)
    expect(ehSessaoGuardadaValida('texto qualquer')).toBe(false)
    expect(ehSessaoGuardadaValida({ ...valida, sessao: { ...valida.sessao, duracaoMs: '25' } })).toBe(false)
  })
})