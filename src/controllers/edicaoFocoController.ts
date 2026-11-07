import type { FocoComProgresso } from '../services/focoService'
import { editarFoco, type DadosDaEdicao, type ResultadoEdicao } from '../services/edicaoFocoService'

export async function handleEditarFoco(
  foco: FocoComProgresso,
  dados: DadosDaEdicao,
  userId: string
): Promise<ResultadoEdicao> {
  try {
    return await editarFoco(foco, dados, userId)
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: 'Não foi possível salvar as alterações agora. Confira sua conexão e tente de novo.' }
  }
}
