import type { FocoComProgresso } from '../services/focoService'
import {
  arquivarFoco,
  excluirFoco,
  resgatarFoco,
  type ResultadoLaboratorio,
  type ResultadoResgate,
} from '../services/laboratorioService'

const MENSAGEM_SEM_CONEXAO = 'Confira sua conexão e tente de novo.'

export async function handleArquivarFoco(foco: FocoComProgresso, userId: string): Promise<ResultadoLaboratorio> {
  try {
    return await arquivarFoco(foco, userId)
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: `Não foi possível arquivar o Foco agora. ${MENSAGEM_SEM_CONEXAO}` }
  }
}

export async function handleResgatarFoco(foco: FocoComProgresso, userId: string): Promise<ResultadoResgate> {
  try {
    return await resgatarFoco(foco, userId)
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: `Não foi possível resgatar o Foco agora. ${MENSAGEM_SEM_CONEXAO}`, posicao: null }
  }
}

export async function handleExcluirFoco(
  foco: FocoComProgresso,
  userId: string,
  palavraDigitada: string
): Promise<ResultadoLaboratorio> {
  try {
    return await excluirFoco(foco, userId, palavraDigitada)
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: `Não foi possível excluir o Foco agora. ${MENSAGEM_SEM_CONEXAO}` }
  }
}
