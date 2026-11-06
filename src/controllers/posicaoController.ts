import type { FocoComProgresso } from '../services/focoService'
import { mudarPosicao, type ResultadoPosicao, type SituacaoDaPilha } from '../services/posicaoService'

export async function handleMudarPosicao(
  foco: FocoComProgresso,
  novaPosicao: number,
  pilha: SituacaoDaPilha,
  userId: string
): Promise<ResultadoPosicao> {
  try {
    return await mudarPosicao(foco, novaPosicao, pilha, userId)
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: 'Não foi possível mudar a posição agora. Atualize a página e tente de novo.' }
  }
}
