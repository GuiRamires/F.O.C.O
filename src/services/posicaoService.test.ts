import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/focoRepository', () => ({
  reordenarFocoNaPilha: vi.fn(),
}))

vi.mock('./logService', () => ({
  registrarLog: vi.fn(),
}))

import { reordenarFocoNaPilha } from '../repositories/focoRepository'
import { registrarLog } from './logService'
import {
  MENSAGEM_PRATICA_PENDENTE,
  avaliarNovaPosicao,
  mudarPosicao,
  podeMudarDePosicao,
  posicoesDaPilha,
  primeiraPosicaoLivre,
  type FocoParaReordenar,
  type SituacaoDaPilha,
} from './posicaoService'

const USUARIO = 'usuario-1'
const COM_ESTRELA: SituacaoDaPilha = { totalAtivos: 5, existeEstrela: true }
const SEM_ESTRELA: SituacaoDaPilha = { totalAtivos: 5, existeEstrela: false }

const QUINTO: FocoParaReordenar = {
  id: 'foco-5',
  titulo: 'Redação',
  status: 'ativo',
  tem_estrela: false,
  posicao: 5,
  aguardandoPratica: false,
}

function mensagem(foco: FocoParaReordenar, novaPosicao: number, pilha: SituacaoDaPilha): string {
  const avaliacao = avaliarNovaPosicao(foco, novaPosicao, pilha)
  return avaliacao.permitido ? '' : avaliacao.mensagem
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('mudar a posição do Foco na pilha (RF11)', () => {
  it('do 5º para o 2º é permitido (CA11.1)', () => {
    expect(avaliarNovaPosicao(QUINTO, 2, COM_ESTRELA)).toEqual({ permitido: true })
  })

  it('com a Estrela em uso, ninguém vai para a 1ª posição (RN11.1, CA11.2)', () => {
    expect(primeiraPosicaoLivre(COM_ESTRELA)).toBe(2)
    expect(mensagem(QUINTO, 1, COM_ESTRELA)).toContain('1ª posição é do Foco com a Estrela')
  })

  it('sem a Estrela, a 1ª posição fica livre', () => {
    expect(primeiraPosicaoLivre(SEM_ESTRELA)).toBe(1)
    expect(avaliarNovaPosicao(QUINTO, 1, SEM_ESTRELA)).toEqual({ permitido: true })
  })

  it('o Foco com a Estrela fica fixo (RN11.1)', () => {
    const estrela = { ...QUINTO, tem_estrela: true, posicao: 1 }
    expect(mensagem(estrela, 3, COM_ESTRELA)).toContain('fica fixo na 1ª posição')
    expect(podeMudarDePosicao(estrela, COM_ESTRELA)).toBe(false)
  })

  it('um Foco resgatado sem sessão é impedido e o aluno é avisado (RN11.2, CA11.3)', () => {
    expect(mensagem({ ...QUINTO, aguardandoPratica: true }, 2, COM_ESTRELA)).toBe(MENSAGEM_PRATICA_PENDENTE)
  })

  it('recusa posições fora da pilha e a posição atual', () => {
    expect(mensagem(QUINTO, 6, COM_ESTRELA)).toContain('Escolha uma posição')
    expect(mensagem(QUINTO, 0, COM_ESTRELA)).toContain('Escolha uma posição')
    expect(mensagem(QUINTO, 5, COM_ESTRELA)).toContain('já está nessa posição')
  })

  it('a opção só aparece quando há para onde mover', () => {
    expect(podeMudarDePosicao(QUINTO, COM_ESTRELA)).toBe(true)
    expect(podeMudarDePosicao({ ...QUINTO, posicao: 2 }, { totalAtivos: 2, existeEstrela: true })).toBe(false)
    expect(podeMudarDePosicao({ ...QUINTO, posicao: 1 }, { totalAtivos: 1, existeEstrela: false })).toBe(false)
    expect(podeMudarDePosicao({ ...QUINTO, status: 'laboratorio_sonhos' }, COM_ESTRELA)).toBe(false)
  })

  it('lista as posições da pilha de 1 até o total', () => {
    expect(posicoesDaPilha(COM_ESTRELA)).toEqual([1, 2, 3, 4, 5])
  })

  it('grava a nova posição e registra o log com origem e destino (CA11.4)', async () => {
    const resultado = await mudarPosicao(QUINTO, 2, COM_ESTRELA, USUARIO)

    expect(resultado.sucesso).toBe(true)
    expect(reordenarFocoNaPilha).toHaveBeenCalledWith('foco-5', 2)
    expect(registrarLog).toHaveBeenCalledWith(USUARIO, 'reordenar_foco', {
      foco_id: 'foco-5',
      titulo: 'Redação',
      de: 5,
      para: 2,
    })
  })

  it('a regra é conferida no serviço: posição recusada não chega ao banco', async () => {
    const resultado = await mudarPosicao(QUINTO, 1, COM_ESTRELA, USUARIO)

    expect(resultado.sucesso).toBe(false)
    expect(reordenarFocoNaPilha).not.toHaveBeenCalled()
    expect(registrarLog).not.toHaveBeenCalled()
  })
})
