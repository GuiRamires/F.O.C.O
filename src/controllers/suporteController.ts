import type { Chamado, DadosChamadoSemLogin } from '../repositories/suporteRepository'
import { abrirChamado, abrirChamadoSemLogin, listarMeusChamados } from '../services/suporteService'

const MENSAGEM_SEM_CONEXAO = 'Confira sua conexão e tente de novo.'

export async function handleListarMeusChamados(userId: string): Promise<{ sucesso: boolean; chamados: Chamado[] }> {
  try {
    return { sucesso: true, chamados: await listarMeusChamados(userId) }
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, chamados: [] }
  }
}

export async function handleAbrirChamado(
  userId: string,
  categoria: string,
  descricao: string,
): Promise<{ sucesso: boolean; mensagem: string }> {
  try {
    return await abrirChamado(userId, categoria, descricao)
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: `Não foi possível abrir o chamado agora. ${MENSAGEM_SEM_CONEXAO}` }
  }
}

export async function handleAbrirChamadoSemLogin(dados: DadosChamadoSemLogin): Promise<{ sucesso: boolean; mensagem: string }> {
  try {
    return await abrirChamadoSemLogin(dados)
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: `Não foi possível enviar a solicitação agora. ${MENSAGEM_SEM_CONEXAO}` }
  }
}
