import { useEffect, useRef } from 'react'
import './styles/menuAcoes.css'

export type IconeAcao = 'concentrar' | 'editar' | 'mover' | 'arquivar' | 'resgatar' | 'excluir'

export interface AcaoMenu {
  rotulo: string
  icone: IconeAcao
  aoEscolher: () => void
  variante?: 'secundario' | 'laboratorio' | 'perigo'
}

interface MenuAcoesFocoProps {
  acoes: AcaoMenu[]
  aviso?: string
  onFechar: () => void
}

function IconeDaAcao({ icone }: { icone: IconeAcao }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {icone === 'concentrar' && (
        <>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2 2M9 2h6" />
        </>
      )}
      {icone === 'editar' && <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />}
      {icone === 'mover' && <path d="M7 20V4M3 8l4-4 4 4M17 4v16M13 16l4 4 4-4" />}
      {icone === 'arquivar' && (
        <>
          <rect x="2" y="4" width="20" height="5" rx="1" />
          <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M10 13h4" />
        </>
      )}
      {icone === 'resgatar' && <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />}
      {icone === 'excluir' && <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />}
    </svg>
  )
}

function MenuAcoesFoco({ acoes, aviso, onFechar }: MenuAcoesFocoProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function fecharAoClicarFora(evento: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(evento.target as Node)) {
        onFechar()
      }
    }

    function fecharComEsc(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onFechar()
    }

    document.addEventListener('mousedown', fecharAoClicarFora)
    document.addEventListener('keydown', fecharComEsc)

    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora)
      document.removeEventListener('keydown', fecharComEsc)
    }
  }, [onFechar])

  return (
    <div
      ref={menuRef}
      className="menu-acoes"
      role="menu"
      onClick={(evento) => evento.stopPropagation()}
    >
      {acoes.map((acao) => (
        <button
          key={acao.rotulo}
          type="button"
          role="menuitem"
          className={`menu-acoes__item${acao.variante ? ` menu-acoes__item--${acao.variante}` : ''}`}
          onClick={acao.aoEscolher}
        >
          <span>{acao.rotulo}</span>
          <IconeDaAcao icone={acao.icone} />
        </button>
      ))}
      {aviso && <p className="menu-acoes__aviso">{aviso}</p>}
    </div>
  )
}

export default MenuAcoesFoco
