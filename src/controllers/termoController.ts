import type { AceiteDoTermo } from '../repositories/termoRepository'
import { aceitarTermo, consultarUltimoAceite, verificarTermoPendente } from '../services/termoService'

export async function handleVerificarTermo(): Promise<string | null> {
  try {
    return await verificarTermoPendente()
  } catch (erro) {
    console.error(erro)
    return null
  }
}

export async function handleAceitarTermo(): Promise<{ sucesso: boolean; mensagem: string }> {
  try {
    await aceitarTermo()
    return { sucesso: true, mensagem: 'Aceite registrado.' }
  } catch (erro) {
    console.error(erro)
    return { sucesso: false, mensagem: 'Não foi possível registrar o aceite agora. Confira sua conexão e tente de novo.' }
  }
}

export async function handleConsultarAceite(userId: string): Promise<AceiteDoTermo | null> {
  try {
    return await consultarUltimoAceite(userId)
  } catch (erro) {
    console.error(erro)
    return null
  }
}
