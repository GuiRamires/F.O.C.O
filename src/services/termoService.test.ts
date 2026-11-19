import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/termoRepository', () => ({
  buscarUltimoAceite: vi.fn(),
  buscarVersaoPendente: vi.fn(),
  registrarAceite: vi.fn(),
}))

import { buscarUltimoAceite, buscarVersaoPendente, registrarAceite } from '../repositories/termoRepository'
import { handleAceitarTermo, handleConsultarAceite, handleVerificarTermo } from '../controllers/termoController'
import { aceitarTermo, avisoDeNovaVersao, consultarUltimoAceite, verificarTermoPendente, VERSAO_DO_TERMO } from './termoService'

describe('aceite versionado do Termo de Uso (RF04)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('a versão exibida é a 1.1, a mesma registrada no banco', () => {
    expect(VERSAO_DO_TERMO).toBe('1.1')
    expect(avisoDeNovaVersao('1.1')).toContain('versão 1.1')
  })

  it('consulta a versão pendente, registra o aceite e busca o último aceite', async () => {
    vi.mocked(buscarVersaoPendente).mockResolvedValueOnce('1.1')
    vi.mocked(registrarAceite).mockResolvedValueOnce('2026-11-19T03:00:00Z')
    vi.mocked(buscarUltimoAceite).mockResolvedValueOnce({ versao: '1.1', aceitoEm: '2026-11-19T03:00:00Z' })

    expect(await verificarTermoPendente()).toBe('1.1')
    expect(await aceitarTermo()).toBe('2026-11-19T03:00:00Z')
    expect(await consultarUltimoAceite('u1')).toEqual({ versao: '1.1', aceitoEm: '2026-11-19T03:00:00Z' })
    expect(buscarUltimoAceite).toHaveBeenCalledWith('u1')
  })

  it('não bloqueia o sistema quando a verificação falha', async () => {
    vi.mocked(buscarVersaoPendente).mockRejectedValueOnce(new Error('sem rede'))
    vi.mocked(buscarUltimoAceite).mockRejectedValueOnce(new Error('sem rede'))

    expect(await handleVerificarTermo()).toBeNull()
    expect(await handleConsultarAceite('u1')).toBeNull()
  })

  it('informa quando o aceite não pôde ser registrado', async () => {
    vi.mocked(registrarAceite).mockRejectedValueOnce(new Error('sem rede')).mockResolvedValueOnce('agora')

    expect((await handleAceitarTermo()).sucesso).toBe(false)
    expect(await handleAceitarTermo()).toEqual({ sucesso: true, mensagem: 'Aceite registrado.' })
  })
})
