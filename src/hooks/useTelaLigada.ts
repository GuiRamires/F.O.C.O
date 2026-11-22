import { useEffect } from 'react'

export function useTelaLigada(ativa: boolean) {
  useEffect(() => {
    if (!ativa || !('wakeLock' in navigator)) return

    let trava: WakeLockSentinel | null = null
    let encerrada = false

    async function pedirTrava() {
      if (document.visibilityState !== 'visible') return
      try {
        const nova = await navigator.wakeLock.request('screen')
        if (encerrada) {
          void nova.release()
          return
        }
        trava = nova
      } catch {
        trava = null
      }
    }

    function aoVoltarParaAba() {
      if (document.visibilityState === 'visible' && (trava === null || trava.released)) void pedirTrava()
    }

    void pedirTrava()
    document.addEventListener('visibilitychange', aoVoltarParaAba)

    return () => {
      encerrada = true
      document.removeEventListener('visibilitychange', aoVoltarParaAba)
      if (trava && !trava.released) void trava.release()
    }
  }, [ativa])
}
