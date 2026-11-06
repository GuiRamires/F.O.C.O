import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/focoRepository', () => ({
  arquivarFocoNoLaboratorio: vi.fn(),
  resgatarFocoDoLaboratorio: vi.fn(),
  excluirFocoDoLaboratorio: vi.fn(),
  getFocosByUserId: vi.fn(),
  getTotalMinutosByFocoId: vi.fn(),
  existeSessaoDesde: vi.fn(),
  criarFoco: vi.fn(),
}))

vi.mock('./logService', () => ({
  registrarLog: vi.fn(),
}))

import {
  arquivarFocoNoLaboratorio,
  excluirFocoDoLaboratorio,
  existeSessaoDesde,
  getFocosByUserId,
  getTotalMinutosByFocoId,
  resgatarFocoDoLaboratorio,
  type Foco,
} from '../repositories/focoRepository'
import { registrarLog } from './logService'
import { listarFocosComProgresso } from './focoService'
import {
  PALAVRA_EXCLUIR_FOCO,
  arquivarFoco,
  avaliarArquivamento,
  avaliarExclusao,
  avaliarResgate,
  excluirFoco,
  mascararPalavraExcluir,
  palavraExcluirConfere,
  resgatarFoco,
  type FocoDoLaboratorio,
} from './laboratorioService'

const USUARIO = 'usuario-1'

const ATIVO: FocoDoLaboratorio = { id: 'foco-1', titulo: 'Inglês', status: 'ativo', tem_estrela: false }
const COM_ESTRELA: FocoDoLaboratorio = { ...ATIVO, tem_estrela: true }
const NO_LABORATORIO: FocoDoLaboratorio = { ...ATIVO, status: 'laboratorio_sonhos' }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('arquivar Foco no Laboratório de Sonhos (RF15)', () => {
  it('um Foco ativo sem a Estrela pode ser arquivado', () => {
    expect(avaliarArquivamento(ATIVO)).toEqual({ permitido: true })
  })

  it('o Foco com a Estrela não pode ser arquivado (RN15.1, CA15.2)', () => {
    const avaliacao = avaliarArquivamento(COM_ESTRELA)
    expect(avaliacao.permitido).toBe(false)
    expect(avaliacao.permitido ? '' : avaliacao.mensagem).toContain('retire a Estrela Dourada')
  })

  it('um Foco que já está no Laboratório não é arquivado de novo', () => {
    expect(avaliarArquivamento(NO_LABORATORIO).permitido).toBe(false)
  })

  it('arquiva no banco e registra o log com o título', async () => {
    const resultado = await arquivarFoco(ATIVO, USUARIO)

    expect(resultado.sucesso).toBe(true)
    expect(arquivarFocoNoLaboratorio).toHaveBeenCalledWith('foco-1')
    expect(registrarLog).toHaveBeenCalledWith(USUARIO, 'arquivar_foco', { foco_id: 'foco-1', titulo: 'Inglês' })
  })

  it('a regra é conferida no serviço, mesmo que a tela tente arquivar o Foco com a Estrela', async () => {
    const resultado = await arquivarFoco(COM_ESTRELA, USUARIO)

    expect(resultado.sucesso).toBe(false)
    expect(arquivarFocoNoLaboratorio).not.toHaveBeenCalled()
    expect(registrarLog).not.toHaveBeenCalled()
  })
})

describe('resgatar Foco do Laboratório de Sonhos (RF18)', () => {
  it('só Focos do Laboratório podem ser resgatados', () => {
    expect(avaliarResgate(NO_LABORATORIO)).toEqual({ permitido: true })
    expect(avaliarResgate(ATIVO).permitido).toBe(false)
  })

  it('devolve a posição de entrada na pilha e registra o log (RN18.1, CA18.1)', async () => {
    vi.mocked(resgatarFocoDoLaboratorio).mockResolvedValue(4)

    const resultado = await resgatarFoco(NO_LABORATORIO, USUARIO)

    expect(resultado).toMatchObject({ sucesso: true, posicao: 4 })
    expect(resultado.mensagem).toContain('4ª posição')
    expect(registrarLog).toHaveBeenCalledWith(USUARIO, 'resgatar_foco', {
      foco_id: 'foco-1',
      titulo: 'Inglês',
      posicao: 4,
    })
  })

  it('não chama o banco para um Foco que já está ativo', async () => {
    const resultado = await resgatarFoco(ATIVO, USUARIO)

    expect(resultado.sucesso).toBe(false)
    expect(resgatarFocoDoLaboratorio).not.toHaveBeenCalled()
  })
})

