import { useCallback, useEffect, useRef, useState } from 'react'
import { abrirJanelaFlutuante } from '../utils/janelaFlutuante'

export function useJanelaFlutuante() {
  const [janela, setJanela] = useState<Window | null>(null)
  const abrindo = useRef(false)

  const abrir = useCallback(async () => {
    if (abrindo.current) return
    abrindo.current = true
    const nova = await abrirJanelaFlutuante()
    abrindo.current = false
    if (!nova) return
    nova.addEventListener('pagehide', () => setJanela(null), { once: true })
    setJanela(nova)
  }, [])

  const fechar = useCallback(() => {
    janela?.close()
  }, [janela])

  useEffect(() => {
    if (!janela) return
    return () => janela.close()
  }, [janela])

  return { janela, abrir, fechar }
}   