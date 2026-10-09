import { listarFocosComProgresso, criarNovoFoco } from '../services/focoService'
import type { FocoComProgresso } from '../services/focoService'
import type { NovoFoco } from '../repositories/focoRepository'

export async function handleListarFocos(userId: string): Promise<{ sucesso: boolean; focos: FocoComProgresso[]; erro?: string }> {
  try {
    const focos = await listarFocosComProgresso(userId)
    return { sucesso: true, focos }
  } catch (error) {
    return {
      sucesso: false,
      focos: [],
      erro: error instanceof Error ? error.message : 'Erro ao carregar seus Focos.',
    }
  }
}

export async function handleCriarFoco(userId: string, foco: NovoFoco): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    await criarNovoFoco(userId, foco)
    return { sucesso: true }
  } catch (error) {
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro ao criar o Foco.',
    }
  }
}