import { motion } from 'motion/react'

interface BlurTextProps {
  texto: string
  como?: 'h1' | 'h2' | 'p'
  className?: string
  atraso?: number
}

function BlurText({ texto, como = 'h2', className, atraso = 0 }: BlurTextProps) {
  const Tag = motion[como]
  const palavras = texto.split(' ')

  return (
    <Tag
      className={className}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: 0.08, delayChildren: atraso }}
    >
      {palavras.map((palavra, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
          variants={{
            oculto: { opacity: 0, filter: 'blur(12px)', y: 16 },
            visivel: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          {palavra}
          {i < palavras.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Tag>
  )
}

export default BlurText
