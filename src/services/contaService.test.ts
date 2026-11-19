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
  }
})

vi.mock('./logService', () => ({
  registrarLog: vi.fn(),
}))

import {
  atualizarNome,
  atualizarSenha,
  conferirSenhaAtual,
  encerrarSessao,
  excluirContaNoServidor,
  FalhaAutenticacao,
  solicitarCodigoReautenticacao,
  solicitarTrocaEmail,
} from '../repositories/contaRepository'
import { registrarLog } from './logService'
import {
  alterarEmail,
  alterarNome,
  alterarSenha,
  confirmarTrocaSenhaComCodigo,
  excluirConta,
  mascararPalavraExcluirConta,
  mensagemDeFalha,
  palavraExcluirContaConfere,
  reenviarCodigoReautenticacao,
  segundosDeEspera,
  validarEmail,
  validarNome,
  validarTrocaEmail,
  validarTrocaSenha,
} from './contaService'

const USUARIO = 'usuario-1'
const DADOS_SENHA = {
  senhaAtual: 'SenhaAtual9',
  novaSenha: 'NovaSenha7x',
  confirmacao: 'NovaSenha7x',
  nome: 'Maria',
  email: 'maria@exemplo.com',
}

function falhaAuth(codigo: string, mensagem = 'erro') {
  return new FalhaAutenticacao({ codigo, mensagem, status: 400 })
}

describe('Minha conta: validações (RF32)', () => {
  it('o nome segue as regras do cadastro (RN32.1)', () => {
    expect(validarNome('  ')).toBe('O nome é obrigatório.')
    expect(validarNome('a'.repeat(81))).toContain('até 80')
    expect(validarNome(' Maria ')).toBeNull()
  })

  it('o e-mail precisa ser válido e diferente do atual', () => {
    expect(validarEmail('maria')).toBe('Informe um e-mail válido.')
    expect(validarEmail('')).toBe('O e-mail é obrigatório.')
    expect(validarTrocaEmail('maria@exemplo.com', 'MARIA@exemplo.com')).toContain('diferente')
    expect(validarTrocaEmail('maria@exemplo.com', 'nova@exemplo.com')).toBeNull()
  })

  it('recusa a nova senha com sequência (CA32.4)', () => {
    const erros = validarTrocaSenha({ ...DADOS_SENHA, novaSenha: 'Abcd1234', confirmacao: 'Abcd1234' })

    expect(erros.join(' ')).toMatch(/sequ/i)
  })

  it('exige confirmação igual e senha diferente da atual', () => {
    expect(validarTrocaSenha({ ...DADOS_SENHA, confirmacao: 'Outra' })).toContain('As senhas não coincidem.')
    expect(validarTrocaSenha({ ...DADOS_SENHA, novaSenha: 'SenhaAtual9', confirmacao: 'SenhaAtual9' })).toContain(
      'A nova senha precisa ser diferente da atual.',
    )
    expect(validarTrocaSenha({ ...DADOS_SENHA, senhaAtual: '', novaSenha: '', confirmacao: '' })).toEqual([
      'Informe a senha atual.',
      'Informe a nova senha.',
    ])
  })

  it('traduz as falhas do serviço de autenticação', () => {
    expect(segundosDeEspera('you can only request this after 39 seconds.')).toBe(39)
    expect(segundosDeEspera('sem número')).toBeNull()
    expect(mensagemDeFalha(falhaAuth('over_email_send_rate_limit', 'after 39 seconds'), 'x')).toBe(
      'Aguarde 39 segundos antes de pedir um novo código.',
    )
    expect(mensagemDeFalha(falhaAuth('over_request_rate_limit', 'muitas'), 'x')).toContain('Aguarde um minuto')
    expect(mensagemDeFalha(falhaAuth('otp_expired'), 'x')).toContain('inválido ou expirou')
    expect(mensagemDeFalha(falhaAuth('same_password'), 'x')).toContain('diferente')
    expect(mensagemDeFalha(falhaAuth('weak_password'), 'x')).toContain('política')
    expect(mensagemDeFalha(falhaAuth('email_exists'), 'x')).toContain('em uso')
    expect(mensagemDeFalha(falhaAuth('outro'), 'padrão')).toBe('padrão')
    expect(mensagemDeFalha(new Error('qualquer'), 'padrão')).toBe('padrão')
  })
})

