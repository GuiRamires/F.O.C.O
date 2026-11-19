import { atualizarSenha, confirmarCodigoRecuperacao, solicitarCodigoRecuperacao } from '../repositories/contaRepository'
import { mensagemDeFalha, validarEmail, type ResultadoConta } from './contaService'
import { registrarLog } from './logService'
import { validarSenha } from './validarSenha'

export const INTERVALO_REENVIO_SEGUNDOS = 60
export const MENSAGEM_CODIGO_ENVIADO =
  'Se houver uma conta com este e-mail, enviamos um código de verificação. Ele vale por 1 hora e só pode ser usado uma vez.'

export interface DadosRedefinicao {
  email: string
  codigo: string
  novaSenha: string
  confirmacao: string
}

export function validarCodigo(codigo: string): string | null {
  if (!/^\d{6,10}$/.test(codigo.trim())) return 'Digite o código de verificação recebido por e-mail.'
  return null
}

export function segundosParaReenvio(ultimoEnvio: number | null, agora: number): number {
  if (ultimoEnvio === null) return 0
  const decorridos = Math.floor((agora - ultimoEnvio) / 1000)
  return Math.max(INTERVALO_REENVIO_SEGUNDOS - decorridos, 0)
}

export function validarRedefinicao(dados: DadosRedefinicao): string[] {
  const erros: string[] = []
  const erroCodigo = validarCodigo(dados.codigo)
  if (erroCodigo) erros.push(erroCodigo)
  if (!dados.novaSenha) erros.push('Informe a nova senha.')
  if (dados.novaSenha && dados.novaSenha !== dados.confirmacao) erros.push('As senhas não coincidem.')
  if (dados.novaSenha) erros.push(...validarSenha(dados.novaSenha, '', dados.email).erros)
  return erros
}

export async function solicitarRecuperacao(email: string): Promise<ResultadoConta> {
  const erro = validarEmail(email)
  if (erro) return { sucesso: false, mensagem: erro }

  try {
    await solicitarCodigoRecuperacao(email.trim())
  } catch (falha) {
    return { sucesso: false, mensagem: mensagemDeFalha(falha, 'Não foi possível enviar o código agora. Tente de novo.') }
  }

  return { sucesso: true, mensagem: MENSAGEM_CODIGO_ENVIADO }
}

export async function redefinirSenha(dados: DadosRedefinicao): Promise<ResultadoConta> {
  const erros = validarRedefinicao(dados)
  if (erros.length > 0) return { sucesso: false, mensagem: erros.join(' ') }

  let userId: string
  try {
    userId = await confirmarCodigoRecuperacao(dados.email.trim(), dados.codigo.trim())
  } catch (falha) {
    return { sucesso: false, mensagem: mensagemDeFalha(falha, 'O código é inválido ou expirou. Peça um novo código.') }
  }

  try {
    await atualizarSenha(dados.novaSenha)
  } catch (falha) {
    return { sucesso: false, mensagem: mensagemDeFalha(falha, 'Não foi possível salvar a nova senha agora.') }
  }

  await registrarLog(userId, 'redefinir_senha')
  return { sucesso: true, mensagem: 'Senha redefinida. Você já está conectado.' }
}
