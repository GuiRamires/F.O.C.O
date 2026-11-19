import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../repositories/contaRepository', async () => {
  const real = await vi.importActual<typeof import('../repositories/contaRepository')>('../repositories/contaRepository')
  return {
    FalhaAutenticacao: real.FalhaAutenticacao,
    atualizarNome: vi.fn(),
    atualizarSenha: vi.fn(),
    conferirSenhaAtual: vi.fn(),
    encerrarSessao: vi.fn(),
    excluirContaNoServidor: vi.fn(),
    solicitarCodigoReautenticacao: vi.fn(),
    solicitarTrocaEmail: vi.fn(),
    solicitarCodigoRecuperacao: vi.fn(),
    confirmarCodigoRecuperacao: vi.fn(),
  }
})

vi.mock('./logService', () => ({
  registrarLog: vi.fn(),
}))

import {
  atualizarSenha,
  confirmarCodigoRecuperacao,
  FalhaAutenticacao,
  solicitarCodigoRecuperacao,
} from '../repositories/contaRepository'
import { registrarLog } from './logService'
import {
  MENSAGEM_CODIGO_ENVIADO,
  redefinirSenha,
  segundosParaReenvio,
  solicitarRecuperacao,
  validarCodigo,
  validarRedefinicao,
} from './recuperacaoSenhaService'

const DADOS = { email: 'maria@exemplo.com', codigo: '123456', novaSenha: 'NovaSenha7x', confirmacao: 'NovaSenha7x' }

describe('recuperação de senha por código (RF06)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mostra a mesma mensagem para e-mails cadastrados e não cadastrados (RN06.1 e CA06.2)', async () => {
    const resultado = await solicitarRecuperacao(' maria@exemplo.com ')

    expect(solicitarCodigoRecuperacao).toHaveBeenCalledWith('maria@exemplo.com')
    expect(resultado).toEqual({ sucesso: true, mensagem: MENSAGEM_CODIGO_ENVIADO })
  })

  it('não envia para um e-mail mal formado', async () => {
    const resultado = await solicitarRecuperacao('maria')

    expect(resultado.sucesso).toBe(false)
    expect(solicitarCodigoRecuperacao).not.toHaveBeenCalled()
  })

  it('recusa um novo pedido antes de 60 segundos (RN06.2 e RNF12)', async () => {
    vi.mocked(solicitarCodigoRecuperacao).mockRejectedValueOnce(
      new FalhaAutenticacao({ codigo: 'over_email_send_rate_limit', mensagem: 'after 42 seconds', status: 429 }),
    )

    const resultado = await solicitarRecuperacao('maria@exemplo.com')

    expect(resultado).toEqual({ sucesso: false, mensagem: 'Aguarde 42 segundos antes de pedir um novo código.' })
  })

  it('calcula a espera para o reenvio', () => {
    expect(segundosParaReenvio(null, 1000)).toBe(0)
    expect(segundosParaReenvio(0, 15_000)).toBe(45)
    expect(segundosParaReenvio(0, 61_000)).toBe(0)
  })

  it('valida o código e a nova senha (RN06.3)', () => {
    expect(validarCodigo('12a456')).not.toBeNull()
    expect(validarCodigo('123456')).toBeNull()
    expect(validarRedefinicao({ ...DADOS, confirmacao: 'outra' })).toContain('As senhas não coincidem.')
    expect(validarRedefinicao({ ...DADOS, novaSenha: '', confirmacao: '' })).toContain('Informe a nova senha.')
    expect(validarRedefinicao({ ...DADOS, novaSenha: 'abc', confirmacao: 'abc' }).length).toBeGreaterThan(0)
  })

  it('redefine a senha com o código correto e registra no log', async () => {
    vi.mocked(confirmarCodigoRecuperacao).mockResolvedValueOnce('usuario-1')

    const resultado = await redefinirSenha(DADOS)

    expect(confirmarCodigoRecuperacao).toHaveBeenCalledWith('maria@exemplo.com', '123456')
    expect(atualizarSenha).toHaveBeenCalledWith('NovaSenha7x')
    expect(registrarLog).toHaveBeenCalledWith('usuario-1', 'redefinir_senha')
    expect(resultado.sucesso).toBe(true)
  })

  it('não altera a senha com código incorreto ou expirado (CA06.3 e CA06.4)', async () => {
    vi.mocked(confirmarCodigoRecuperacao).mockRejectedValueOnce(
      new FalhaAutenticacao({ codigo: 'otp_expired', mensagem: 'Token has expired or is invalid', status: 403 }),
    )

    const resultado = await redefinirSenha(DADOS)

    expect(atualizarSenha).not.toHaveBeenCalled()
    expect(resultado).toEqual({ sucesso: false, mensagem: 'O código é inválido ou expirou. Peça um novo código.' })
  })

  it('informa a falha ao salvar a nova senha', async () => {
    vi.mocked(confirmarCodigoRecuperacao).mockResolvedValueOnce('usuario-1')
    vi.mocked(atualizarSenha).mockRejectedValueOnce(
      new FalhaAutenticacao({ codigo: 'same_password', mensagem: 'same', status: 422 }),
    )

    const resultado = await redefinirSenha(DADOS)

    expect(resultado.mensagem).toBe('A nova senha precisa ser diferente da atual.')
    expect(registrarLog).not.toHaveBeenCalled()
  })

  it('não consulta o servidor com dados inválidos', async () => {
    const resultado = await redefinirSenha({ ...DADOS, codigo: '' })

    expect(resultado.sucesso).toBe(false)
    expect(confirmarCodigoRecuperacao).not.toHaveBeenCalled()
  })
})
