import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import '../styles/acesso.css'

interface JanelaModalProps {
  aberto: boolean
  titulo: string
  onFechar?: () => void
  largura?: 'normal' | 'larga' | 'video'
  children: ReactNode
}

function JanelaModal({ aberto, titulo, onFechar, largura = 'normal', children }: JanelaModalProps) {
  useEffect(() => {
    if (!aberto) return
    const fecharComEsc = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onFechar?.()
    }
    document.addEventListener('keydown', fecharComEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', fecharComEsc)
      document.body.style.overflow = ''
    }
  }, [aberto, onFechar])

  return createPortal(
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="foco-modal__fundo"
          onClick={() => onFechar?.()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`foco-modal foco-modal--${largura}`}
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            onClick={(evento) => evento.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {onFechar && (
              <button type="button" className="foco-modal__fechar" onClick={onFechar} aria-label="Fechar">
                ×
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default JanelaModal
