import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Cabecalho from './Cabecalho'
import Rodape from './Rodape'
import type { PaginaPublica } from '../conteudo/site'
import '../styles/site.css'

interface LayoutPublicoProps {
  chave: string
  paginaAtual: PaginaPublica | null
  semNavegacao?: boolean
  onNavegar: (pagina: PaginaPublica) => void
  onEntrar: () => void
  onCriarConta: () => void
  children: ReactNode
}

function LayoutPublico({ chave, paginaAtual, semNavegacao = false, onNavegar, onEntrar, onCriarConta, children }: LayoutPublicoProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [chave])

  return (
    <div className="foco-site">
      <Cabecalho
        paginaAtual={paginaAtual}
        semNavegacao={semNavegacao}
        onNavegar={onNavegar}
        onEntrar={onEntrar}
        onCriarConta={onCriarConta}
      />
      <AnimatePresence mode="wait">
        <motion.main
          key={chave}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.35 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {!semNavegacao && <Rodape onNavegar={onNavegar} onEntrar={onEntrar} onCriarConta={onCriarConta} />}
    </div>
  )
}

export default LayoutPublico
