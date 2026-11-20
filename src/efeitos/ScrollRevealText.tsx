import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'

interface ScrollRevealTextProps {
  texto: string
  className?: string
}

function Palavra({ children, progresso, faixa }: { children: string; progresso: MotionValue<number>; faixa: [number, number] }) {
  const opacidade = useTransform(progresso, faixa, [0.15, 1])
  const desfoque = useTransform(progresso, faixa, ['blur(6px)', 'blur(0px)'])
  return (
    <motion.span style={{ opacity: opacidade, filter: desfoque, display: 'inline-block', marginRight: '0.25em' }}>
      {children}
    </motion.span>
  )
}

function ScrollRevealText({ texto, className }: ScrollRevealTextProps) {
  const ref = useRef<HTMLHeadingElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.4'] })
  const palavras = texto.split(' ')

  return (
    <h2 ref={ref} className={className}>
      {palavras.map((palavra, i) => {
        const inicio = i / palavras.length
        return (
          <Palavra key={i} progresso={scrollYProgress} faixa={[inicio, inicio + 1 / palavras.length]}>
            {palavra}
          </Palavra>
        )
      })}
    </h2>
  )
}

export default ScrollRevealText
