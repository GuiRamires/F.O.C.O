import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import MarcaFoco from './MarcaFoco'
import '../styles/acesso.css'

interface CartaoAcessoProps {
  titulo: string
  subtitulo?: ReactNode
  largo?: boolean
  children: ReactNode
}

function CartaoAcesso({ titulo, subtitulo, largo = false, children }: CartaoAcessoProps) {
  return (
    <section className="foco-acesso">
      <motion.div
        className={`foco-acesso__cartao ${largo ? 'foco-acesso__cartao--largo' : ''}`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <MarcaFoco className="foco-acesso__marca" />
        <h1 className="foco-acesso__titulo">{titulo}</h1>
        {subtitulo && <div className="foco-acesso__subtitulo">{subtitulo}</div>}
        {children}
      </motion.div>
    </section>
  )
}

export default CartaoAcesso
