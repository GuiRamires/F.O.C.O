import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/focoRepository', () => ({
  atribuirEstrelaAoFoco: vi.fn(),
  existeFocoComEstrela: vi.fn(),
  existeSessaoDesde: vi.fn(),
  getTotalMinutosByFocoId: vi.fn(),
  removerEstrelaDoFoco: vi.fn(),
}))

vi.mock('./logService', () => ({
  registrarLog: vi.fn(),
}))

import { removerEstrelaDoFoco } from '../repositories/focoRepository'
import { registrarLog } from './logService'
import {
  FRASE_REMOVER_ESTRELA,
  avaliarAtribuicaoEstrela,
  estaNoTop3,
  fraseRemoverEstrelaConfere,
  mascararFraseEstrela,
  posicaoAposRemoverEstrela,
  removerEstrela,
  type CondicoesEstrela,
} from './estrelaService'

const PODE: CondicoesEstrela = {
  posicao: 2,
  minutosAcumulados: 600,
  existeOutraEstrela: false,
  praticadoAposResgate: true,
}

function mensagem(condicoes: Partial<CondicoesEstrela>): string {
  const avaliacao = avaliarAtribuicaoEstrela({ ...PODE, ...condicoes })
  return avaliacao.permitido ? '' : avaliacao.mensagem
}

describe('atribuir a Estrela Dourada', () => {
  it('só os três primeiros da pilha podem receber a Estrela (RN13.2, CA13.4)', () => {
    expect(estaNoTop3(1)).toBe(true)
    expect(estaNoTop3(3)).toBe(true)
    expect(estaNoTop3(4)).toBe(false)
    expect(estaNoTop3(null)).toBe(false)
  })

  it('com 10 h, no Top 3 e sem outra Estrela, a atribuição é permitida (CA13.2)', () => {
    expect(avaliarAtribuicaoEstrela(PODE)).toEqual({ permitido: true })
  })

  it('com 9 h 59 min, recusa e informa a exigência de 10 horas (CA13.1)', () => {
    const texto = mensagem({ minutosAcumulados: 599 })
    expect(texto).toContain('10 horas')
    expect(texto).toContain('Faltam 1 min')
  })

  it('mostra quanto falta em horas e minutos', () => {
    expect(mensagem({ minutosAcumulados: 0 })).toContain('Faltam 10 h.')
    expect(mensagem({ minutosAcumulados: 470 })).toContain('Faltam 2 h 10 min.')
  })

  it('recusa quando outro Foco já tem a Estrela (RN13.1, CA13.3)', () => {
    expect(mensagem({ existeOutraEstrela: true })).toContain('já tem um Foco com a Estrela')
  })

  it('recusa um Foco fora do Top 3 mesmo com horas suficientes (RN13.2)', () => {
    expect(mensagem({ posicao: 4 })).toContain('três primeiros')
  })

  it('recusa um Foco resgatado que ainda não teve sessão depois do resgate (RN13.4)', () => {
    expect(mensagem({ praticadoAposResgate: false })).toContain('Laboratório de Sonhos')
  })
})

describe('retirar a Estrela Dourada', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('o Foco vai para a 4ª posição ou, com menos de quatro Focos, para a última (RN14.3)', () => {
    expect(posicaoAposRemoverEstrela(5)).toBe(4)
    expect(posicaoAposRemoverEstrela(4)).toBe(4)
    expect(posicaoAposRemoverEstrela(3)).toBe(3)
    expect(posicaoAposRemoverEstrela(1)).toBe(1)
  })

  it('a frase só confere completa (RN14.1, CA14.2)', () => {
    expect(fraseRemoverEstrelaConfere(FRASE_REMOVER_ESTRELA)).toBe(true)
    expect(fraseRemoverEstrelaConfere('EU ESCOLHO MUDAR MINHA')).toBe(false)
    expect(fraseRemoverEstrelaConfere('')).toBe(false)
  })

  it('a frase aceita variação de maiúsculas e espaços extras (CA14.3)', () => {
    expect(fraseRemoverEstrelaConfere('  eu escolho   mudar minha Prioridade ')).toBe(true)
  })

  it('o campo aceita só letras, em maiúsculas, com um espaço entre as palavras e no tamanho da frase', () => {
    expect(mascararFraseEstrela('eu escolho')).toBe('EU ESCOLHO')
    expect(mascararFraseEstrela('  EU  ESCOLHO')).toBe('EU ESCOLHO')
    expect(mascararFraseEstrela('EU 3SCOLHO!')).toBe('EU SCOLHO')
    expect(mascararFraseEstrela(`${FRASE_REMOVER_ESTRELA} EXTRA`)).toBe(FRASE_REMOVER_ESTRELA)
  })

  it('com a frase errada, não chega a mexer no banco (RN14.2)', async () => {
    const resultado = await removerEstrela('foco-1', 'aluno-1', 'EU ESCOLHO', 5)

    expect(resultado.sucesso).toBe(false)
    expect(removerEstrelaDoFoco).not.toHaveBeenCalled()
    expect(registrarLog).not.toHaveBeenCalled()
  })

  it('com cinco Focos, retira a Estrela, manda o Foco para a 4ª posição e registra o log (CA14.4)', async () => {
    const resultado = await removerEstrela('foco-1', 'aluno-1', FRASE_REMOVER_ESTRELA, 5)

    expect(resultado.sucesso).toBe(true)
    expect(removerEstrelaDoFoco).toHaveBeenCalledWith('foco-1', 4)
    expect(registrarLog).toHaveBeenCalledWith('aluno-1', 'remover_estrela', { foco_id: 'foco-1', nova_posicao: 4 })
  })
})