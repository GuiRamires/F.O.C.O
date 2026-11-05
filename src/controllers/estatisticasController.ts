import { carregarEstatisticas, type Estatisticas } from '../services/estatisticasService'

export type ResultadoEstatisticas =
  | { sucesso: true; estatisticas: Estatisticas }
  | { sucesso: false; mensagem: string }

export async function handleCarregarEstatisticas(userId: string): Promise<ResultadoEstatisticas> {
  try {
    const estatisticas = await carregarEstatisticas(userId, new Date())
    return { sucesso: true, estatisticas }
  } catch (erro) {
    console.error(erro)
    return {
      sucesso: false,
      mensagem: 'Não foi possível carregar suas estatísticas agora. Confira sua conexão e tente de novo.',
    }
  }
}