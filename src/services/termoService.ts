import { buscarUltimoAceite, buscarVersaoPendente, registrarAceite, type AceiteDoTermo } from '../repositories/termoRepository'

export const VERSAO_DO_TERMO = '1.1'

export function avisoDeNovaVersao(versao: string): string {
  return `O Termo de Uso e a Política de Privacidade foram atualizados (versão ${versao}). Para continuar usando o F.O.C.O., leia até o final e aceite a nova versão.`
}

export function verificarTermoPendente(): Promise<string | null> {
  return buscarVersaoPendente()
}

export async function aceitarTermo(): Promise<string> {
  return registrarAceite()
}

export function consultarUltimoAceite(userId: string): Promise<AceiteDoTermo | null> {
  return buscarUltimoAceite(userId)
}