describe('Foco resgatado aguardando prática (RN18.2)', () => {
  const foco = (dados: Partial<Foco>): Foco => ({
    id: 'foco-1',
    titulo: 'Inglês',
    meta_horas: 50,
    observacoes: null,
    tem_estrela: false,
    status: 'ativo',
    posicao: 4,
    cor_hex: null,
    arquivado_em: null,
    resgatado_em: null,
    created_at: '2026-10-01T10:00:00Z',
    ...dados,
  })

  it('fica aguardando prática enquanto não há sessão depois do resgate', async () => {
    vi.mocked(getFocosByUserId).mockResolvedValue([foco({ resgatado_em: '2026-11-05T20:00:00Z' })])
    vi.mocked(getTotalMinutosByFocoId).mockResolvedValue(720)
    vi.mocked(existeSessaoDesde).mockResolvedValue(false)

    const [resultado] = await listarFocosComProgresso(USUARIO)

    expect(resultado.aguardandoPratica).toBe(true)
    expect(existeSessaoDesde).toHaveBeenCalledWith('foco-1', '2026-11-05T20:00:00Z')
    expect(resultado.horasAcumuladas).toBe(12)
  })

  it('é liberado depois de uma sessão concluída após o resgate (CA18.3)', async () => {
    vi.mocked(getFocosByUserId).mockResolvedValue([foco({ resgatado_em: '2026-11-05T20:00:00Z' })])
    vi.mocked(getTotalMinutosByFocoId).mockResolvedValue(745)
    vi.mocked(existeSessaoDesde).mockResolvedValue(true)

    const [resultado] = await listarFocosComProgresso(USUARIO)

    expect(resultado.aguardandoPratica).toBe(false)
  })

  it('um Foco nunca arquivado não precisa da consulta extra', async () => {
    vi.mocked(getFocosByUserId).mockResolvedValue([foco({})])
    vi.mocked(getTotalMinutosByFocoId).mockResolvedValue(0)

    const [resultado] = await listarFocosComProgresso(USUARIO)

    expect(resultado.aguardandoPratica).toBe(false)
    expect(existeSessaoDesde).not.toHaveBeenCalled()
  })
})

describe('excluir Foco definitivamente (RF19)', () => {
  it('um Foco ativo não pode ser excluído (RN19.1, RN15.3, CA19.1)', () => {
    expect(avaliarExclusao(ATIVO).permitido).toBe(false)
    expect(avaliarExclusao(COM_ESTRELA).permitido).toBe(false)
    expect(avaliarExclusao(NO_LABORATORIO)).toEqual({ permitido: true })
  })

  it('a palavra é comparada sem diferenciar maiúsculas e minúsculas (RN19.2)', () => {
    expect(palavraExcluirConfere('desistir')).toBe(true)
    expect(palavraExcluirConfere('  Desistir ')).toBe(true)
    expect(palavraExcluirConfere(PALAVRA_EXCLUIR_FOCO)).toBe(true)
  })

  it('"DESISTO" não libera a exclusão (CA19.3)', () => {
    expect(palavraExcluirConfere('DESISTO')).toBe(false)
    expect(palavraExcluirConfere('')).toBe(false)
  })

  it('o campo aceita só letras, em maiúsculas, até o tamanho da palavra', () => {
    expect(mascararPalavraExcluir('desistir')).toBe('DESISTIR')
    expect(mascararPalavraExcluir('des1st!r')).toBe('DESSTR')
    expect(mascararPalavraExcluir('DESISTIRRRR')).toBe('DESISTIR')
  })

  it('com "desistir", exclui o Foco e registra "excluir_foco" com o título (CA19.2, CA19.4)', async () => {
    vi.mocked(excluirFocoDoLaboratorio).mockResolvedValue(true)

    const resultado = await excluirFoco(NO_LABORATORIO, USUARIO, 'desistir')

    expect(resultado.sucesso).toBe(true)
    expect(excluirFocoDoLaboratorio).toHaveBeenCalledWith('foco-1')
    expect(registrarLog).toHaveBeenCalledWith(USUARIO, 'excluir_foco', { foco_id: 'foco-1', titulo: 'Inglês' })
  })

  it('a palavra é validada de novo no serviço, e não só na tela (RN19.3)', async () => {
    const resultado = await excluirFoco(NO_LABORATORIO, USUARIO, 'DESISTO')

    expect(resultado).toEqual({ sucesso: false, mensagem: 'A palavra digitada não confere.' })
    expect(excluirFocoDoLaboratorio).not.toHaveBeenCalled()
  })

  it('mesmo com a palavra certa, um Foco ativo não chega ao banco', async () => {
    const resultado = await excluirFoco(ATIVO, USUARIO, 'DESISTIR')

    expect(resultado.sucesso).toBe(false)
    expect(excluirFocoDoLaboratorio).not.toHaveBeenCalled()
  })

  it('se o banco não excluiu nenhuma linha, avisa e não registra log', async () => {
    vi.mocked(excluirFocoDoLaboratorio).mockResolvedValue(false)

    const resultado = await excluirFoco(NO_LABORATORIO, USUARIO, 'DESISTIR')

    expect(resultado.sucesso).toBe(false)
    expect(registrarLog).not.toHaveBeenCalled()
  })
})
