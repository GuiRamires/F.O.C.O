import type { FocoComProgresso } from '../services/focoService'
import {
  atribuirEstrela,
  removerEstrela,
  verificarAtribuicaoEstrela,
  type AvaliacaoEstrela,
  type ResultadoAcaoEstrela,
} from '../services/estrelaService'

const MENSAGEM_SEM_CONEXAO = 'Confira sua conexão e tente de novo.'

export async function handleVerificarEstrela(
  foco: FocoComProgresso,
  userId: string
): Promise<AvaliacaoEstrela> {
  try {
    return await verificarAtribuicaoEstrela(foco, userId)
  } catch (erro) {
    console.error(erro)
    return { permitido: false, mensagem: `Não foi possível verificar a Estrela agora. ${MENSAGEM_SEM_CONEXAO}` }
  }
}

export async function handleAtribuirEstrela(
  foco: FocoComProgresso,
  userId: string
): Promise<ResultadoAcaoEstrela> {
  try {
    return await atribuirEstrela(foco, userId)
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: `Não foi possível dar a Estrela agora. ${MENSAGEM_SEM_CONEXAO}` }
  }
}

export async function handleRemoverEstrela(
  foco: FocoComProgresso,
  userId: string,
  fraseDigitada: string,
  totalAtivos: number
): Promise<ResultadoAcaoEstrela> {
  try {
    return await removerEstrela(foco.id, userId, fraseDigitada, totalAtivos)
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: `Não foi possível retirar a Estrela agora. ${MENSAGEM_SEM_CONEXAO}` }
  }
}