import { apagarSessaoLocal, lerSessaoLocal, salvarSessaoLocal } from '../repositories/sessaoLocalRepository'
import { confirmacaoConfere } from '../services/confirmacaoReflexiva'
import { PALAVRA_DESCARTAR, sessaoAoReabrir, type SessaoEmAndamento } from '../services/sessaoService'

export function handleRestaurarSessao(): SessaoEmAndamento | null {
  const guardada = lerSessaoLocal()
  if (!guardada) return null

  return {
    usuarioId: guardada.usuarioId,
    sessao: sessaoAoReabrir(guardada.sessao, guardada.ultimoSinal),
    tituloFoco: guardada.tituloFoco,
    porcentagemFoco: guardada.porcentagemFoco,
  }
}

export function handleGuardarSessao(emAndamento: SessaoEmAndamento): void {
  salvarSessaoLocal(emAndamento)
}

export function handleApagarSessao(): void {
  apagarSessaoLocal()
}

export function handleConfirmarDescarte(textoDigitado: string): boolean {
  return confirmacaoConfere(textoDigitado, PALAVRA_DESCARTAR)
}