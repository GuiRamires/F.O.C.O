import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface RevealProps {
  children: ReactNode
  atraso?: number
  className?: string
}

function Reveal({ children, atraso = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, delay: atraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default Reveal
