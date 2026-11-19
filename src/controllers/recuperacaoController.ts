import type { ResultadoConta } from '../services/contaService'
import { redefinirSenha, solicitarRecuperacao, type DadosRedefinicao } from '../services/recuperacaoSenhaService'

const MENSAGEM_SEM_CONEXAO = 'Confira sua conexão e tente de novo.'

export async function handleSolicitarRecuperacao(email: string): Promise<ResultadoConta> {
  try {
    return await solicitarRecuperacao(email)
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: `Não foi possível enviar o código agora. ${MENSAGEM_SEM_CONEXAO}` }
  }
}

export async function handleRedefinirSenha(dados: DadosRedefinicao): Promise<ResultadoConta> {
  try {
    return await redefinirSenha(dados)
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: `Não foi possível redefinir a senha agora. ${MENSAGEM_SEM_CONEXAO}` }
  }
}
