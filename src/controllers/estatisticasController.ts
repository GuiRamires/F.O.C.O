import { carregarSessoesDoAluno, type SessaoComFoco } from '../services/estatisticasService'

export type ResultadoSessoes =
  | { sucesso: true; sessoes: SessaoComFoco[] }
  | { sucesso: false; mensagem: string }

export async function handleCarregarSessoes(userId: string): Promise<ResultadoSessoes> {
  try {
    const sessoes = await carregarSessoesDoAluno(userId)
    return { sucesso: true, sessoes }
  } catch (erro) {
    console.error(erro)
    return {
      sucesso: false,
      mensagem: 'Não foi possível carregar suas estatísticas agora. Confira sua conexão e tente de novo.',
    }
  }
}
