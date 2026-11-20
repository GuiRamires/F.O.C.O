import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface MensagemSucessoProps {
  children: ReactNode
}

function MensagemSucesso({ children }: MensagemSucessoProps) {
  return (
    <motion.div className="foco-sucesso" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
      <span className="foco-sucesso__icone" aria-hidden="true">
        ✓
      </span>
      {children}
    </motion.div>
  )
}

export default MensagemSucesso
