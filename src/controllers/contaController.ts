import { buscarEmailAtual, buscarPerfil, type PerfilConta } from '../repositories/contaRepository'
import {
  alterarEmail,
  alterarNome,
  alterarSenha,
  confirmarTrocaSenhaComCodigo,
  excluirConta,
  reenviarCodigoReautenticacao,
  type DadosTrocaSenha,
  type ResultadoConta,
} from '../services/contaService'
import { exportarDados, type ArquivoExportado, type FormatoExportacao } from '../services/exportacaoService'

const MENSAGEM_SEM_CONEXAO = 'Confira sua conexão e tente de novo.'

export interface DadosDaConta extends PerfilConta {
  email: string
}

async function protegido(acao: () => Promise<ResultadoConta>, mensagemErro: string): Promise<ResultadoConta> {
  try {
    return await acao()
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: `${mensagemErro} ${MENSAGEM_SEM_CONEXAO}` }
  }
}

export async function handleCarregarConta(userId: string): Promise<DadosDaConta | null> {
  try {
    const [perfil, email] = await Promise.all([buscarPerfil(userId), buscarEmailAtual()])
    return { ...perfil, email }
  } catch (erro) {
    console.error(erro)
    return null
  }
}

export async function handleCarregarPerfil(userId: string): Promise<PerfilConta | null> {
  try {
    return await buscarPerfil(userId)
  } catch (erro) {
    console.error(erro)
    return null
  }
}

export function handleAlterarNome(userId: string, nome: string): Promise<ResultadoConta> {
  return protegido(() => alterarNome(userId, nome), 'Não foi possível salvar o nome agora.')
}

export function handleAlterarEmail(userId: string, emailAtual: string, novoEmail: string): Promise<ResultadoConta> {
  return protegido(() => alterarEmail(userId, emailAtual, novoEmail), 'Não foi possível pedir a troca de e-mail agora.')
}

export function handleAlterarSenha(userId: string, dados: DadosTrocaSenha): Promise<ResultadoConta> {
  return protegido(() => alterarSenha(userId, dados), 'Não foi possível alterar a senha agora.')
}

export function handleConfirmarSenhaComCodigo(userId: string, novaSenha: string, codigo: string): Promise<ResultadoConta> {
  return protegido(() => confirmarTrocaSenhaComCodigo(userId, novaSenha, codigo), 'Não foi possível alterar a senha agora.')
}

export function handleReenviarCodigo(): Promise<ResultadoConta> {
  return protegido(() => reenviarCodigoReautenticacao(), 'Não foi possível enviar o código agora.')
}

export function handleExcluirConta(palavraDigitada: string): Promise<ResultadoConta> {
  return protegido(() => excluirConta(palavraDigitada), 'Não foi possível excluir a conta agora.')
}

export async function handleExportarDados(
  userId: string,
  formato: FormatoExportacao,
): Promise<{ sucesso: true; arquivo: ArquivoExportado } | { sucesso: false; mensagem: string }> {
  try {
    return { sucesso: true, arquivo: await exportarDados(userId, formato) }
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: `Não foi possível exportar seus dados agora. ${MENSAGEM_SEM_CONEXAO}` }
  }
}
