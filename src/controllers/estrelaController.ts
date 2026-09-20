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

import { atribuirEstrela, removerEstrela, existeFocoComEstrela } from '../services/estrelaService'
import type { ResultadoAcaoEstrela } from '../services/estrelaService'

export async function handleAtribuirEstrela(focoId: string, userId: string): Promise<ResultadoAcaoEstrela> {
  try {
    const jaTemEstrela = await existeFocoComEstrela(userId)

    if (jaTemEstrela) {
      return {
        sucesso: false,
        mensagem: 'Já existe um Foco com a Estrela Dourada. Remova a prioridade dele antes de atribuir a outro.',
      }
    }

    return await atribuirEstrela(focoId)
  } catch (error) {
    return {
      sucesso: false,
      mensagem: error instanceof Error ? error.message : 'Erro inesperado ao atribuir a estrela.',
    }
  }
}

export async function handleRemoverEstrela(focoId: string): Promise<ResultadoAcaoEstrela> {
  try {
    return await removerEstrela(focoId)
  } catch (error) {
    return {
      sucesso: false,
      mensagem: error instanceof Error ? error.message : 'Erro inesperado ao remover a estrela.',
    }
  }
}