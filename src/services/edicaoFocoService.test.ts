import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/focoRepository', () => ({
  atualizarFoco: vi.fn(),
}))

vi.mock('./logService', () => ({
  registrarLog: vi.fn(),
}))

import { atualizarFoco } from '../repositories/focoRepository'
import { registrarLog } from './logService'
import {
  avaliarEdicao,
  camposAlterados,
  editarFoco,
  type DadosDaEdicao,
  type FocoParaEditar,
} from './edicaoFocoService'
import { PALETA_FOCO } from './opcoesFoco'

const USUARIO = 'usuario-1'

const INGLES: FocoParaEditar = {
  id: 'foco-1',
  titulo: 'Inglês',
  status: 'ativo',
  meta_horas: 720,
  observacoes: null,
  cor_hex: null,
}

function dados(alteracao: Partial<DadosDaEdicao> = {}): DadosDaEdicao {
  return { titulo: 'Inglês', meta_horas: 720, observacoes: '', cor_hex: null, ...alteracao }
}

function mensagem(foco: FocoParaEditar, edicao: DadosDaEdicao): string {
  const avaliacao = avaliarEdicao(foco, edicao)
  return avaliacao.permitido ? '' : avaliacao.mensagem
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('editar Foco (RF27)', () => {
  it('o título é obrigatório, mesmo com espaços', () => {
    expect(mensagem(INGLES, dados({ titulo: '   ' }))).toBe('O nome do F.O.C.O é obrigatório.')
  })

  it('o nome e as observações seguem os mesmos limites do cadastro', () => {
    expect(mensagem(INGLES, dados({ titulo: 'a'.repeat(41) }))).toContain('até 40')
    expect(mensagem(INGLES, dados({ titulo: 'Inglês <b>' }))).toContain('só letras')
    expect(mensagem(INGLES, dados({ observacoes: 'ver https://site.com' }))).toContain('pontuação')
    expect(mensagem(INGLES, dados({ observacoes: 'c'.repeat(201) }))).toContain('até 200')
  })

  it('a meta precisa ser uma das opções fixas (RN09.2)', () => {
    expect(avaliarEdicao(INGLES, dados({ meta_horas: 2160 }))).toEqual({ permitido: true })
    expect(mensagem(INGLES, dados({ meta_horas: 999 }))).toContain('metas disponíveis')
  })

  it('um Foco antigo pode manter a meta que já tinha, mesmo fora das opções', () => {
    const antigo = { ...INGLES, meta_horas: 50 }
    expect(avaliarEdicao(antigo, dados({ meta_horas: 50, titulo: 'Inglês B1' }))).toEqual({ permitido: true })
  })

  it('Foco do Laboratório não pode ser editado', () => {
    expect(mensagem({ ...INGLES, status: 'laboratorio_sonhos' }, dados({ titulo: 'Novo' }))).toContain(
      'Laboratório de Sonhos não podem ser editados'
    )
  })

  it('identifica só os campos que mudaram, ignorando espaços nas pontas', () => {
    expect(camposAlterados(INGLES, dados({ titulo: '  Inglês  ' }))).toEqual([])
    expect(camposAlterados(INGLES, dados({ titulo: 'Inglês B2', cor_hex: '#22C55E' }))).toEqual(['titulo', 'cor_hex'])
  })

  it('salva e registra "editar_foco" com os campos alterados', async () => {
    vi.mocked(atualizarFoco).mockResolvedValue(true)

    const resultado = await editarFoco(INGLES, dados({ titulo: ' Inglês B2 ', observacoes: ' prova em dezembro ' }), USUARIO)

    expect(resultado.sucesso).toBe(true)
    expect(atualizarFoco).toHaveBeenCalledWith('foco-1', {
      titulo: 'Inglês B2',
      meta_horas: 720,
      observacoes: 'prova em dezembro',
      cor_hex: null,
    })
    expect(registrarLog).toHaveBeenCalledWith(USUARIO, 'editar_foco', {
      foco_id: 'foco-1',
      titulo: 'Inglês B2',
      alteracoes: ['titulo', 'observacoes'],
    })
  })

  it('sem alterações, não chama o banco nem registra log', async () => {
    const resultado = await editarFoco(INGLES, dados(), USUARIO)

    expect(resultado.sucesso).toBe(true)
    expect(atualizarFoco).not.toHaveBeenCalled()
    expect(registrarLog).not.toHaveBeenCalled()
  })

  it('a regra é conferida no serviço: título vazio não chega ao banco', async () => {
    const resultado = await editarFoco(INGLES, dados({ titulo: '' }), USUARIO)

    expect(resultado.sucesso).toBe(false)
    expect(atualizarFoco).not.toHaveBeenCalled()
  })
})

describe('personalizar a cor do Foco (RF12)', () => {
  it('aceita as cores da paleta e o azul padrão (RN12.1, RN12.4, CA12.1)', () => {
    for (const cor of PALETA_FOCO) {
      expect(avaliarEdicao(INGLES, dados({ cor_hex: cor.hex }))).toEqual({ permitido: true })
    }
  })

  it('o dourado não está na paleta (RN12.3, CA12.3)', () => {
    expect(PALETA_FOCO.some((cor) => cor.nome.toLowerCase().includes('dourad'))).toBe(false)
    expect(mensagem(INGLES, dados({ cor_hex: '#FFC107' }))).toContain('cores da paleta')
  })

  it('a cor é guardada mesmo para o Foco com a Estrela, para quando ele sair do 1º lugar', async () => {
    vi.mocked(atualizarFoco).mockResolvedValue(true)

    const resultado = await editarFoco({ ...INGLES, cor_hex: null }, dados({ cor_hex: '#EC4899' }), USUARIO)

    expect(resultado.sucesso).toBe(true)
    expect(atualizarFoco).toHaveBeenCalledWith('foco-1', expect.objectContaining({ cor_hex: '#EC4899' }))
  })

  it('se o Foco saiu da pilha antes de salvar, avisa e não registra log', async () => {
    vi.mocked(atualizarFoco).mockResolvedValue(false)

    const resultado = await editarFoco(INGLES, dados({ cor_hex: '#22C55E' }), USUARIO)

    expect(resultado.sucesso).toBe(false)
    expect(registrarLog).not.toHaveBeenCalled()
  })
})
