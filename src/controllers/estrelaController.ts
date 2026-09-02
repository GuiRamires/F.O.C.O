import { tentarAtribuirEstrela } from '../services/estrelaService'
import type { ResultadoTentativaEstrela } from '../services/estrelaService'

export async function handleTentarAtribuirEstrela(focoId: string): Promise<ResultadoTentativaEstrela> {
  try {
    return await tentarAtribuirEstrela(focoId)
  } catch (error) {
    return {
      permitido: false,
      mensagem: error instanceof Error ? error.message : 'Erro inesperado ao tentar atribuir a estrela.',
      horasAcumuladas: 0,
      horasFaltantes: 0,
    }
  }
}