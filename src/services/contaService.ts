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
import { mascararFrase } from './confirmacaoReflexiva'
import { registrarLog } from './logService'
import { validarSenha } from './validarSenha'

export const LIMITE_NOME = 80
export const PALAVRA_EXCLUIR_CONTA = 'EXCLUIR'

export interface ResultadoConta {
  sucesso: boolean
  mensagem: string
  precisaCodigo?: boolean
}

export interface DadosTrocaSenha {
  senhaAtual: string
  novaSenha: string
  confirmacao: string
  nome: string
  email: string
}

const FORMATO_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function validarNome(nome: string): string | null {
  const limpo = nome.trim()
  if (!limpo) return 'O nome é obrigatório.'
  if (limpo.length > LIMITE_NOME) return `O nome pode ter até ${LIMITE_NOME} caracteres.`
  return null
}

export function validarEmail(email: string): string | null {
  const limpo = email.trim()
  if (!limpo) return 'O e-mail é obrigatório.'
  if (limpo.length > 254 || !FORMATO_EMAIL.test(limpo)) return 'Informe um e-mail válido.'
  return null
}

export function validarTrocaEmail(emailAtual: string, novoEmail: string): string | null {
  const erro = validarEmail(novoEmail)
  if (erro) return erro
  if (novoEmail.trim().toLowerCase() === emailAtual.trim().toLowerCase()) {
    return 'O novo e-mail precisa ser diferente do atual.'
  }
  return null
}

export function validarTrocaSenha(dados: DadosTrocaSenha): string[] {
  const erros: string[] = []
  if (!dados.senhaAtual) erros.push('Informe a senha atual.')
  if (!dados.novaSenha) erros.push('Informe a nova senha.')
  if (dados.novaSenha && dados.novaSenha !== dados.confirmacao) erros.push('As senhas não coincidem.')
  if (dados.novaSenha && dados.novaSenha === dados.senhaAtual) erros.push('A nova senha precisa ser diferente da atual.')
  if (dados.novaSenha) erros.push(...validarSenha(dados.novaSenha, dados.nome, dados.email).erros)
  return erros
}

export function segundosDeEspera(mensagem: string): number | null {
  const encontrado = /(\d+)\s*seconds?/.exec(mensagem)
  return encontrado ? Number(encontrado[1]) : null
}

export function mensagemDeFalha(erro: unknown, padrao: string): string {
  if (!(erro instanceof FalhaAutenticacao)) return padrao

  switch (erro.codigo) {
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit': {
      const segundos = segundosDeEspera(erro.message)
      return segundos
        ? `Aguarde ${segundos} segundos antes de pedir um novo código.`
        : 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.'
    }
    case 'otp_expired':
    case 'reauthentication_not_valid':
      return 'O código é inválido ou expirou. Peça um novo código.'
    case 'same_password':
      return 'A nova senha precisa ser diferente da atual.'
    case 'weak_password':
      return 'A nova senha não atende à política de senha.'
    case 'email_exists':
      return 'Este e-mail já está em uso em outra conta.'
    default:
      return padrao
  }
}

export function mascararPalavraExcluirConta(texto: string): string {
  return mascararFrase(texto, PALAVRA_EXCLUIR_CONTA.length)
}

export function palavraExcluirContaConfere(texto: string): boolean {
  return texto.trim() === PALAVRA_EXCLUIR_CONTA
}

export async function alterarNome(userId: string, nome: string): Promise<ResultadoConta> {
  const erro = validarNome(nome)
  if (erro) return { sucesso: false, mensagem: erro }

  await atualizarNome(userId, nome.trim())
  await registrarLog(userId, 'alterar_conta', { campo: 'nome' })
  return { sucesso: true, mensagem: 'Nome atualizado.' }
}

export async function alterarEmail(userId: string, emailAtual: string, novoEmail: string): Promise<ResultadoConta> {
  const erro = validarTrocaEmail(emailAtual, novoEmail)
  if (erro) return { sucesso: false, mensagem: erro }

  try {
    await solicitarTrocaEmail(novoEmail.trim())
  } catch (falha) {
    return { sucesso: false, mensagem: mensagemDeFalha(falha, 'Não foi possível pedir a troca de e-mail agora.') }
  }

  await registrarLog(userId, 'alterar_conta', { campo: 'email', etapa: 'solicitada' })
  return {
    sucesso: true,
    mensagem:
      'Enviamos um link de confirmação para o e-mail atual e outro para o novo. A troca só acontece depois das duas confirmações; até lá, o e-mail atual continua valendo.',
  }
}

async function concluirTrocaSenha(userId: string): Promise<ResultadoConta> {
  await registrarLog(userId, 'alterar_conta', { campo: 'senha' })
  return { sucesso: true, mensagem: 'Senha alterada.' }
}

export async function alterarSenha(userId: string, dados: DadosTrocaSenha): Promise<ResultadoConta> {
  const erros = validarTrocaSenha(dados)
  if (erros.length > 0) return { sucesso: false, mensagem: erros.join(' ') }

  const senhaConfere = await conferirSenhaAtual(dados.email, dados.senhaAtual)
  if (!senhaConfere) return { sucesso: false, mensagem: 'A senha atual está incorreta.' }

  try {
    await atualizarSenha(dados.novaSenha)
    return await concluirTrocaSenha(userId)
  } catch (falha) {
    if (falha instanceof FalhaAutenticacao && falha.codigo === 'reauthentication_needed') {
      await solicitarCodigoReautenticacao()
      return {
        sucesso: false,
        precisaCodigo: true,
        mensagem: 'Por segurança, enviamos um código de verificação para o seu e-mail. Digite-o para concluir a troca.',
      }
    }
    return { sucesso: false, mensagem: mensagemDeFalha(falha, 'Não foi possível alterar a senha agora.') }
  }
}

export async function confirmarTrocaSenhaComCodigo(
  userId: string,
  novaSenha: string,
  codigo: string,
): Promise<ResultadoConta> {
  if (!/^\d{6,10}$/.test(codigo.trim())) return { sucesso: false, mensagem: 'Digite o código recebido por e-mail.' }

  try {
    await atualizarSenha(novaSenha, codigo.trim())
    return await concluirTrocaSenha(userId)
  } catch (falha) {
    return { sucesso: false, mensagem: mensagemDeFalha(falha, 'Não foi possível alterar a senha agora.') }
  }
}

export async function reenviarCodigoReautenticacao(): Promise<ResultadoConta> {
  try {
    await solicitarCodigoReautenticacao()
    return { sucesso: true, mensagem: 'Enviamos um novo código para o seu e-mail.' }
  } catch (falha) {
    return { sucesso: false, mensagem: mensagemDeFalha(falha, 'Não foi possível enviar o código agora.') }
  }
}

export async function excluirConta(palavraDigitada: string): Promise<ResultadoConta> {
  if (!palavraExcluirContaConfere(palavraDigitada)) {
    return { sucesso: false, mensagem: `Digite ${PALAVRA_EXCLUIR_CONTA} para confirmar.` }
  }

  await excluirContaNoServidor(PALAVRA_EXCLUIR_CONTA)
  await encerrarSessao()
  return { sucesso: true, mensagem: 'Sua conta e seus dados foram excluídos.' }
}
