import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import '../styles/efeitos.css'

interface TrueFocusProps {
  letras: string[]
  cores?: string[]
  intervalo?: number
  onTrocar?: (indice: number) => void
}

function TrueFocus({ letras, cores = [], intervalo = 1800, onTrocar }: TrueFocusProps) {
  const [ativa, setAtiva] = useState(0)
  const [pausado, setPausado] = useState(false)
  const reduzirMovimento = useReducedMotion()
  const caixaRef = useRef<HTMLDivElement>(null)
  const letrasRef = useRef<(HTMLSpanElement | null)[]>([])
  const [moldura, setMoldura] = useState({ x: 0, y: 0, width: 0, height: 0 })

  useEffect(() => {
    if (pausado || reduzirMovimento) return
    const id = setInterval(() => setAtiva((i) => (i + 1) % letras.length), intervalo)
    return () => clearInterval(id)
  }, [pausado, reduzirMovimento, intervalo, letras.length])

  useEffect(() => onTrocar?.(ativa), [ativa, onTrocar])

  useLayoutEffect(() => {
    const medir = () => {
      const letra = letrasRef.current[ativa]
      const caixa = caixaRef.current
      if (!letra || !caixa) return
      const a = letra.getBoundingClientRect()
      const b = caixa.getBoundingClientRect()
      setMoldura({ x: a.left - b.left, y: a.top - b.top, width: a.width, height: a.height })
    }
    medir()
    const observador = new ResizeObserver(medir)
    if (caixaRef.current) observador.observe(caixaRef.current)
    document.fonts?.ready.then(medir)
    return () => observador.disconnect()
  }, [ativa])

  return (
    <div className="foco-true-focus" ref={caixaRef} onMouseLeave={() => setPausado(false)} aria-label={letras.join('.')}>
      {letras.map((letra, i) => (
        <span
          key={i}
          ref={(el) => {
            letrasRef.current[i] = el
          }}
          className={`foco-true-focus__letra ${i === ativa ? 'foco-true-focus__letra--ativa' : ''}`}
          onMouseEnter={() => {
            setPausado(true)
            setAtiva(i)
          }}
        >
          {letra}
        </span>
      ))}

      <motion.div
        className="foco-true-focus__moldura"
        animate={moldura}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        style={{ ['--cor-moldura' as string]: cores[ativa] ?? 'var(--gold)' }}
        aria-hidden="true"
      >
        <span className="foco-true-focus__canto foco-true-focus__canto--te" />
        <span className="foco-true-focus__canto foco-true-focus__canto--td" />
        <span className="foco-true-focus__canto foco-true-focus__canto--be" />
        <span className="foco-true-focus__canto foco-true-focus__canto--bd" />
      </motion.div>
    </div>
  )
}

export default TrueFocus
