import { useState } from 'react'
import TermosModal from './TermosModal'

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

  if (!aberta) return null

  return (
    <>
      <div
        onClick={onFechar}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 998,
        }}
      />

      <nav
        aria-label="Menu principal"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '260px',
          backgroundColor: '#1a1a1a',
          borderRight: '1px solid #333',
          zIndex: 999,
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          overflowY: 'auto',
        }}
      >
        <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
          Olá, <strong>{nomeUsuario || 'estudante'}</strong>
        </p>

        {ITENS.map((item) => (
          <button
            key={item.destino}
            className={`btn text-start ${telaAtual === item.destino ? 'btn-light' : 'btn-outline-light'}`}
            aria-current={telaAtual === item.destino ? 'page' : undefined}
            onClick={() => onNavegar(item.destino)}
          >
            {item.rotulo}
          </button>
        ))}
        <button
          className="btn btn-outline-light text-start"
          onClick={() => setModalTermosAberto(true)}
        >
          Termos de Uso
        </button>

        <div style={{ flex: 1 }} />

        <button className="btn btn-warning" onClick={onLogout}>
          Sair
        </button>
      </nav>

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