describe('Minha conta: alterações (RF32)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('salva o nome sem espaços e registra a alteração sem o nome no log (RN08.6)', async () => {
    const resultado = await alterarNome(USUARIO, '  Maria Souza ')

    expect(resultado.sucesso).toBe(true)
    expect(atualizarNome).toHaveBeenCalledWith(USUARIO, 'Maria Souza')
    expect(registrarLog).toHaveBeenCalledWith(USUARIO, 'alterar_conta', { campo: 'nome' })
  })

  it('não salva um nome inválido', async () => {
    const resultado = await alterarNome(USUARIO, ' ')

    expect(resultado.sucesso).toBe(false)
    expect(atualizarNome).not.toHaveBeenCalled()
  })

  it('pede a troca de e-mail com confirmação nos dois endereços (RN32.2)', async () => {
    const resultado = await alterarEmail(USUARIO, 'maria@exemplo.com', ' nova@exemplo.com ')

    expect(solicitarTrocaEmail).toHaveBeenCalledWith('nova@exemplo.com')
    expect(resultado.mensagem).toContain('e-mail atual continua valendo')
    expect(registrarLog).toHaveBeenCalledWith(USUARIO, 'alterar_conta', { campo: 'email', etapa: 'solicitada' })
  })

  it('informa quando o novo e-mail já está em uso', async () => {
    vi.mocked(solicitarTrocaEmail).mockRejectedValueOnce(falhaAuth('email_exists'))

    const resultado = await alterarEmail(USUARIO, 'maria@exemplo.com', 'usado@exemplo.com')

    expect(resultado).toEqual({ sucesso: false, mensagem: 'Este e-mail já está em uso em outra conta.' })
    expect(registrarLog).not.toHaveBeenCalled()
  })

  it('não pede a troca de e-mail inválida', async () => {
    const resultado = await alterarEmail(USUARIO, 'maria@exemplo.com', 'invalido')

    expect(resultado.sucesso).toBe(false)
    expect(solicitarTrocaEmail).not.toHaveBeenCalled()
  })

  it('recusa a troca de senha com a senha atual incorreta (CA32.3)', async () => {
    vi.mocked(conferirSenhaAtual).mockResolvedValueOnce(false)

    const resultado = await alterarSenha(USUARIO, DADOS_SENHA)

    expect(resultado).toEqual({ sucesso: false, mensagem: 'A senha atual está incorreta.' })
    expect(atualizarSenha).not.toHaveBeenCalled()
  })

  it('troca a senha quando a senha atual confere', async () => {
    vi.mocked(conferirSenhaAtual).mockResolvedValueOnce(true)

    const resultado = await alterarSenha(USUARIO, DADOS_SENHA)

    expect(atualizarSenha).toHaveBeenCalledWith('NovaSenha7x')
    expect(resultado.sucesso).toBe(true)
    expect(registrarLog).toHaveBeenCalledWith(USUARIO, 'alterar_conta', { campo: 'senha' })
  })

  it('pede o código de verificação quando a sessão é antiga (RN32.3)', async () => {
    vi.mocked(conferirSenhaAtual).mockResolvedValueOnce(true)
    vi.mocked(atualizarSenha).mockRejectedValueOnce(falhaAuth('reauthentication_needed'))

    const resultado = await alterarSenha(USUARIO, DADOS_SENHA)

    expect(solicitarCodigoReautenticacao).toHaveBeenCalled()
    expect(resultado).toMatchObject({ sucesso: false, precisaCodigo: true })
  })

  it('não valida a troca de senha com dados incompletos', async () => {
    const resultado = await alterarSenha(USUARIO, { ...DADOS_SENHA, confirmacao: 'x' })

    expect(resultado.sucesso).toBe(false)
    expect(conferirSenhaAtual).not.toHaveBeenCalled()
  })

  it('traduz outra falha ao trocar a senha', async () => {
    vi.mocked(conferirSenhaAtual).mockResolvedValueOnce(true)
    vi.mocked(atualizarSenha).mockRejectedValueOnce(falhaAuth('same_password'))

    const resultado = await alterarSenha(USUARIO, DADOS_SENHA)

    expect(resultado.mensagem).toBe('A nova senha precisa ser diferente da atual.')
  })

  it('conclui a troca com o código recebido', async () => {
    const resultado = await confirmarTrocaSenhaComCodigo(USUARIO, 'NovaSenha7x', ' 123456 ')

    expect(atualizarSenha).toHaveBeenCalledWith('NovaSenha7x', '123456')
    expect(resultado.sucesso).toBe(true)
  })

  it('recusa um código mal formado ou inválido', async () => {
    expect((await confirmarTrocaSenhaComCodigo(USUARIO, 'NovaSenha7x', 'abc')).sucesso).toBe(false)

    vi.mocked(atualizarSenha).mockRejectedValueOnce(falhaAuth('reauthentication_not_valid'))
    const resultado = await confirmarTrocaSenhaComCodigo(USUARIO, 'NovaSenha7x', '654321')

    expect(resultado.mensagem).toContain('inválido ou expirou')
  })

  it('reenvia o código de verificação', async () => {
    expect((await reenviarCodigoReautenticacao()).sucesso).toBe(true)

    vi.mocked(solicitarCodigoReautenticacao).mockRejectedValueOnce(falhaAuth('over_email_send_rate_limit', 'after 20 seconds'))
    expect((await reenviarCodigoReautenticacao()).mensagem).toContain('20 segundos')
  })
})

describe('exclusão da conta (RF07)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('só aceita a palavra EXCLUIR (CA07.3)', () => {
    expect(palavraExcluirContaConfere('EXCLUIR')).toBe(true)
    expect(palavraExcluirContaConfere('excluir')).toBe(false)
    expect(palavraExcluirContaConfere('EXCLUI')).toBe(false)
    expect(mascararPalavraExcluirConta('excluir123 agora')).toBe('EXCLUIR')
  })

  it('não chama o servidor com outra palavra', async () => {
    const resultado = await excluirConta('APAGAR')

    expect(resultado.sucesso).toBe(false)
    expect(excluirContaNoServidor).not.toHaveBeenCalled()
  })

  it('exclui pelo servidor e encerra a sessão (CA07.1)', async () => {
    const resultado = await excluirConta('EXCLUIR')

    expect(excluirContaNoServidor).toHaveBeenCalledWith('EXCLUIR')
    expect(encerrarSessao).toHaveBeenCalled()
    expect(resultado.sucesso).toBe(true)
  })
})
