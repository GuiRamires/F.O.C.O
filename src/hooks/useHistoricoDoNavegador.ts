import { useEffect, useEffectEvent, useRef } from 'react'
import { deveSubstituir } from '../utils/navegacao'

type AoVoltar = (destino: string | null) => string | null

function estaNaCamada(): boolean {
  return window.history.state?.camada === true
}

export function useHistoricoDoNavegador(chave: string | null, camadaAberta: boolean, aoVoltar: AoVoltar) {
  const chaveAtual = useRef<string | null>(null)
  const voltar = useEffectEvent(aoVoltar)

  useEffect(() => {
    window.history.scrollRestoration = 'manual'

    function aoMudarHistorico(evento: PopStateEvent) {
      const destino = typeof evento.state?.foco === 'string' ? evento.state.foco : null
      const resultado = voltar(destino)

      if (resultado === null) {
        if (chaveAtual.current) window.history.pushState({ foco: chaveAtual.current }, '')
        return
      }

      chaveAtual.current = resultado
      if (resultado !== destino) window.history.replaceState({ foco: resultado }, '')
    }

    window.addEventListener('popstate', aoMudarHistorico)
    return () => window.removeEventListener('popstate', aoMudarHistorico)
  }, [])

  useEffect(() => {
    if (chave === null) return

    if (chave !== chaveAtual.current) {
      const substituir = chaveAtual.current === null || estaNaCamada() || deveSubstituir(chaveAtual.current, chave)
      if (substituir) window.history.replaceState({ ...window.history.state, foco: chave, camada: false }, '')
      else window.history.pushState({ foco: chave }, '')
      chaveAtual.current = chave
      if (camadaAberta) window.history.pushState({ foco: chave, camada: true }, '')
      return
    }

    if (camadaAberta && !estaNaCamada()) window.history.pushState({ foco: chave, camada: true }, '')
    if (!camadaAberta && estaNaCamada()) window.history.back()
  }, [chave, camadaAberta])
}
