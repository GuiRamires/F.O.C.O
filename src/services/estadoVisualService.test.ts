import { describe, expect, it } from 'vitest'
import { corDoFocoNaPilha, estadoVisualDoFoco, type FocoParaExibir } from './estadoVisualService'
import { COR_PADRAO_FOCO } from './opcoesFoco'

function foco(posicao: number | null, dados: Partial<FocoParaExibir> = {}): FocoParaExibir {
  return { status: 'ativo', tem_estrela: false, posicao, cor_hex: null, ...dados }
}

describe('estados visuais da pilha (RF10)', () => {
  it('cinco Focos com Estrela: 1º dourado, 2º e 3º coloridos, 4º e 5º neutros (CA10.3)', () => {
    const pilha = [
      foco(1, { tem_estrela: true }),
      foco(2, { cor_hex: '#9B5CFF' }),
      foco(3),
      foco(4, { cor_hex: '#22C55E' }),
      foco(5),
    ]

    expect(pilha.map(estadoVisualDoFoco)).toEqual(['estrela', 'top', 'top', 'neutro', 'neutro'])
  })

  it('a cor escolhida aparece no Top 3, e sem escolha usa a cor padrão (RN10.3, RN12.4)', () => {
    expect(corDoFocoNaPilha(foco(2, { cor_hex: '#9B5CFF' }))).toBe('#9B5CFF')
    expect(corDoFocoNaPilha(foco(3))).toBe(COR_PADRAO_FOCO)
  })

  it('fora do Top 3 o Foco fica neutro, mas a cor continua guardada (RN11.3, CA12.2)', () => {
    const roxo = foco(4, { cor_hex: '#9B5CFF' })
    expect(corDoFocoNaPilha(roxo)).toBeNull()
    expect(corDoFocoNaPilha({ ...roxo, posicao: 2 })).toBe('#9B5CFF')
  })

  it('o dourado da Estrela vale mais que a cor escolhida (RN12.2)', () => {
    const estrela = foco(1, { tem_estrela: true, cor_hex: '#22C55E' })
    expect(estadoVisualDoFoco(estrela)).toBe('estrela')
    expect(corDoFocoNaPilha(estrela)).toBeNull()
  })

  it('sem Estrela, as posições 1 a 3 são todas Top 3', () => {
    expect([foco(1), foco(2), foco(3)].map(estadoVisualDoFoco)).toEqual(['top', 'top', 'top'])
  })

  it('Foco do Laboratório fica cinza, independente da cor (RN10.5)', () => {
    const arquivado = foco(null, { status: 'laboratorio_sonhos', cor_hex: '#EC4899' })
    expect(estadoVisualDoFoco(arquivado)).toBe('laboratorio')
    expect(corDoFocoNaPilha(arquivado)).toBeNull()
  })
})
