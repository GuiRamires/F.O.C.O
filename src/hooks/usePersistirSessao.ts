import { useEffect } from 'react'
import { handleApagarSessao, handleGuardarSessao } from '../controllers/sessaoController'
import { pausarSessao, type SessaoEmAndamento } from '../services/sessaoService'

const INTERVALO_SINAL_MS = 5000

export function usePersistirSessao(emAndamento: SessaoEmAndamento | null) {
  useEffect(() => {
    if (!emAndamento) {
      handleApagarSessao()
      return
    }

    const atual = emAndamento
    handleGuardarSessao(atual)
    if (atual.sessao.pausadaEm !== null) return

    const sinal = setInterval(() => handleGuardarSessao(atual), INTERVALO_SINAL_MS)

    function pausarAoSair() {
      handleGuardarSessao({ ...atual, sessao: pausarSessao(atual.sessao, Date.now()) })
    }
    window.addEventListener('pagehide', pausarAoSair)

    return () => {
      clearInterval(sinal)
      window.removeEventListener('pagehide', pausarAoSair)
    }
  }, [emAndamento])
}