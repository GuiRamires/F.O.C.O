import { useEffect, useRef, useState } from 'react'
import { animate, useInView } from 'motion/react'

interface CountUpProps {
  ate: number
  de?: number
  duracao?: number
  sufixo?: string
}

function CountUp({ ate, de = 0, duracao = 1.4, sufixo = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const visivel = useInView(ref, { once: true, amount: 0.6 })
  const [valor, setValor] = useState(de)
  const atual = useRef(de)

  useEffect(() => {
    if (!visivel) return
    const animacao = animate(atual.current, ate, {
      duration: duracao,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        atual.current = v
        setValor(v)
      },
    })
    return () => animacao.stop()
  }, [visivel, ate, duracao])

  return (
    <span ref={ref}>
      {Math.round(valor)}
      {sufixo}
    </span>
  )
}

export default CountUp
