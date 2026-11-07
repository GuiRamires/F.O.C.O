import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/focoRepository', () => ({
  getFocosByUserId: vi.fn(),
  getTotalMinutosByFocoId: vi.fn(),
  existeSessaoDesde: vi.fn(),
  criarFoco: vi.fn(),
}))

vi.mock('./logService', () => ({
  registrarLog: vi.fn(),
}))

import { criarFoco } from '../repositories/focoRepository'
import { registrarLog } from './logService'
import { criarNovoFoco, validarNovoFoco } from './focoService'

const USUARIO = 'usuario-1'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('cadastrar Foco (RF09)', () => {
  it('título vazio é recusado no serviço, e não só na tela (CA09.2)', async () => {
    await expect(criarNovoFoco(USUARIO, { titulo: '  ', meta_horas: 168, observacoes: '' })).rejects.toThrow(
      'O nome do F.O.C.O é obrigatório.'
    )
    expect(criarFoco).not.toHaveBeenCalled()
  })

  it('recusa caracteres especiais, textos longos e meta fora das opções', () => {
    expect(validarNovoFoco({ titulo: '<script>', meta_horas: 168, observacoes: '' })).toContain('só letras')
    expect(validarNovoFoco({ titulo: 'TCC', meta_horas: 168, observacoes: 'd'.repeat(201) })).toContain('até 200')
    expect(validarNovoFoco({ titulo: 'TCC', meta_horas: 99, observacoes: '' })).toContain('metas disponíveis')
  })

  it('cria com os textos sem espaços nas pontas e registra o log (CA09.1, CA08.1)', async () => {
    await criarNovoFoco(USUARIO, { titulo: '  Inglês  ', meta_horas: 720, observacoes: ' prova em dezembro ' })

    expect(criarFoco).toHaveBeenCalledWith(USUARIO, {
      titulo: 'Inglês',
      meta_horas: 720,
      observacoes: 'prova em dezembro',
    })
    expect(registrarLog).toHaveBeenCalledWith(USUARIO, 'criar_foco', { titulo: 'Inglês' })
  })
})
