import { useState } from 'react'
import TermosModal from './TermosModal'

interface SidebarProps {
  aberta: boolean
  onFechar: () => void
  onLogout: () => void
}

function Sidebar({ aberta, onFechar, onLogout }: SidebarProps) {
  const [modalTermosAberto, setModalTermosAberto] = useState(false)

  if (!aberta) return null

  return (
    <>
      {/* Fundo escurecido, clicável para fechar */}
      <div
        onClick={onFechar}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 998,
        }}
      />

      {/* Painel lateral */}
      <div
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
        }}
      >
        <h5 style={{ marginBottom: '1rem' }}>Menu</h5>

        <button className="btn btn-outline-light text-start" disabled>
          Editar Login
        </button>
        <button className="btn btn-outline-light text-start" disabled>
          Meus Focos
        </button>
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
      </div>

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