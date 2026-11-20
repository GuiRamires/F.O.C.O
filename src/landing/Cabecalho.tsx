import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import MarcaFoco from '../components/MarcaFoco'
import { PAGINAS_DO_MENU, type PaginaPublica } from '../conteudo/site'

interface CabecalhoProps {
  paginaAtual: PaginaPublica | null
  semNavegacao?: boolean
  onNavegar: (pagina: PaginaPublica) => void
  onEntrar: () => void
  onCriarConta: () => void
}

function Cabecalho({ paginaAtual, semNavegacao = false, onNavegar, onEntrar, onCriarConta }: CabecalhoProps) {
  const [menuAberto, setMenuAberto] = useState(false)
  const [mostrarBarra, setMostrarBarra] = useState(false)

  useEffect(() => {
    const aoRolar = () => setMostrarBarra(window.scrollY > 500)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  if (semNavegacao) {
    return (
      <header className="foco-topo">
        <div className="foco-container foco-topo__conteudo">
          <MarcaFoco className="foco-topo__marca" />
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="foco-topo">
        <div className="foco-container foco-topo__conteudo">
          <button type="button" className="foco-topo__marca-botao" onClick={() => onNavegar('inicio')} aria-label="F.O.C.O: início">
            <MarcaFoco className="foco-topo__marca" />
          </button>

          <nav className={`foco-topo__links ${menuAberto ? 'foco-topo__links--aberto' : ''}`} aria-label="Principal">
            {PAGINAS_DO_MENU.map((item) => (
              <button
                key={item.pagina}
                type="button"
                className={`foco-topo__link ${paginaAtual === item.pagina ? 'foco-topo__link--ativo' : ''}`}
                aria-current={paginaAtual === item.pagina ? 'page' : undefined}
                onClick={() => {
                  setMenuAberto(false)
                  onNavegar(item.pagina)
                }}
              >
                {item.rotulo}
              </button>
            ))}
          </nav>

          <div className="foco-topo__acoes">
            <button type="button" className="foco-topo__entrar" onClick={onEntrar}>
              Entrar
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={onCriarConta}>
              Criar conta
            </button>
          </div>

          <button
            type="button"
            className={`foco-topo__hamburguer ${menuAberto ? 'foco-topo__hamburguer--aberto' : ''}`}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto((aberto) => !aberto)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mostrarBarra && (
          <motion.div
            className="foco-barra-flutuante"
            initial={{ y: -80, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: -80, opacity: 0, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <strong>F.O.C.O</strong>
            <div className="foco-barra-flutuante__acoes">
              <button type="button" className="btn btn-outline-light btn-sm" onClick={onEntrar}>
                Entrar
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={onCriarConta}>
                Criar conta
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Cabecalho
