import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import TermosModal from './TermosModal'
import MarcaFoco from './components/MarcaFoco'

export type DestinoMenu = 'lista' | 'estatisticas' | 'conta' | 'suporte' | 'sobre'

interface SidebarProps {
  aberta: boolean
  nomeUsuario: string
  telaAtual: string
  onFechar: () => void
  onNavegar: (destino: DestinoMenu) => void
  onLogout: () => void
}

const ITENS: { destino: DestinoMenu; rotulo: string }[] = [
  { destino: 'lista', rotulo: 'Meus Focos' },
  { destino: 'estatisticas', rotulo: 'Estatísticas' },
  { destino: 'conta', rotulo: 'Minha conta' },
  { destino: 'suporte', rotulo: 'Suporte' },
  { destino: 'sobre', rotulo: 'Sobre nós' },
]

function Sidebar({ aberta, nomeUsuario, telaAtual, onFechar, onNavegar, onLogout }: SidebarProps) {
  const [modalTermosAberto, setModalTermosAberto] = useState(false)

  return (
    <>
      <AnimatePresence>
        {aberta && (
          <motion.div
            key="fundo"
            className="foco-menu-lateral__fundo"
            onClick={onFechar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
        {aberta && (
          <motion.nav
            key="menu"
            className="foco-menu-lateral"
            aria-label="Menu principal"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
          >
            <MarcaFoco className="foco-menu-lateral__marca" />
            <p className="foco-menu-lateral__ola">
              Olá, <strong>{nomeUsuario || 'estudante'}</strong>
            </p>

            {ITENS.map((item) => (
              <button
                key={item.destino}
                type="button"
                className={`foco-menu-lateral__item ${telaAtual === item.destino ? 'foco-menu-lateral__item--ativo' : ''}`}
                aria-current={telaAtual === item.destino ? 'page' : undefined}
                onClick={() => onNavegar(item.destino)}
              >
                {item.rotulo}
              </button>
            ))}
            <button type="button" className="foco-menu-lateral__item" onClick={() => setModalTermosAberto(true)}>
              Termos de Uso
            </button>

            <div className="foco-menu-lateral__espaco" />

            <button type="button" className="btn btn-warning" onClick={onLogout}>
              Sair
            </button>
          </motion.nav>
        )}
      </AnimatePresence>

      <TermosModal
        aberto={modalTermosAberto}
        onAceitar={() => setModalTermosAberto(false)}
        onFechar={() => setModalTermosAberto(false)}
        somenteLeitura
      />
    </>
  )
}

export default Sidebar
