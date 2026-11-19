import { describe, expect, it } from 'vitest'
import { calcularInatividade, inicioDaInatividade, textoDoAviso } from './inatividadeService'

const DIA = 24 * 60 * 60 * 1000
const AGORA = Date.parse('2026-11-30T12:00:00Z')
const diasAtras = (dias: number) => new Date(AGORA - dias * DIA).toISOString()

const FOCO = { status: 'ativo', tem_estrela: false, created_at: diasAtras(90), resgatado_em: null }

describe('inatividade do Foco (RF16 e RF17)', () => {
  it('conta a partir do evento mais recente entre criação, resgate e última sessão (RN16.1)', () => {
    const resgatado = { ...FOCO, resgatado_em: diasAtras(5) }

    expect(inicioDaInatividade(resgatado, diasAtras(60))).toBe(Date.parse(diasAtras(5)))
    expect(inicioDaInatividade(FOCO, diasAtras(20))).toBe(Date.parse(diasAtras(20)))
    expect(inicioDaInatividade(FOCO, null)).toBe(Date.parse(FOCO.created_at))
  })

  it('aos 14 dias exibe o aviso com 16 dias restantes (CA17.1)', () => {
    const situacao = calcularInatividade(FOCO, diasAtras(14), AGORA)

    expect(situacao).toEqual({ diasInativo: 14, diasRestantes: 16, emAviso: true })
    expect(textoDoAviso(situacao)).toContain('faltam 16 dias')
  })

  it('não avisa antes de 14 dias', () => {
    expect(calcularInatividade(FOCO, diasAtras(13), AGORA).emAviso).toBe(false)
  })

  it('não avisa o Foco com a Estrela nem o Foco do Laboratório (RN16.3)', () => {
    expect(calcularInatividade({ ...FOCO, tem_estrela: true }, diasAtras(40), AGORA).emAviso).toBe(false)
    expect(calcularInatividade({ ...FOCO, status: 'laboratorio_sonhos' }, diasAtras(40), AGORA).emAviso).toBe(false)
  })

  it('remove o aviso depois de uma sessão concluída (CA17.2)', () => {
    expect(calcularInatividade(FOCO, diasAtras(0), AGORA)).toEqual({ diasInativo: 0, diasRestantes: 30, emAviso: false })
  })

  it('informa a próxima verificação quando o prazo terminou', () => {
    const situacao = calcularInatividade(FOCO, diasAtras(31), AGORA)

    expect(situacao.diasRestantes).toBe(0)
    expect(textoDoAviso(situacao)).toContain('próxima verificação')
  })

  it('usa o singular quando falta 1 dia', () => {
    expect(textoDoAviso({ diasInativo: 29, diasRestantes: 1, emAviso: true })).toContain('faltam 1 dia ')
  })
})
